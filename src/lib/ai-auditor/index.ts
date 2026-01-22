/**
 * AT5 AI Auditor - Module Index
 *
 * Central export point for all AI Auditor functionality.
 * Following barrel pattern for clean imports.
 *
 * @module ai-auditor
 * @version 1.0.0
 * @author AT5 Audit Platform
 * @license Proprietary
 */

// Types and Interfaces
export * from './types'

// MCP Client
export {
  MCPClient,
  createMCPClient,
  ConnectionState,
  AT5ToolCategories,
  createAT5ToolCall,
  type MCPTool,
  type MCPToolDefinition,
  type MCPClientEvents,
  type AT5ToolName,
} from './mcp-client'

// LLM Adapter
export {
  createLLMAdapter,
  OpenAIAdapter,
  AnthropicAdapter,
  DeepSeekAdapter,
  type ILLMAdapter,
  type LLMMessage,
  type LLMResponse,
  type LLMFunction,
  type LLMCompletionOptions,
} from './llm-adapter'

// Core Service
export {
  AIAuditorService,
  createAIAuditorService,
  type StartRunOptions,
  type AIAuditorServiceEvents,
} from './service'

// Execution Queue
export {
  ExecutionQueueManager,
  getExecutionQueue,
  initializeExecutionQueue,
  type QueueEntry,
  type QueueStats,
  type ExecutionQueueEvents,
} from './execution-queue'
