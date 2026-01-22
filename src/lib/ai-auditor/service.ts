/**
 * AT5 AI Auditor - Core Service
 *
 * This module implements the main orchestration service for AI-driven
 * test execution. It coordinates between the LLM adapter, MCP client,
 * and the persistence layer.
 *
 * Architecture follows:
 * - SOLID principles
 * - Clean Architecture patterns
 * - Domain-Driven Design concepts
 * - ISO/IEC 29119-2 Test Process compliance
 *
 * @module ai-auditor/service
 * @version 1.0.0
 * @author AT5 Audit Platform
 * @license Proprietary
 */

import { EventEmitter } from 'events'
import { prisma } from '@/lib/prisma'
import {
  AIAuditorConfiguration,
  AIAuditMode,
  AIAuditRunStatus,
  AITestExecutionStatus,
  AIVerdict,
  AITestCaseInput,
  AITestAnalysis,
  AITestExecutionResult,
  AIAuditRunSummary,
  StepExecutionResult,
  MCPToolCall,
  ConfirmationType,
  ConfirmationRequest,
  ConfirmationResponseInput,
  AIAuditEventType,
  LogLevel,
} from './types'
import { MCPClient, ConnectionState } from './mcp-client'
import { ILLMAdapter, createLLMAdapter } from './llm-adapter'

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DELAY_BETWEEN_TESTS_MS = 2000
const MAX_CONFIRMATION_WAIT_MS = 300000 // 5 minutes
const CRITICAL_ACTIONS = ['write_signal', 'delete_device', 'stop_device', 'reset_device']

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Service events
 */
export interface AIAuditorServiceEvents {
  runStarted: (summary: AIAuditRunSummary) => void
  runProgress: (summary: AIAuditRunSummary) => void
  runCompleted: (summary: AIAuditRunSummary) => void
  runFailed: (summary: AIAuditRunSummary, error: Error) => void
  testStarted: (testId: string, testCode: string) => void
  testCompleted: (result: AITestExecutionResult) => void
  confirmationRequired: (request: ConfirmationRequest) => void
  log: (level: LogLevel, message: string, data?: unknown) => void
}

/**
 * Options for starting a run
 */
export interface StartRunOptions {
  sessionId: string
  mode: AIAuditMode
  testCaseIds?: string[]
  configId?: string
  supervisorId?: string
  stopOnCriticalFailure?: boolean
}

// ============================================================================
// AI AUDITOR SERVICE
// ============================================================================

/**
 * AIAuditorService - Main orchestration service
 *
 * Responsibilities:
 * - Manage audit run lifecycle
 * - Coordinate LLM and MCP interactions
 * - Handle test execution flow
 * - Manage human-in-the-loop confirmations
 * - Persist state and results
 *
 * @example
 * ```typescript
 * const service = new AIAuditorService(config)
 * await service.initialize()
 *
 * const runId = await service.startRun({
 *   sessionId: 'session-123',
 *   mode: 'SEMI_AUTOMATIC',
 * })
 *
 * service.on('testCompleted', (result) => {
 *   console.log(`Test ${result.testCaseId}: ${result.verdict}`)
 * })
 * ```
 */
export class AIAuditorService extends EventEmitter {
  private config: AIAuditorConfiguration
  private mcpClient: MCPClient
  private llmAdapter: ILLMAdapter
  private initialized: boolean = false

  // Current run state
  private currentRunId: string | null = null
  private runStatus: AIAuditRunStatus = 'PENDING'
  private isPaused: boolean = false
  private shouldStop: boolean = false

  // Confirmation handling
  private pendingConfirmations: Map<string, {
    request: ConfirmationRequest
    resolve: (response: ConfirmationResponseInput) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }> = new Map()

  constructor(config: AIAuditorConfiguration) {
    super()
    this.config = config
    this.mcpClient = new MCPClient(config.mcp)
    this.llmAdapter = createLLMAdapter(config)

    // Forward MCP client events
    this.mcpClient.on('log', (level, message, data) => {
      this.log(level, message, data)
    })
  }

  // ==========================================================================
  // LIFECYCLE METHODS
  // ==========================================================================

  /**
   * Initialize the service
   * Establishes connections and validates configuration
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    this.log('INFO', 'Initializing AI Auditor Service...')

    // Validate LLM configuration
    if (!this.llmAdapter.isConfigured()) {
      throw new Error(`LLM provider ${this.config.llm.provider} is not properly configured`)
    }

    // Connect to MCP server
    try {
      await this.mcpClient.connect()
      this.log('INFO', 'MCP connection established')
    } catch (error) {
      this.log('ERROR', `Failed to connect to MCP server: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }

    this.initialized = true
    this.log('INFO', 'AI Auditor Service initialized successfully')
  }

  /**
   * Shutdown the service gracefully
   */
  async shutdown(): Promise<void> {
    this.log('INFO', 'Shutting down AI Auditor Service...')

    // Cancel any running operations
    this.shouldStop = true

    // Clear pending confirmations
    for (const [id, pending] of this.pendingConfirmations) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('Service shutdown'))
    }
    this.pendingConfirmations.clear()

    // Disconnect MCP
    await this.mcpClient.disconnect()

    this.initialized = false
    this.log('INFO', 'AI Auditor Service shutdown complete')
  }

  // ==========================================================================
  // RUN MANAGEMENT
  // ==========================================================================

  /**
   * Start a new audit run
   */
  async startRun(options: StartRunOptions): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    if (this.currentRunId) {
      throw new Error('A run is already in progress')
    }

    this.log('INFO', `Starting AI Audit run for session ${options.sessionId}`)

    // Load test cases
    const testCases = await this.loadTestCases(options.sessionId, options.testCaseIds)

    if (testCases.length === 0) {
      throw new Error('No test cases found for execution')
    }

    // Create run record
    const run = await prisma.aIAuditRun.create({
      data: {
        sessionId: options.sessionId,
        configId: this.config.id,
        mode: options.mode,
        status: 'INITIALIZING',
        totalTests: testCases.length,
        completedTests: 0,
        passedTests: 0,
        failedTests: 0,
        blockedTests: 0,
        skippedTests: 0,
        supervisorId: options.supervisorId,
        stopOnCriticalFailure: options.stopOnCriticalFailure ?? this.config.execution.stopOnCriticalFailure,
      },
    })

    this.currentRunId = run.id
    this.runStatus = 'INITIALIZING'
    this.isPaused = false
    this.shouldStop = false

    // Emit run started event
    const summary = await this.getRunSummary(run.id)
    this.emit('runStarted', summary)

    // Start execution in background
    this.executeRun(run.id, testCases, options.mode).catch(error => {
      this.log('ERROR', `Run execution failed: ${error instanceof Error ? error.message : String(error)}`)
      this.emit('runFailed', summary, error instanceof Error ? error : new Error(String(error)))
    })

    return run.id
  }

  /**
   * Pause the current run
   */
  async pauseRun(): Promise<void> {
    if (!this.currentRunId) {
      throw new Error('No run in progress')
    }

    this.isPaused = true
    this.runStatus = 'PAUSED'

    await prisma.aIAuditRun.update({
      where: { id: this.currentRunId },
      data: { status: 'PAUSED' },
    })

    this.log('INFO', 'Run paused')
  }

  /**
   * Resume a paused run
   */
  async resumeRun(): Promise<void> {
    if (!this.currentRunId) {
      throw new Error('No run in progress')
    }

    this.isPaused = false
    this.runStatus = 'RUNNING'

    await prisma.aIAuditRun.update({
      where: { id: this.currentRunId },
      data: { status: 'RUNNING' },
    })

    this.log('INFO', 'Run resumed')
  }

  /**
   * Cancel the current run
   */
  async cancelRun(): Promise<void> {
    if (!this.currentRunId) {
      throw new Error('No run in progress')
    }

    this.shouldStop = true
    this.runStatus = 'CANCELLED'

    await prisma.aIAuditRun.update({
      where: { id: this.currentRunId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    })

    this.currentRunId = null
    this.log('INFO', 'Run cancelled')
  }

  /**
   * Get current run summary
   */
  async getRunSummary(runId?: string): Promise<AIAuditRunSummary | null> {
    const id = runId || this.currentRunId
    if (!id) return null

    const run = await prisma.aIAuditRun.findUnique({
      where: { id },
      include: {
        testExecutions: {
          orderBy: { sequenceNumber: 'asc' },
          take: 1,
          where: { status: { in: ['ANALYZING', 'PREPARING', 'EXECUTING', 'VALIDATING'] } },
        },
      },
    })

    if (!run) return null

    const currentExecution = run.testExecutions[0]
    const percentComplete = run.totalTests > 0
      ? Math.round((run.completedTests / run.totalTests) * 100)
      : 0

    return {
      id: run.id,
      runNumber: run.runNumber,
      sessionId: run.sessionId,
      status: run.status as AIAuditRunStatus,
      mode: run.mode as AIAuditMode,
      progress: {
        total: run.totalTests,
        completed: run.completedTests,
        passed: run.passedTests,
        failed: run.failedTests,
        blocked: run.blockedTests,
        skipped: run.skippedTests,
        pending: run.totalTests - run.completedTests,
        percentComplete,
      },
      currentTest: currentExecution ? {
        id: currentExecution.id,
        code: currentExecution.testCaseCode,
        name: '', // Would need join
        status: currentExecution.status as AITestExecutionStatus,
        currentStep: currentExecution.currentStep,
        totalSteps: currentExecution.totalSteps,
      } : undefined,
      metrics: {
        totalDurationMs: run.totalDurationMs || 0,
        avgTestDurationMs: run.completedTests > 0 ? (run.totalDurationMs || 0) / run.completedTests : 0,
        llmTokensUsed: run.llmTokensUsed,
        estimatedCost: run.estimatedCost.toNumber(),
      },
      startedAt: run.startedAt || undefined,
      estimatedCompletionAt: run.estimatedCompletionAt || undefined,
    }
  }

  // ==========================================================================
  // CONFIRMATION HANDLING
  // ==========================================================================

  /**
   * Submit a confirmation response
   */
  async submitConfirmation(response: ConfirmationResponseInput): Promise<void> {
    const pending = this.pendingConfirmations.get(response.requestId)

    if (!pending) {
      throw new Error('Confirmation request not found or expired')
    }

    clearTimeout(pending.timeout)
    this.pendingConfirmations.delete(response.requestId)

    // Update database
    await prisma.aIConfirmationRequest.update({
      where: { id: response.requestId },
      data: {
        response: response.response,
        respondedAt: new Date(),
        respondedById: response.respondedById,
        notes: response.notes,
      },
    })

    pending.resolve(response)
    this.log('INFO', `Confirmation received: ${response.response} for request ${response.requestId}`)
  }

  // ==========================================================================
  // PRIVATE METHODS - RUN EXECUTION
  // ==========================================================================

  /**
   * Execute the full audit run
   */
  private async executeRun(
    runId: string,
    testCases: AITestCaseInput[],
    mode: AIAuditMode
  ): Promise<void> {
    this.runStatus = 'RUNNING'

    await prisma.aIAuditRun.update({
      where: { id: runId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    })

    let sequence = 0
    const results: AITestExecutionResult[] = []

    for (const testCase of testCases) {
      // Check for pause/stop
      while (this.isPaused && !this.shouldStop) {
        await this.delay(1000)
      }

      if (this.shouldStop) {
        break
      }

      sequence++
      this.emit('testStarted', testCase.id, testCase.code)

      try {
        const result = await this.executeTestCase(runId, testCase, sequence, mode)
        results.push(result)

        // Update run progress
        await this.updateRunProgress(runId, result)

        this.emit('testCompleted', result)

        // Check for critical failure
        if (
          result.verdict === 'FAIL' &&
          testCase.priority === 'CRITICAL' &&
          this.config.execution.stopOnCriticalFailure
        ) {
          this.log('WARNING', `Critical test ${testCase.code} failed. Stopping run.`)
          this.shouldStop = true
        }

        // Delay between tests
        if (!this.shouldStop && sequence < testCases.length) {
          await this.delay(this.config.execution.delayBetweenTestsMs)
        }

      } catch (error) {
        this.log('ERROR', `Test ${testCase.code} execution error: ${error instanceof Error ? error.message : String(error)}`)

        // Create failed result
        const failedResult: AITestExecutionResult = {
          testCaseId: testCase.id,
          runId,
          sequenceNumber: sequence,
          status: 'FAILED',
          verdict: 'BLOCKED',
          confidence: 0,
          analysis: {
            testCaseId: testCase.id,
            interpretation: '',
            preconditionAnalysis: { understood: false, mcpSetupRequired: [], manualSetupRequired: [] },
            executionPlan: [],
            expectedValidation: { criteria: [], mcpValidationCalls: [] },
            estimatedDurationMs: 0,
            confidenceScore: 0,
            warnings: ['Execution error'],
          },
          stepResults: [],
          actualResult: `Error: ${error instanceof Error ? error.message : String(error)}`,
          reasoning: 'Execution failed due to unexpected error',
          metrics: {
            totalDurationMs: 0,
            mcpCallsCount: 0,
            llmTokensUsed: 0,
            llmCost: 0,
          },
          errors: [{
            type: 'EXECUTION_ERROR',
            message: error instanceof Error ? error.message : String(error),
            recoverable: false,
          }],
          evidences: [],
          startedAt: new Date(),
          completedAt: new Date(),
        }

        await this.updateRunProgress(runId, failedResult)
        results.push(failedResult)
      }
    }

    // Complete the run
    const finalStatus: AIAuditRunStatus = this.shouldStop ? 'CANCELLED' : 'COMPLETED'
    await prisma.aIAuditRun.update({
      where: { id: runId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      },
    })

    this.runStatus = finalStatus
    this.currentRunId = null

    const summary = await this.getRunSummary(runId)
    if (summary) {
      this.emit('runCompleted', summary)
    }

    this.log('INFO', `Run ${runId} completed with status: ${finalStatus}`)
  }

  /**
   * Execute a single test case
   */
  private async executeTestCase(
    runId: string,
    testCase: AITestCaseInput,
    sequence: number,
    mode: AIAuditMode
  ): Promise<AITestExecutionResult> {
    const startTime = Date.now()
    let totalTokens = 0
    const stepResults: StepExecutionResult[] = []

    // Create execution record
    const execution = await prisma.aITestExecution.create({
      data: {
        runId,
        testCaseId: testCase.id,
        testCaseCode: testCase.code,
        sequenceNumber: sequence,
        status: 'ANALYZING',
        totalSteps: testCase.steps.length,
        currentStep: 0,
      },
    })

    try {
      // Phase 1: Analyze test case
      this.log('DEBUG', `Analyzing test case: ${testCase.code}`)
      const analysis = await this.llmAdapter.analyzeTestCase(testCase)

      await prisma.aITestExecution.update({
        where: { id: execution.id },
        data: {
          status: 'PREPARING',
          analysisJson: JSON.stringify(analysis),
        },
      })

      // Phase 2: Generate execution plan
      const availableTools = this.mcpClient.getAvailableTools().map(t => t.name)
      const executionPlan = await this.llmAdapter.generateExecutionPlan(testCase, availableTools)

      // Phase 3: Execute each step
      await prisma.aITestExecution.update({
        where: { id: execution.id },
        data: { status: 'EXECUTING' },
      })

      for (const step of executionPlan) {
        // Check for pause/stop
        while (this.isPaused && !this.shouldStop) {
          await this.delay(1000)
        }

        if (this.shouldStop) {
          break
        }

        await prisma.aITestExecution.update({
          where: { id: execution.id },
          data: { currentStep: step.stepNumber },
        })

        const stepResult = await this.executeStep(execution.id, step, mode)
        stepResults.push(stepResult)

        if (stepResult.status === 'failed' || stepResult.status === 'blocked') {
          // Stop on first failure in strict mode
          if (mode === 'AUTOMATIC') {
            break
          }
        }
      }

      // Phase 4: Validate and interpret results
      await prisma.aITestExecution.update({
        where: { id: execution.id },
        data: { status: 'VALIDATING' },
      })

      const interpretation = await this.llmAdapter.interpretResults(
        testCase,
        stepResults.map(r => ({
          stepNumber: r.stepNumber,
          actualOutcome: r.actualOutcome,
          success: r.status === 'success',
        })),
        testCase.expectedResult
      )

      const endTime = Date.now()
      const totalDurationMs = endTime - startTime

      // Build final result
      const result: AITestExecutionResult = {
        testCaseId: testCase.id,
        runId,
        sequenceNumber: sequence,
        status: 'COMPLETED',
        verdict: interpretation.verdict,
        confidence: interpretation.confidence,
        analysis,
        stepResults,
        actualResult: stepResults.map(r => r.actualOutcome).join('\n'),
        reasoning: interpretation.reasoning,
        metrics: {
          totalDurationMs,
          mcpCallsCount: stepResults.reduce((sum, r) => sum + r.mcpCalls.length, 0),
          llmTokensUsed: totalTokens,
          llmCost: this.calculateLLMCost(totalTokens),
        },
        errors: [],
        evidences: [],
        startedAt: new Date(startTime),
        completedAt: new Date(endTime),
      }

      // Update execution record
      await prisma.aITestExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          verdict: interpretation.verdict,
          confidence: interpretation.confidence,
          reasoning: interpretation.reasoning,
          actualResult: result.actualResult,
          durationMs: totalDurationMs,
          mcpCallsCount: result.metrics.mcpCallsCount,
          llmTokensUsed: totalTokens,
          completedAt: new Date(),
          stepResultsJson: JSON.stringify(stepResults),
        },
      })

      return result

    } catch (error) {
      await prisma.aITestExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          verdict: 'BLOCKED',
          errorJson: JSON.stringify({
            type: 'EXECUTION_ERROR',
            message: error instanceof Error ? error.message : String(error),
          }),
          completedAt: new Date(),
        },
      })

      throw error
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    executionId: string,
    step: {
      stepNumber: number
      description: string
      mcpCalls: MCPToolCall[]
      validationCriteria: string[]
      requiresConfirmation: boolean
    },
    mode: AIAuditMode
  ): Promise<StepExecutionResult> {
    const startTime = Date.now()
    const mcpCallResults: Array<{ call: MCPToolCall; response: { success: boolean; result?: unknown; error?: string; durationMs: number; timestamp: Date; tool: string } }> = []

    // Check if confirmation is needed
    const requiresConfirmation = step.requiresConfirmation ||
      step.mcpCalls.some(call => CRITICAL_ACTIONS.includes(call.tool))

    if (requiresConfirmation && mode !== 'AUTOMATIC') {
      // Request human confirmation
      const confirmation = await this.requestConfirmation({
        runId: this.currentRunId!,
        testExecutionId: executionId,
        type: 'ACTION_APPROVAL',
        action: step.description,
        parameters: { mcpCalls: step.mcpCalls },
        context: `Step ${step.stepNumber}: ${step.description}`,
      })

      if (confirmation.response === 'REJECT') {
        return {
          stepNumber: step.stepNumber,
          status: 'skipped',
          mcpCalls: [],
          actualOutcome: 'Step skipped by user',
          matchesExpected: false,
          notes: confirmation.notes,
          durationMs: Date.now() - startTime,
        }
      }

      if (confirmation.response === 'MANUAL') {
        return {
          stepNumber: step.stepNumber,
          status: 'blocked',
          mcpCalls: [],
          actualOutcome: 'Manual intervention required',
          matchesExpected: false,
          notes: confirmation.notes,
          durationMs: Date.now() - startTime,
        }
      }
    }

    // Execute MCP calls
    let hasFailure = false

    for (const call of step.mcpCalls) {
      const response = await this.mcpClient.callTool(call)
      mcpCallResults.push({ call, response })

      if (!response.success) {
        hasFailure = true
        // In dry-run mode, continue even on failures
        if (mode !== 'DRY_RUN') {
          break
        }
      }
    }

    const actualOutcome = mcpCallResults.map(r =>
      r.response.success
        ? `${r.call.tool}: ${JSON.stringify(r.response.result)}`
        : `${r.call.tool}: ERROR - ${r.response.error}`
    ).join('\n')

    return {
      stepNumber: step.stepNumber,
      status: hasFailure ? 'failed' : 'success',
      mcpCalls: mcpCallResults,
      actualOutcome,
      matchesExpected: !hasFailure, // Simplified; real validation would be more complex
      durationMs: Date.now() - startTime,
    }
  }

  /**
   * Request human confirmation
   */
  private async requestConfirmation(options: {
    runId: string
    testExecutionId?: string
    type: ConfirmationType
    action: string
    parameters: Record<string, unknown>
    context: string
  }): Promise<ConfirmationResponseInput> {
    const expiresAt = new Date(Date.now() + MAX_CONFIRMATION_WAIT_MS)

    // Create confirmation request in database
    const request = await prisma.aIConfirmationRequest.create({
      data: {
        runId: options.runId,
        testExecutionId: options.testExecutionId,
        type: options.type,
        action: options.action,
        parametersJson: JSON.stringify(options.parameters),
        context: options.context,
        aiExplanation: `The AI agent requires confirmation to proceed with: ${options.action}`,
        expiresAt,
        status: 'PENDING',
      },
    })

    // Update run status
    await prisma.aIAuditRun.update({
      where: { id: options.runId },
      data: {
        status: 'WAITING_CONFIRMATION',
        pendingConfirmationId: request.id,
      },
    })

    this.runStatus = 'WAITING_CONFIRMATION'

    const confirmationRequest: ConfirmationRequest = {
      id: request.id,
      runId: options.runId,
      testExecutionId: options.testExecutionId,
      type: options.type,
      action: options.action,
      parameters: options.parameters,
      context: options.context,
      aiExplanation: request.aiExplanation,
      expiresAt,
      createdAt: request.createdAt,
    }

    this.emit('confirmationRequired', confirmationRequest)

    // Wait for response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingConfirmations.delete(request.id)
        reject(new Error('Confirmation timeout'))
      }, MAX_CONFIRMATION_WAIT_MS)

      this.pendingConfirmations.set(request.id, {
        request: confirmationRequest,
        resolve: (response) => {
          resolve(response)
          // Restore run status
          prisma.aIAuditRun.update({
            where: { id: options.runId },
            data: {
              status: 'RUNNING',
              pendingConfirmationId: null,
            },
          }).then(() => {
            this.runStatus = 'RUNNING'
          })
        },
        reject,
        timeout,
      })
    })
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Load test cases for a session
   */
  private async loadTestCases(
    sessionId: string,
    testCaseIds?: string[]
  ): Promise<AITestCaseInput[]> {
    const session = await prisma.auditSession.findUnique({
      where: { id: sessionId },
      include: {
        testPlan: {
          include: {
            testSuites: {
              include: {
                testCases: {
                  where: testCaseIds ? { id: { in: testCaseIds } } : undefined,
                  orderBy: [
                    { priority: 'asc' },
                    { code: 'asc' },
                  ],
                  include: {
                    testSuite: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Flatten test cases from all suites
    const allTestCases = session.testPlan.testSuites.flatMap(suite => suite.testCases)

    return allTestCases.map(tc => ({
      id: tc.id,
      code: tc.code,
      name: tc.name,
      description: tc.description || undefined,
      preconditions: tc.preconditions || undefined,
      steps: this.parseSteps(tc.steps),
      expectedResult: tc.expectedResult,
      priority: tc.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      testType: tc.testType,
      estimatedTimeMinutes: tc.estimatedTime || undefined,
      suiteId: tc.testSuiteId,
      suiteName: tc.testSuite.name,
    }))
  }

  /**
   * Parse test steps from string format
   */
  private parseSteps(stepsText: string): Array<{ number: number; description: string; expectedOutcome?: string }> {
    const lines = stepsText.split('\n').filter(l => l.trim())
    return lines.map((line, index) => {
      const match = line.match(/^(\d+)\.\s*(.+)$/)
      if (match) {
        return {
          number: parseInt(match[1], 10),
          description: match[2],
        }
      }
      return {
        number: index + 1,
        description: line.trim(),
      }
    })
  }

  /**
   * Update run progress after test completion
   */
  private async updateRunProgress(runId: string, result: AITestExecutionResult): Promise<void> {
    const updateData: Record<string, unknown> = {
      completedTests: { increment: 1 },
      totalDurationMs: { increment: result.metrics.totalDurationMs },
      llmTokensUsed: { increment: result.metrics.llmTokensUsed },
      estimatedCost: { increment: result.metrics.llmCost },
    }

    switch (result.verdict) {
      case 'PASS':
        updateData.passedTests = { increment: 1 }
        break
      case 'FAIL':
        updateData.failedTests = { increment: 1 }
        break
      case 'BLOCKED':
        updateData.blockedTests = { increment: 1 }
        break
      default:
        updateData.skippedTests = { increment: 1 }
    }

    await prisma.aIAuditRun.update({
      where: { id: runId },
      data: updateData,
    })

    const summary = await this.getRunSummary(runId)
    if (summary) {
      this.emit('runProgress', summary)
    }
  }

  /**
   * Calculate LLM cost based on tokens
   */
  private calculateLLMCost(tokens: number): number {
    const cost = this.llmAdapter.getEstimatedCost()
    // Rough estimate: 50/50 split between input and output
    return (tokens / 2000) * (cost.inputPer1K + cost.outputPer1K)
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    this.emit('log', level, `[AIAuditorService] ${message}`, data)
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create an AI Auditor service from database configuration
 */
export async function createAIAuditorService(configId: string): Promise<AIAuditorService> {
  const dbConfig = await prisma.aIAuditorConfig.findUnique({
    where: { id: configId },
  })

  if (!dbConfig) {
    throw new Error(`AI Auditor configuration ${configId} not found`)
  }

  if (!dbConfig.isActive) {
    throw new Error(`AI Auditor configuration ${configId} is not active`)
  }

  const config: AIAuditorConfiguration = {
    id: dbConfig.id,
    name: dbConfig.name,
    description: dbConfig.description || undefined,
    isActive: dbConfig.isActive,
    llm: {
      provider: dbConfig.llmProvider as AIAuditorConfiguration['llm']['provider'],
      model: dbConfig.llmModel,
      temperature: dbConfig.llmTemperature,
      maxTokens: dbConfig.llmMaxTokens,
      apiKey: process.env[`${dbConfig.llmProvider}_API_KEY`],
    },
    mcp: {
      connectionType: dbConfig.mcpConnectionType as AIAuditorConfiguration['mcp']['connectionType'],
      host: dbConfig.mcpServerHost,
      port: dbConfig.mcpServerPort,
      pipeName: dbConfig.mcpPipeName,
      timeoutMs: dbConfig.mcpTimeoutMs,
    },
    execution: {
      maxConcurrentTests: dbConfig.maxConcurrentTests,
      delayBetweenTestsMs: dbConfig.delayBetweenTestsMs,
      maxRetries: dbConfig.maxRetries,
      retryDelayMs: dbConfig.retryDelayMs,
      stopOnCriticalFailure: dbConfig.stopOnCriticalFailure,
      actionsRequiringConfirmation: JSON.parse(dbConfig.actionsRequiringConfirmation) as string[],
    },
    evidence: {
      captureScreenshots: dbConfig.captureScreenshots,
      captureLogs: dbConfig.captureLogs,
      captureApiResponses: dbConfig.captureApiResponses,
    },
  }

  return new AIAuditorService(config)
}

