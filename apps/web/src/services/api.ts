/**
 * Shannon API Client
 *
 * Handles all HTTP communication with the Shannon API backend.
 * When the API is not available, falls back to mock data.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return (json as { data: T }).data
}

// === Workspace Endpoints ===

export interface WorkspaceSummary {
  id: string
  name: string
  target: string
  repoPath: string
  status: 'running' | 'completed' | 'failed'
  createdAt: string
  completedAt: string | null
  costUsd: number
  durationMs: number
  agentCount: number
}

export interface WorkspaceDetail extends WorkspaceSummary {
  agents: AgentDetail[]
  deliverables: string[]
  hasReport: boolean
}

export interface AgentDetail {
  name: string
  status: string
  durationMs: number
  costUsd: number
  inputTokens: number | null
  outputTokens: number | null
  numTurns: number | null
  model: string | null
}

export interface FindingAPI {
  id: string
  title: string
  severity: string
  confidence: string
  status: string
  category: string
  location: string
  description: string
  impact: string
  exploitSteps: string[]
  proofOfImpact: string
  remediation: string
  codeSnippet: string | null
}

export interface ScanProgress {
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

export const api = {
  // Health
  health: () => request<{ status: string; service: string }>('/health'),

  // Workspaces
  listWorkspaces: () => request<WorkspaceSummary[]>('/workspaces'),
  getWorkspace: (name: string) => request<WorkspaceDetail>(`/workspaces/${encodeURIComponent(name)}`),
  getWorkflowLog: (name: string) => request<{ content: string }>(`/workspaces/${encodeURIComponent(name)}/log`),
  getReport: (name: string) => request<{ content: string }>(`/workspaces/${encodeURIComponent(name)}/report`),
  getFindings: (name: string) => request<FindingAPI[]>(`/workspaces/${encodeURIComponent(name)}/findings`),
  getDeliverable: (name: string, filename: string) =>
    request<{ filename: string; content: string }>(`/workspaces/${encodeURIComponent(name)}/deliverables/${encodeURIComponent(filename)}`),

  // Scans
  startScan: (config: { targetUrl: string; repoPath: string; workspace?: string }) =>
    request<{ scanId: string; workspaceName: string }>('/scans', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  getScanProgress: (id: string) => request<ScanProgress>(`/scans/${encodeURIComponent(id)}/progress`),
  stopScan: (id: string) =>
    request<{ message: string }>(`/scans/${encodeURIComponent(id)}/stop`, { method: 'POST' }),
}
