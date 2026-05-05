/**
 * Temporal Client Service
 *
 * Manages the connection to the Temporal server for starting,
 * querying, and cancelling Shannon pentest workflows.
 *
 * Environment:
 *   TEMPORAL_ADDRESS — Temporal server address (default: localhost:7233)
 */

import { Client, Connection, WorkflowNotFoundError } from '@temporalio/client'

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233'
const WORKFLOW_NAME = 'pentestPipelineWorkflow'
const PROGRESS_QUERY = 'getProgress'

// Singleton client instance
let client: Client | null = null
let connection: Connection | null = null

export interface StartScanInput {
  targetUrl: string
  repoPath: string
  workspace?: string
  apiKey?: string
  pipelineTestingMode?: boolean
}

export interface ScanProgressResult {
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  currentPhase: string | null
  currentAgent: string | null
  completedAgents: string[]
  failedAgent: string | null
  error: string | null
  startTime: number
  elapsedMs: number
  agentMetrics: Record<string, unknown>
  summary: {
    totalCostUsd: number
    totalDurationMs: number
    totalTurns: number
    agentCount: number
  } | null
}

/**
 * Get or create the Temporal client connection
 */
async function getClient(): Promise<Client> {
  if (client) return client

  console.log(`Connecting to Temporal at ${TEMPORAL_ADDRESS}...`)
  connection = await Connection.connect({ address: TEMPORAL_ADDRESS })
  client = new Client({ connection })
  console.log('Connected to Temporal')
  return client
}

/**
 * Start a new pentest scan workflow
 */
export async function startScan(input: StartScanInput): Promise<{ scanId: string; workspaceName: string }> {
  const temporalClient = await getClient()

  const hostname = input.targetUrl
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .slice(0, 40)

  const scanId = `${hostname}_shannon-${Date.now()}`
  const workspaceName = input.workspace || scanId
  const taskQueue = `shannon-${scanId}`

  const pipelineInput = {
    webUrl: input.targetUrl,
    repoPath: input.repoPath,
    workflowId: scanId,
    sessionId: workspaceName,
    ...(input.apiKey && { apiKey: input.apiKey }),
    ...(input.pipelineTestingMode && { pipelineTestingMode: true }),
  }

  await temporalClient.workflow.start(WORKFLOW_NAME, {
    taskQueue,
    workflowId: scanId,
    args: [pipelineInput],
  })

  console.log(`[Temporal] Started workflow ${scanId} on queue ${taskQueue}`)

  return { scanId, workspaceName }
}

/**
 * Query scan progress from a running workflow
 */
export async function getScanProgress(scanId: string): Promise<ScanProgressResult | null> {
  const temporalClient = await getClient()

  try {
    const handle = temporalClient.workflow.getHandle(scanId)
    const description = await handle.describe()

    // If workflow is still running, query for progress
    if (description.status.name === 'RUNNING') {
      try {
        const progress = await handle.query<ScanProgressResult>(PROGRESS_QUERY)
        return progress
      } catch {
        // Query failed but workflow is running — return basic info
        return {
          workflowId: scanId,
          status: 'running',
          currentPhase: null,
          currentAgent: null,
          completedAgents: [],
          failedAgent: null,
          error: null,
          startTime: description.startTime.getTime(),
          elapsedMs: Date.now() - description.startTime.getTime(),
          agentMetrics: {},
          summary: null,
        }
      }
    }

    // Workflow completed — return final state
    const statusMap: Record<string, ScanProgressResult['status']> = {
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      TERMINATED: 'cancelled',
      TIMED_OUT: 'failed',
    }

    return {
      workflowId: scanId,
      status: statusMap[description.status.name] || 'failed',
      currentPhase: null,
      currentAgent: null,
      completedAgents: [],
      failedAgent: null,
      error: description.status.name === 'FAILED' ? 'Workflow failed' : null,
      startTime: description.startTime.getTime(),
      elapsedMs: (description.closeTime?.getTime() || Date.now()) - description.startTime.getTime(),
      agentMetrics: {},
      summary: null,
    }
  } catch (err) {
    if (err instanceof WorkflowNotFoundError) {
      return null
    }
    throw err
  }
}

/**
 * Cancel a running scan workflow
 */
export async function stopScan(scanId: string): Promise<boolean> {
  const temporalClient = await getClient()

  try {
    const handle = temporalClient.workflow.getHandle(scanId)
    await handle.cancel()
    console.log(`[Temporal] Cancelled workflow ${scanId}`)
    return true
  } catch (err) {
    if (err instanceof WorkflowNotFoundError) {
      return false
    }
    throw err
  }
}

/**
 * List all running workflows
 */
export async function listRunningScans(): Promise<string[]> {
  const temporalClient = await getClient()
  const workflowIds: string[] = []

  const workflows = temporalClient.workflow.list({
    query: "WorkflowType = 'pentestPipelineWorkflow' AND ExecutionStatus = 'Running'",
  })

  for await (const workflow of workflows) {
    workflowIds.push(workflow.workflowId)
  }

  return workflowIds
}
