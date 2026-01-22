/**
 * AT5 AI Auditor - LLM Adapter
 *
 * This module implements a unified interface for multiple LLM providers,
 * following the Adapter Pattern for provider interchangeability.
 *
 * Supported Providers:
 * - OpenAI (GPT-4, GPT-4o, etc.)
 * - Anthropic (Claude)
 * - Google (Gemini)
 * - Mistral
 * - Ollama (local models)
 * - DeepSeek
 * - Azure OpenAI
 *
 * @module ai-auditor/llm-adapter
 * @version 1.0.0
 * @author AT5 Audit Platform
 * @license Proprietary
 */

import {
  LLMProvider,
  AIAuditorConfiguration,
  AITestCaseInput,
  AITestAnalysis,
  AIExecutionStep,
  MCPToolCall,
  LogLevel,
} from './types'

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Message structure for LLM communication
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  name?: string
  functionCall?: {
    name: string
    arguments: string
  }
}

/**
 * LLM Response structure
 */
export interface LLMResponse {
  content: string
  finishReason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'error'
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  latencyMs: number
}

/**
 * LLM Function definition for function calling
 */
export interface LLMFunction {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description?: string
      enum?: string[]
    }>
    required?: string[]
  }
}

/**
 * Options for LLM completion
 */
export interface LLMCompletionOptions {
  temperature?: number
  maxTokens?: number
  functions?: LLMFunction[]
  functionCall?: 'auto' | 'none' | { name: string }
  stopSequences?: string[]
  responseFormat?: 'text' | 'json'
}

/**
 * LLM Adapter interface
 * All provider implementations must conform to this interface
 */
export interface ILLMAdapter {
  readonly provider: LLMProvider
  readonly model: string

  /**
   * Send a completion request to the LLM
   */
  complete(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse>

  /**
   * Parse a test case and generate analysis
   */
  analyzeTestCase(testCase: AITestCaseInput): Promise<AITestAnalysis>

  /**
   * Generate execution plan for a test step
   */
  generateExecutionPlan(
    testCase: AITestCaseInput,
    availableTools: string[]
  ): Promise<AIExecutionStep[]>

  /**
   * Interpret test results and generate verdict
   */
  interpretResults(
    testCase: AITestCaseInput,
    stepResults: Array<{
      stepNumber: number
      actualOutcome: string
      success: boolean
    }>,
    expectedResult: string
  ): Promise<{
    verdict: 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE' | 'NEEDS_REVIEW'
    confidence: number
    reasoning: string
  }>

  /**
   * Check if the adapter is properly configured
   */
  isConfigured(): boolean

  /**
   * Get estimated cost per 1000 tokens
   */
  getEstimatedCost(): {
    inputPer1K: number
    outputPer1K: number
    currency: string
  }
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const SYSTEM_PROMPTS = {
  TEST_ANALYZER: `You are an expert test analyst for industrial automation systems.
Your role is to analyze test cases and create detailed execution plans.

You must:
1. Understand the test objective and preconditions
2. Identify which MCP tools are needed for each step
3. Define clear validation criteria
4. Consider edge cases and potential failures

Respond in JSON format following the specified schema.
Be precise and technical in your analysis.`,

  EXECUTION_PLANNER: `You are an expert test execution planner for SCADA/HMI systems.
Given a test case and available MCP tools, create a detailed execution plan.

Each step must include:
- Specific MCP tool calls with parameters
- Expected outcomes
- Validation criteria
- Whether human confirmation is needed

Available tool categories:
- Device management: list_devices, get_device_status, start_device, stop_device
- Signal operations: read_signals, write_signal, batch_read_signals
- Alarm management: get_alarms, acknowledge_alarm
- System operations: get_system_status, ping

Respond in JSON format.`,

  RESULT_INTERPRETER: `You are an expert test result analyst.
Given the test case definition and actual execution results, determine:
1. Whether the test passed or failed
2. Your confidence level (0-100%)
3. Detailed reasoning

Be objective and base your verdict only on the evidence provided.
Respond in JSON format.`,
}

// ============================================================================
// BASE ADAPTER IMPLEMENTATION
// ============================================================================

/**
 * Base LLM Adapter with common functionality
 */
abstract class BaseLLMAdapter implements ILLMAdapter {
  abstract readonly provider: LLMProvider
  readonly model: string
  protected readonly config: AIAuditorConfiguration['llm']
  protected readonly apiKey: string

  constructor(config: AIAuditorConfiguration['llm']) {
    this.config = config
    this.model = config.model
    this.apiKey = config.apiKey || ''
  }

  abstract complete(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse>

  abstract isConfigured(): boolean

  abstract getEstimatedCost(): {
    inputPer1K: number
    outputPer1K: number
    currency: string
  }

  /**
   * Analyze a test case using the LLM
   */
  async analyzeTestCase(testCase: AITestCaseInput): Promise<AITestAnalysis> {
    const prompt = this.buildAnalysisPrompt(testCase)

    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPTS.TEST_ANALYZER },
      { role: 'user', content: prompt },
    ], {
      temperature: 0.1,
      maxTokens: this.config.maxTokens,
      responseFormat: 'json',
    })

    return this.parseAnalysisResponse(response.content, testCase.id)
  }

  /**
   * Generate execution plan for test steps
   */
  async generateExecutionPlan(
    testCase: AITestCaseInput,
    availableTools: string[]
  ): Promise<AIExecutionStep[]> {
    const prompt = this.buildExecutionPlanPrompt(testCase, availableTools)

    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPTS.EXECUTION_PLANNER },
      { role: 'user', content: prompt },
    ], {
      temperature: 0.1,
      maxTokens: this.config.maxTokens,
      responseFormat: 'json',
    })

    return this.parseExecutionPlanResponse(response.content)
  }

  /**
   * Interpret test results
   */
  async interpretResults(
    testCase: AITestCaseInput,
    stepResults: Array<{
      stepNumber: number
      actualOutcome: string
      success: boolean
    }>,
    expectedResult: string
  ): Promise<{
    verdict: 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE' | 'NEEDS_REVIEW'
    confidence: number
    reasoning: string
  }> {
    const prompt = this.buildInterpretationPrompt(testCase, stepResults, expectedResult)

    const response = await this.complete([
      { role: 'system', content: SYSTEM_PROMPTS.RESULT_INTERPRETER },
      { role: 'user', content: prompt },
    ], {
      temperature: 0.1,
      maxTokens: 2000,
      responseFormat: 'json',
    })

    return this.parseInterpretationResponse(response.content)
  }

  // Protected helper methods

  protected buildAnalysisPrompt(testCase: AITestCaseInput): string {
    return `Analyze the following test case:

Test ID: ${testCase.id}
Code: ${testCase.code}
Name: ${testCase.name}
Description: ${testCase.description || 'N/A'}
Priority: ${testCase.priority}
Test Type: ${testCase.testType}

Preconditions:
${testCase.preconditions || 'None specified'}

Test Steps:
${testCase.steps.map(s => `${s.number}. ${s.description}${s.expectedOutcome ? ` (Expected: ${s.expectedOutcome})` : ''}`).join('\n')}

Expected Result:
${testCase.expectedResult}

Provide your analysis in this JSON format:
{
  "interpretation": "Your understanding of what this test verifies",
  "preconditionAnalysis": {
    "understood": true/false,
    "mcpSetupRequired": [{"tool": "...", "parameters": {...}}],
    "manualSetupRequired": ["..."]
  },
  "executionPlan": [...],
  "expectedValidation": {
    "criteria": ["..."],
    "mcpValidationCalls": [...]
  },
  "estimatedDurationMs": 30000,
  "confidenceScore": 0.85,
  "warnings": ["..."]
}`
  }

  protected buildExecutionPlanPrompt(
    testCase: AITestCaseInput,
    availableTools: string[]
  ): string {
    return `Create an execution plan for this test case:

Test: ${testCase.code} - ${testCase.name}
Steps:
${testCase.steps.map(s => `${s.number}. ${s.description}`).join('\n')}

Available MCP Tools:
${availableTools.join(', ')}

For each step, provide:
{
  "stepNumber": 1,
  "description": "...",
  "mcpCalls": [{"tool": "...", "parameters": {...}}],
  "validationCriteria": ["..."],
  "requiresConfirmation": false,
  "fallbackStrategy": "..."
}`
  }

  protected buildInterpretationPrompt(
    testCase: AITestCaseInput,
    stepResults: Array<{
      stepNumber: number
      actualOutcome: string
      success: boolean
    }>,
    expectedResult: string
  ): string {
    return `Interpret the following test execution results:

Test: ${testCase.code} - ${testCase.name}
Expected Result: ${expectedResult}

Step Results:
${stepResults.map(r => `Step ${r.stepNumber}: ${r.success ? 'SUCCESS' : 'FAILED'} - ${r.actualOutcome}`).join('\n')}

Provide your verdict in this JSON format:
{
  "verdict": "PASS|FAIL|BLOCKED|INCONCLUSIVE|NEEDS_REVIEW",
  "confidence": 0.95,
  "reasoning": "Detailed explanation of your verdict"
}`
  }

  protected parseAnalysisResponse(content: string, testCaseId: string): AITestAnalysis {
    try {
      const parsed = JSON.parse(content)
      return {
        testCaseId,
        interpretation: parsed.interpretation || '',
        preconditionAnalysis: {
          understood: parsed.preconditionAnalysis?.understood ?? true,
          mcpSetupRequired: parsed.preconditionAnalysis?.mcpSetupRequired || [],
          manualSetupRequired: parsed.preconditionAnalysis?.manualSetupRequired || [],
        },
        executionPlan: parsed.executionPlan || [],
        expectedValidation: {
          criteria: parsed.expectedValidation?.criteria || [],
          mcpValidationCalls: parsed.expectedValidation?.mcpValidationCalls || [],
        },
        estimatedDurationMs: parsed.estimatedDurationMs || 30000,
        confidenceScore: parsed.confidenceScore || 0.5,
        warnings: parsed.warnings || [],
      }
    } catch {
      // Return default analysis if parsing fails
      return {
        testCaseId,
        interpretation: 'Analysis parsing failed',
        preconditionAnalysis: {
          understood: false,
          mcpSetupRequired: [],
          manualSetupRequired: ['Manual analysis required'],
        },
        executionPlan: [],
        expectedValidation: {
          criteria: [],
          mcpValidationCalls: [],
        },
        estimatedDurationMs: 60000,
        confidenceScore: 0,
        warnings: ['Failed to parse LLM response'],
      }
    }
  }

  protected parseExecutionPlanResponse(content: string): AIExecutionStep[] {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed
      }
      if (parsed.executionPlan && Array.isArray(parsed.executionPlan)) {
        return parsed.executionPlan
      }
      return []
    } catch {
      return []
    }
  }

  protected parseInterpretationResponse(content: string): {
    verdict: 'PASS' | 'FAIL' | 'BLOCKED' | 'INCONCLUSIVE' | 'NEEDS_REVIEW'
    confidence: number
    reasoning: string
  } {
    try {
      const parsed = JSON.parse(content)
      return {
        verdict: parsed.verdict || 'NEEDS_REVIEW',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        reasoning: parsed.reasoning || 'No reasoning provided',
      }
    } catch {
      return {
        verdict: 'NEEDS_REVIEW',
        confidence: 0,
        reasoning: 'Failed to parse LLM interpretation response',
      }
    }
  }
}

// ============================================================================
// OPENAI ADAPTER
// ============================================================================

/**
 * OpenAI LLM Adapter
 */
export class OpenAIAdapter extends BaseLLMAdapter {
  readonly provider: LLMProvider = 'OPENAI'
  private readonly baseUrl = 'https://api.openai.com/v1'

  async complete(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now()

    const requestBody: Record<string, unknown> = {
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
      })),
      temperature: options?.temperature ?? this.config.temperature,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
    }

    if (options?.responseFormat === 'json') {
      requestBody.response_format = { type: 'json_object' }
    }

    if (options?.functions) {
      requestBody.functions = options.functions
      requestBody.function_call = options.functionCall || 'auto'
    }

    if (options?.stopSequences) {
      requestBody.stop = options.stopSequences
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json() as {
      choices: Array<{
        message: { content: string }
        finish_reason: string
      }>
      usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
      model: string
    }

    return {
      content: data.choices[0]?.message?.content || '',
      finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      latencyMs: Date.now() - startTime,
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('sk-')
  }

  getEstimatedCost(): { inputPer1K: number; outputPer1K: number; currency: string } {
    // Prices as of 2024 for GPT-4o
    const prices: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    }

    const price = prices[this.model] || prices['gpt-4o']
    return {
      inputPer1K: price.input,
      outputPer1K: price.output,
      currency: 'USD',
    }
  }

  private mapFinishReason(reason: string): LLMResponse['finishReason'] {
    switch (reason) {
      case 'stop': return 'stop'
      case 'length': return 'length'
      case 'function_call': return 'function_call'
      case 'tool_calls': return 'tool_calls'
      default: return 'error'
    }
  }
}

// ============================================================================
// ANTHROPIC ADAPTER
// ============================================================================

/**
 * Anthropic (Claude) LLM Adapter
 */
export class AnthropicAdapter extends BaseLLMAdapter {
  readonly provider: LLMProvider = 'ANTHROPIC'
  private readonly baseUrl = 'https://api.anthropic.com/v1'

  async complete(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now()

    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'function' ? 'user' : m.role,
        content: m.content,
      }))

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? this.config.maxTokens,
        system: systemMessage,
        messages: conversationMessages,
        temperature: options?.temperature ?? this.config.temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json() as {
      content: Array<{ text: string; type: string }>
      stop_reason: string
      usage: {
        input_tokens: number
        output_tokens: number
      }
      model: string
    }

    return {
      content: data.content.find(c => c.type === 'text')?.text || '',
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model,
      latencyMs: Date.now() - startTime,
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('sk-ant-')
  }

  getEstimatedCost(): { inputPer1K: number; outputPer1K: number; currency: string } {
    const prices: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    }

    const price = prices[this.model] || prices['claude-3-5-sonnet-20241022']
    return {
      inputPer1K: price.input,
      outputPer1K: price.output,
      currency: 'USD',
    }
  }
}

// ============================================================================
// DEEPSEEK ADAPTER
// ============================================================================

/**
 * DeepSeek LLM Adapter
 */
export class DeepSeekAdapter extends BaseLLMAdapter {
  readonly provider: LLMProvider = 'DEEPSEEK'
  private readonly baseUrl = 'https://api.deepseek.com/v1'

  async complete(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now()

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.maxTokens ?? this.config.maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json() as {
      choices: Array<{
        message: { content: string }
        finish_reason: string
      }>
      usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
      model: string
    }

    return {
      content: data.choices[0]?.message?.content || '',
      finishReason: data.choices[0]?.finish_reason === 'stop' ? 'stop' : 'length',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      latencyMs: Date.now() - startTime,
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  getEstimatedCost(): { inputPer1K: number; outputPer1K: number; currency: string } {
    return {
      inputPer1K: 0.00014,
      outputPer1K: 0.00028,
      currency: 'USD',
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Create an LLM adapter based on configuration
 */
export function createLLMAdapter(config: AIAuditorConfiguration): ILLMAdapter {
  switch (config.llm.provider) {
    case 'OPENAI':
      return new OpenAIAdapter(config.llm)
    case 'ANTHROPIC':
      return new AnthropicAdapter(config.llm)
    case 'DEEPSEEK':
      return new DeepSeekAdapter(config.llm)
    case 'GOOGLE_GEMINI':
    case 'MISTRAL':
    case 'OLLAMA':
    case 'AZURE_OPENAI':
      throw new Error(`Provider ${config.llm.provider} not yet implemented`)
    default:
      throw new Error(`Unknown LLM provider: ${config.llm.provider}`)
  }
}

