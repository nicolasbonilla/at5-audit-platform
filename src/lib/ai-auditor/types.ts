/**
 * AT5 AI Auditor - Type Definitions
 *
 * This module defines the core types and interfaces for the AI Auditor system.
 * Designed following ISO/IEC/IEEE 29119-2 (Test Processes) and IEEE 829 standards.
 *
 * @module ai-auditor/types
 * @version 1.0.0
 * @author AT5 Audit Platform
 * @license Proprietary
 */

import { z } from 'zod'

// ============================================================================
// ENUMERATIONS
// Following ISO/IEC 25010 quality model for status classifications
// ============================================================================

/**
 * LLM Provider enumeration
 * Supports multiple AI providers for flexibility and redundancy
 */
export const LLMProviderEnum = {
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
  GOOGLE_GEMINI: 'GOOGLE_GEMINI',
  MISTRAL: 'MISTRAL',
  OLLAMA: 'OLLAMA',
  DEEPSEEK: 'DEEPSEEK',
  AZURE_OPENAI: 'AZURE_OPENAI',
} as const

export type LLMProvider = keyof typeof LLMProviderEnum

/**
 * MCP Connection types supported by AT5
 */
export const MCPConnectionTypeEnum = {
  NAMED_PIPE: 'NAMED_PIPE',
  HTTP: 'HTTP',
  STDIO: 'STDIO',
  WEBSOCKET: 'WEBSOCKET',
} as const

export type MCPConnectionType = keyof typeof MCPConnectionTypeEnum

/**
 * AI Audit Run Status following test execution lifecycle
 */
export const AIAuditRunStatusEnum = {
  PENDING: 'PENDING',
  INITIALIZING: 'INITIALIZING',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  WAITING_CONFIRMATION: 'WAITING_CONFIRMATION',
  COMPLETING: 'COMPLETING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  TIMEOUT: 'TIMEOUT',
} as const

export type AIAuditRunStatus = keyof typeof AIAuditRunStatusEnum

/**
 * Execution modes for AI Auditor
 */
export const AIAuditModeEnum = {
  AUTOMATIC: 'AUTOMATIC',
  SEMI_AUTOMATIC: 'SEMI_AUTOMATIC',
  ASSISTED: 'ASSISTED',
  DRY_RUN: 'DRY_RUN',
} as const

export type AIAuditMode = keyof typeof AIAuditModeEnum

/**
 * Individual test execution status
 */
export const AITestExecutionStatusEnum = {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  PREPARING: 'PREPARING',
  EXECUTING: 'EXECUTING',
  VALIDATING: 'VALIDATING',
  WAITING_CONFIRMATION: 'WAITING_CONFIRMATION',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  BLOCKED: 'BLOCKED',
  TIMEOUT: 'TIMEOUT',
} as const

export type AITestExecutionStatus = keyof typeof AITestExecutionStatusEnum

/**
 * AI Verdict for test results
 */
export const AIVerdictEnum = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  BLOCKED: 'BLOCKED',
  INCONCLUSIVE: 'INCONCLUSIVE',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
} as const

export type AIVerdict = keyof typeof AIVerdictEnum

/**
 * Confirmation types for human-in-the-loop
 */
export const ConfirmationTypeEnum = {
  ACTION_APPROVAL: 'ACTION_APPROVAL',
  RESULT_VALIDATION: 'RESULT_VALIDATION',
  PRECONDITION_OVERRIDE: 'PRECONDITION_OVERRIDE',
  CONTINUE_ON_ERROR: 'CONTINUE_ON_ERROR',
  MANUAL_INTERVENTION: 'MANUAL_INTERVENTION',
} as const

export type ConfirmationType = keyof typeof ConfirmationTypeEnum

/**
 * Log levels following RFC 5424 Syslog severity
 */
export const LogLevelEnum = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const

export type LogLevel = keyof typeof LogLevelEnum

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * AI Auditor Configuration
 * Immutable configuration snapshot for audit traceability
 */
export interface AIAuditorConfiguration {
  id: string
  name: string
  description?: string
  isActive: boolean

  // LLM Configuration
  llm: {
    provider: LLMProvider
    model: string
    temperature: number
    maxTokens: number
    apiKey?: string // Not persisted, loaded from env
  }

  // MCP Configuration
  mcp: {
    connectionType: MCPConnectionType
    host: string
    port: number
    pipeName: string
    timeoutMs: number
  }

  // Execution Configuration
  execution: {
    maxConcurrentTests: number
    delayBetweenTestsMs: number
    maxRetries: number
    retryDelayMs: number
    stopOnCriticalFailure: boolean
    actionsRequiringConfirmation: string[]
  }

  // Evidence Configuration
  evidence: {
    captureScreenshots: boolean
    captureLogs: boolean
    captureApiResponses: boolean
  }
}

/**
 * Test Case representation for AI processing
 */
export interface AITestCaseInput {
  id: string
  code: string
  name: string
  description?: string
  preconditions?: string
  steps: TestStep[]
  expectedResult: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  testType: string
  estimatedTimeMinutes?: number
  suiteId: string
  suiteName: string
}

/**
 * Parsed test step
 */
export interface TestStep {
  number: number
  description: string
  expectedOutcome?: string
  mcpToolHint?: string // Optional hint for which MCP tool to use
}

/**
 * AI Analysis of a test case
 */
export interface AITestAnalysis {
  testCaseId: string
  interpretation: string
  preconditionAnalysis: {
    understood: boolean
    mcpSetupRequired: MCPToolCall[]
    manualSetupRequired: string[]
  }
  executionPlan: AIExecutionStep[]
  expectedValidation: {
    criteria: string[]
    mcpValidationCalls: MCPToolCall[]
  }
  estimatedDurationMs: number
  confidenceScore: number
  warnings: string[]
}

/**
 * Planned execution step
 */
export interface AIExecutionStep {
  stepNumber: number
  description: string
  mcpCalls: MCPToolCall[]
  validationCriteria: string[]
  requiresConfirmation: boolean
  fallbackStrategy?: string
}

/**
 * MCP Tool Call definition
 */
export interface MCPToolCall {
  tool: string
  parameters: Record<string, unknown>
  expectedResponse?: string
  timeout?: number
  retryOnFailure?: boolean
}

/**
 * MCP Tool Response
 */
export interface MCPToolResponse {
  success: boolean
  tool: string
  result?: unknown
  error?: string
  durationMs: number
  timestamp: Date
}

/**
 * Step Execution Result
 */
export interface StepExecutionResult {
  stepNumber: number
  status: 'success' | 'failed' | 'skipped' | 'blocked'
  mcpCalls: Array<{
    call: MCPToolCall
    response: MCPToolResponse
  }>
  actualOutcome: string
  matchesExpected: boolean
  notes?: string
  durationMs: number
}

/**
 * Complete Test Execution Result
 */
export interface AITestExecutionResult {
  testCaseId: string
  runId: string
  sequenceNumber: number

  status: AITestExecutionStatus
  verdict: AIVerdict
  confidence: number

  analysis: AITestAnalysis
  stepResults: StepExecutionResult[]

  actualResult: string
  reasoning: string

  metrics: {
    totalDurationMs: number
    mcpCallsCount: number
    llmTokensUsed: number
    llmCost: number
  }

  errors: Array<{
    type: string
    message: string
    step?: number
    recoverable: boolean
  }>

  evidences: string[]

  startedAt: Date
  completedAt: Date
}

/**
 * AI Audit Run Summary
 */
export interface AIAuditRunSummary {
  id: string
  runNumber: number
  sessionId: string
  status: AIAuditRunStatus
  mode: AIAuditMode

  progress: {
    total: number
    completed: number
    passed: number
    failed: number
    blocked: number
    skipped: number
    pending: number
    percentComplete: number
  }

  currentTest?: {
    id: string
    code: string
    name: string
    status: AITestExecutionStatus
    currentStep: number
    totalSteps: number
  }

  pendingConfirmation?: {
    id: string
    type: ConfirmationType
    action: string
    expiresAt: Date
  }

  metrics: {
    totalDurationMs: number
    avgTestDurationMs: number
    llmTokensUsed: number
    estimatedCost: number
  }

  startedAt?: Date
  estimatedCompletionAt?: Date
}

/**
 * Confirmation Request
 */
export interface ConfirmationRequest {
  id: string
  runId: string
  testExecutionId?: string
  type: ConfirmationType
  action: string
  parameters: Record<string, unknown>
  context: string
  aiExplanation: string
  expiresAt: Date
  createdAt: Date
}

/**
 * Confirmation Response
 */
export interface ConfirmationResponseInput {
  requestId: string
  response: 'APPROVE' | 'REJECT' | 'SKIP' | 'RETRY' | 'MANUAL'
  notes?: string
  respondedById: string
}

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// Using Zod for runtime validation
// ============================================================================

/**
 * Schema for starting an AI Audit Run
 */
export const startAIAuditRunSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  mode: z.enum(['AUTOMATIC', 'SEMI_AUTOMATIC', 'ASSISTED', 'DRY_RUN']).default('SEMI_AUTOMATIC'),
  configId: z.string().min(1, 'Configuration ID is required').optional(),
  testCaseIds: z.array(z.string()).optional(), // null = all test cases
  options: z.object({
    stopOnCriticalFailure: z.boolean().default(true),
    maxRetries: z.number().int().min(0).max(10).default(3),
    delayBetweenTestsMs: z.number().int().min(0).max(60000).default(2000),
    supervisorId: z.string().optional(),
  }).optional(),
})

export type StartAIAuditRunInput = z.infer<typeof startAIAuditRunSchema>

/**
 * Schema for AI Auditor configuration
 */
export const aiAuditorConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),

  llmProvider: z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE_GEMINI', 'MISTRAL', 'OLLAMA', 'DEEPSEEK', 'AZURE_OPENAI']).default('OPENAI'),
  llmModel: z.string().min(1).default('gpt-4o'),
  llmTemperature: z.number().min(0).max(2).default(0.1),
  llmMaxTokens: z.number().int().min(100).max(128000).default(4096),

  mcpServerHost: z.string().default('localhost'),
  mcpServerPort: z.number().int().min(1).max(65535).default(3001),
  mcpConnectionType: z.enum(['NAMED_PIPE', 'HTTP', 'STDIO', 'WEBSOCKET']).default('NAMED_PIPE'),
  mcpPipeName: z.string().default('AT5_MCP_PIPE'),
  mcpTimeoutMs: z.number().int().min(1000).max(300000).default(30000),

  maxConcurrentTests: z.number().int().min(1).max(10).default(1),
  delayBetweenTestsMs: z.number().int().min(0).max(60000).default(2000),
  maxRetries: z.number().int().min(0).max(10).default(3),
  retryDelayMs: z.number().int().min(0).max(60000).default(5000),
  stopOnCriticalFailure: z.boolean().default(true),

  actionsRequiringConfirmation: z.array(z.string()).default(['write_signal', 'delete_device', 'stop_device']),

  captureScreenshots: z.boolean().default(true),
  captureLogs: z.boolean().default(true),
  captureApiResponses: z.boolean().default(true),

  organizationId: z.string().min(1),
})

export type AIAuditorConfigInput = z.infer<typeof aiAuditorConfigSchema>

/**
 * Schema for confirmation response
 */
export const confirmationResponseSchema = z.object({
  requestId: z.string().min(1),
  response: z.enum(['APPROVE', 'REJECT', 'SKIP', 'RETRY', 'MANUAL']),
  notes: z.string().max(1000).optional(),
})

export type ConfirmationResponseInputSchema = z.infer<typeof confirmationResponseSchema>

// ============================================================================
// EVENT TYPES
// For real-time updates via WebSocket or SSE
// ============================================================================

/**
 * Event types for real-time updates
 */
export const AIAuditEventType = {
  RUN_STARTED: 'ai_audit:run_started',
  RUN_PROGRESS: 'ai_audit:run_progress',
  RUN_PAUSED: 'ai_audit:run_paused',
  RUN_RESUMED: 'ai_audit:run_resumed',
  RUN_COMPLETED: 'ai_audit:run_completed',
  RUN_FAILED: 'ai_audit:run_failed',

  TEST_STARTED: 'ai_audit:test_started',
  TEST_STEP_COMPLETED: 'ai_audit:test_step_completed',
  TEST_COMPLETED: 'ai_audit:test_completed',

  CONFIRMATION_REQUIRED: 'ai_audit:confirmation_required',
  CONFIRMATION_RECEIVED: 'ai_audit:confirmation_received',
  CONFIRMATION_EXPIRED: 'ai_audit:confirmation_expired',

  MCP_CALL: 'ai_audit:mcp_call',
  MCP_RESPONSE: 'ai_audit:mcp_response',

  LOG_ENTRY: 'ai_audit:log_entry',
  ERROR: 'ai_audit:error',
} as const

export type AIAuditEventType = typeof AIAuditEventType[keyof typeof AIAuditEventType]

/**
 * Base event structure
 */
export interface AIAuditEvent<T = unknown> {
  type: AIAuditEventType
  runId: string
  timestamp: Date
  data: T
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
