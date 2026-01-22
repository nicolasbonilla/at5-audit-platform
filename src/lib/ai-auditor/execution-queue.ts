/**
 * AT5 AI Auditor - Execution Queue Manager
 *
 * This module implements a persistent execution queue for managing
 * concurrent AI audit runs with state recovery capabilities.
 *
 * Features:
 * - Singleton pattern for global queue management
 * - Persistent state recovery on restart
 * - Concurrent execution limiting
 * - Priority-based scheduling
 * - Event-driven architecture
 *
 * @module ai-auditor/execution-queue
 * @version 1.0.0
 * @author AT5 Audit Platform
 * @license Proprietary
 */

import { EventEmitter } from 'events'
import { prisma } from '@/lib/prisma'
import {
  AIAuditRunStatus,
  AIAuditMode,
  AIAuditRunSummary,
  LogLevel,
} from './types'
import { AIAuditorService, createAIAuditorService } from './service'

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_CONCURRENT_RUNS = 3
const QUEUE_CHECK_INTERVAL_MS = 5000
const STALE_RUN_THRESHOLD_MS = 3600000 // 1 hour

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Queue entry representing a pending or active run
 */
export interface QueueEntry {
  runId: string
  sessionId: string
  configId: string
  mode: AIAuditMode
  priority: number
  createdAt: Date
  service?: AIAuditorService
}

/**
 * Queue statistics
 */
export interface QueueStats {
  pending: number
  active: number
  completed: number
  failed: number
  maxConcurrent: number
  isProcessing: boolean
}

/**
 * Queue events
 */
export interface ExecutionQueueEvents {
  runQueued: (entry: QueueEntry) => void
  runStarted: (runId: string) => void
  runCompleted: (runId: string, status: AIAuditRunStatus) => void
  runFailed: (runId: string, error: Error) => void
  queueEmpty: () => void
  log: (level: LogLevel, message: string, data?: unknown) => void
}

// ============================================================================
// EXECUTION QUEUE MANAGER
// ============================================================================

/**
 * ExecutionQueueManager - Singleton for managing AI audit execution queue
 *
 * Handles:
 * - Queuing new run requests
 * - Processing runs with concurrency limits
 * - State persistence and recovery
 * - Priority-based scheduling
 *
 * @example
 * ```typescript
 * const queue = ExecutionQueueManager.getInstance()
 * await queue.initialize()
 *
 * const position = await queue.enqueue({
 *   runId: 'run-123',
 *   sessionId: 'session-456',
 *   configId: 'config-789',
 *   mode: 'SEMI_AUTOMATIC',
 *   priority: 1,
 * })
 *
 * queue.on('runCompleted', (runId) => {
 *   console.log(`Run ${runId} completed`)
 * })
 * ```
 */
export class ExecutionQueueManager extends EventEmitter {
  private static instance: ExecutionQueueManager | null = null

  private queue: QueueEntry[] = []
  private activeRuns: Map<string, AIAuditorService> = new Map()
  private isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null
  private initialized: boolean = false

  // Statistics
  private stats = {
    completedCount: 0,
    failedCount: 0,
  }

  private constructor() {
    super()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ExecutionQueueManager {
    if (!ExecutionQueueManager.instance) {
      ExecutionQueueManager.instance = new ExecutionQueueManager()
    }
    return ExecutionQueueManager.instance
  }

  /**
   * Reset instance (for testing)
   */
  static resetInstance(): void {
    if (ExecutionQueueManager.instance) {
      ExecutionQueueManager.instance.shutdown()
      ExecutionQueueManager.instance = null
    }
  }

  // ==========================================================================
  // LIFECYCLE METHODS
  // ==========================================================================

  /**
   * Initialize the queue manager
   * Recovers any interrupted runs from the database
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    this.log('INFO', 'Initializing Execution Queue Manager...')

    // Recover interrupted runs
    await this.recoverInterruptedRuns()

    // Start queue processing
    this.startProcessing()

    this.initialized = true
    this.log('INFO', `Execution Queue Manager initialized. ${this.queue.length} pending, ${this.activeRuns.size} active`)
  }

  /**
   * Shutdown the queue manager gracefully
   */
  async shutdown(): Promise<void> {
    this.log('INFO', 'Shutting down Execution Queue Manager...')

    // Stop processing
    this.stopProcessing()

    // Pause all active runs
    for (const [runId, service] of this.activeRuns) {
      try {
        await service.pauseRun()
        this.log('INFO', `Paused run ${runId} for shutdown`)
      } catch (error) {
        this.log('ERROR', `Failed to pause run ${runId}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    this.activeRuns.clear()
    this.queue = []
    this.initialized = false

    this.log('INFO', 'Execution Queue Manager shutdown complete')
  }

  // ==========================================================================
  // QUEUE OPERATIONS
  // ==========================================================================

  /**
   * Add a new run to the queue
   *
   * @param entry - Queue entry details
   * @returns Queue position (1-based)
   */
  async enqueue(entry: Omit<QueueEntry, 'createdAt'>): Promise<number> {
    const fullEntry: QueueEntry = {
      ...entry,
      createdAt: new Date(),
    }

    // Insert based on priority (lower number = higher priority)
    const insertIndex = this.queue.findIndex(e => e.priority > entry.priority)

    if (insertIndex === -1) {
      this.queue.push(fullEntry)
    } else {
      this.queue.splice(insertIndex, 0, fullEntry)
    }

    const position = insertIndex === -1 ? this.queue.length : insertIndex + 1

    // Update database status
    await prisma.aIAuditRun.update({
      where: { id: entry.runId },
      data: {
        status: 'PENDING',
        queuePosition: position,
      },
    })

    this.emit('runQueued', fullEntry)
    this.log('INFO', `Run ${entry.runId} queued at position ${position}`)

    // Trigger processing
    this.processQueue()

    return position
  }

  /**
   * Remove a run from the queue
   */
  async dequeue(runId: string): Promise<boolean> {
    const index = this.queue.findIndex(e => e.runId === runId)

    if (index === -1) {
      return false
    }

    this.queue.splice(index, 1)

    // Update positions for remaining items
    await this.updateQueuePositions()

    this.log('INFO', `Run ${runId} removed from queue`)
    return true
  }

  /**
   * Get queue position for a run
   */
  getPosition(runId: string): number | null {
    const index = this.queue.findIndex(e => e.runId === runId)
    return index === -1 ? null : index + 1
  }

  /**
   * Check if a run is active
   */
  isRunActive(runId: string): boolean {
    return this.activeRuns.has(runId)
  }

  /**
   * Get the service for an active run
   */
  getActiveService(runId: string): AIAuditorService | null {
    return this.activeRuns.get(runId) || null
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      pending: this.queue.length,
      active: this.activeRuns.size,
      completed: this.stats.completedCount,
      failed: this.stats.failedCount,
      maxConcurrent: MAX_CONCURRENT_RUNS,
      isProcessing: this.isProcessing,
    }
  }

  /**
   * Get current queue state
   */
  getQueueState(): Array<{
    runId: string
    position: number
    sessionId: string
    mode: AIAuditMode
    priority: number
    waitTime: number
  }> {
    return this.queue.map((entry, index) => ({
      runId: entry.runId,
      position: index + 1,
      sessionId: entry.sessionId,
      mode: entry.mode,
      priority: entry.priority,
      waitTime: Date.now() - entry.createdAt.getTime(),
    }))
  }

  // ==========================================================================
  // PRIVATE METHODS - PROCESSING
  // ==========================================================================

  /**
   * Start queue processing loop
   */
  private startProcessing(): void {
    if (this.processingInterval) {
      return
    }

    this.isProcessing = true
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, QUEUE_CHECK_INTERVAL_MS)

    // Initial processing
    this.processQueue()
  }

  /**
   * Stop queue processing loop
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    this.isProcessing = false
  }

  /**
   * Process the queue - start pending runs if capacity available
   */
  private async processQueue(): Promise<void> {
    // Check if we have capacity
    while (
      this.activeRuns.size < MAX_CONCURRENT_RUNS &&
      this.queue.length > 0
    ) {
      const entry = this.queue.shift()
      if (!entry) break

      try {
        await this.startRun(entry)
      } catch (error) {
        this.log('ERROR', `Failed to start run ${entry.runId}: ${error instanceof Error ? error.message : String(error)}`)
        this.emit('runFailed', entry.runId, error instanceof Error ? error : new Error(String(error)))
        this.stats.failedCount++
      }
    }

    // Emit queue empty event if applicable
    if (this.queue.length === 0 && this.activeRuns.size === 0) {
      this.emit('queueEmpty')
    }
  }

  /**
   * Start a run from the queue
   */
  private async startRun(entry: QueueEntry): Promise<void> {
    this.log('INFO', `Starting run ${entry.runId}`)

    // Create service
    const service = await createAIAuditorService(entry.configId)

    // Setup event handlers
    service.on('runCompleted', async (summary: AIAuditRunSummary) => {
      await this.handleRunCompleted(entry.runId, summary.status)
    })

    service.on('runFailed', async (summary: AIAuditRunSummary, error: Error) => {
      await this.handleRunFailed(entry.runId, error)
    })

    service.on('log', (level: LogLevel, message: string, data?: unknown) => {
      this.log(level, `[${entry.runId}] ${message}`, data)
    })

    // Store in active runs
    this.activeRuns.set(entry.runId, service)
    entry.service = service

    // Update queue positions
    await this.updateQueuePositions()

    this.emit('runStarted', entry.runId)
  }

  /**
   * Handle run completion
   */
  private async handleRunCompleted(runId: string, status: AIAuditRunStatus): Promise<void> {
    this.activeRuns.delete(runId)
    this.stats.completedCount++

    this.emit('runCompleted', runId, status)
    this.log('INFO', `Run ${runId} completed with status: ${status}`)

    // Process next in queue
    this.processQueue()
  }

  /**
   * Handle run failure
   */
  private async handleRunFailed(runId: string, error: Error): Promise<void> {
    this.activeRuns.delete(runId)
    this.stats.failedCount++

    this.emit('runFailed', runId, error)
    this.log('ERROR', `Run ${runId} failed: ${error.message}`)

    // Process next in queue
    this.processQueue()
  }

  /**
   * Recover interrupted runs from database
   */
  private async recoverInterruptedRuns(): Promise<void> {
    this.log('INFO', 'Checking for interrupted runs...')

    // Find runs that were in progress
    const interruptedRuns = await prisma.aIAuditRun.findMany({
      where: {
        status: {
          in: ['PENDING', 'INITIALIZING', 'RUNNING', 'PAUSED', 'WAITING_CONFIRMATION'],
        },
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    })

    for (const run of interruptedRuns) {
      const age = Date.now() - run.createdAt.getTime()

      // Mark stale runs as failed
      if (age > STALE_RUN_THRESHOLD_MS) {
        await prisma.aIAuditRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
          },
        })

        await prisma.aIAuditLog.create({
          data: {
            runId: run.id,
            eventType: 'RUN_FAILED',
            level: 'ERROR',
            message: 'Run marked as failed due to server restart (stale)',
          },
        })

        this.log('WARNING', `Marked stale run ${run.id} as failed`)
        continue
      }

      // Re-queue non-stale runs
      if (run.configId) {
        this.queue.push({
          runId: run.id,
          sessionId: run.sessionId,
          configId: run.configId,
          mode: run.mode as AIAuditMode,
          priority: run.status === 'RUNNING' ? 0 : 1, // Prioritize previously running
          createdAt: run.createdAt,
        })

        this.log('INFO', `Recovered run ${run.id} to queue`)
      }
    }

    // Update queue positions
    await this.updateQueuePositions()
  }

  /**
   * Update queue positions in database
   */
  private async updateQueuePositions(): Promise<void> {
    for (let i = 0; i < this.queue.length; i++) {
      await prisma.aIAuditRun.update({
        where: { id: this.queue[i].runId },
        data: { queuePosition: i + 1 },
      })
    }
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    this.emit('log', level, `[ExecutionQueue] ${message}`, data)
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get the global queue manager instance
 */
export function getExecutionQueue(): ExecutionQueueManager {
  return ExecutionQueueManager.getInstance()
}

/**
 * Initialize the execution queue (call on server startup)
 */
export async function initializeExecutionQueue(): Promise<ExecutionQueueManager> {
  const queue = ExecutionQueueManager.getInstance()
  await queue.initialize()
  return queue
}

