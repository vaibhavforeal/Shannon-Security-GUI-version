/**
 * Zustand Store — Workspace & Scan State
 *
 * Manages workspace list, active scan details, and findings.
 * Falls back to mock data when the API is unreachable.
 */

import { create } from 'zustand'
import { api } from '../services/api'
import type { WorkspaceSummary, WorkspaceDetail, FindingAPI, ScanProgress } from '../services/api'
import { mockScans, mockFindings } from '../data/mock'

interface ScanStore {
  // State
  workspaces: WorkspaceSummary[]
  activeWorkspace: WorkspaceDetail | null
  findings: FindingAPI[]
  scanProgress: ScanProgress | null
  reportContent: string | null
  isLoading: boolean
  error: string | null
  isApiConnected: boolean

  // Actions
  fetchWorkspaces: () => Promise<void>
  fetchWorkspace: (name: string) => Promise<void>
  fetchFindings: (workspaceName: string) => Promise<void>
  fetchReport: (workspaceName: string) => Promise<void>
  pollProgress: (scanId: string) => Promise<void>
  startScan: (config: { targetUrl: string; repoPath: string; workspace?: string }) => Promise<string | null>
  stopScan: (scanId: string) => Promise<void>
  checkApiConnection: () => Promise<void>
  clearError: () => void
}

export const useScanStore = create<ScanStore>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  findings: [],
  scanProgress: null,
  reportContent: null,
  isLoading: false,
  error: null,
  isApiConnected: false,

  checkApiConnection: async () => {
    try {
      await api.health()
      set({ isApiConnected: true })
    } catch {
      set({ isApiConnected: false })
    }
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const workspaces = await api.listWorkspaces()
      set({ workspaces, isLoading: false, isApiConnected: true })
    } catch {
      // Fall back to mock data
      set({
        workspaces: mockScans.map(s => ({
          id: s.id,
          name: s.id,
          target: s.target,
          repoPath: s.repo,
          status: s.status === 'queued' ? 'running' : s.status as 'running' | 'completed' | 'failed',
          createdAt: s.startedAt,
          completedAt: null,
          costUsd: s.cost || 0,
          durationMs: 0,
          agentCount: 5,
        })),
        isLoading: false,
        isApiConnected: false,
      })
    }
  },

  fetchWorkspace: async (name: string) => {
    set({ isLoading: true, error: null })
    try {
      const workspace = await api.getWorkspace(name)
      set({ activeWorkspace: workspace, isLoading: false })
    } catch {
      set({ activeWorkspace: null, isLoading: false })
    }
  },

  fetchFindings: async (workspaceName: string) => {
    set({ isLoading: true, error: null })
    try {
      const findings = await api.getFindings(workspaceName)
      set({ findings, isLoading: false })
    } catch {
      // Fall back to mock findings
      set({
        findings: mockFindings.map(f => ({
          ...f,
          exploitSteps: f.exploitSteps,
          proofOfImpact: f.proofOfImpact,
          remediation: f.remediation,
          codeSnippet: f.codeSnippet || null,
        })),
        isLoading: false,
      })
    }
  },

  fetchReport: async (workspaceName: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.getReport(workspaceName)
      set({ reportContent: result.content, isLoading: false })
    } catch {
      set({ reportContent: null, isLoading: false })
    }
  },

  pollProgress: async (scanId: string) => {
    try {
      const progress = await api.getScanProgress(scanId)
      set({ scanProgress: progress })
    } catch {
      // Silent fail for polling
    }
  },

  startScan: async (config) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.startScan(config)
      set({ isLoading: false })
      return result.scanId
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message })
      return null
    }
  },

  stopScan: async (scanId: string) => {
    try {
      await api.stopScan(scanId)
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  clearError: () => set({ error: null }),
}))
