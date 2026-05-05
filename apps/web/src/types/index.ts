/* === Shared TypeScript Types === */

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type VulnCategory = 'injection' | 'xss' | 'auth' | 'authz' | 'ssrf'
export type FindingStatus = 'exploited' | 'potential' | 'false-positive'
export type ScanStatus = 'running' | 'completed' | 'failed' | 'queued'
export type AgentPhase = 'pre-recon' | 'recon' | 'vuln-analysis' | 'exploitation' | 'report'
export type AgentState = 'completed' | 'active' | 'pending' | 'failed'

export interface Scan {
  id: string
  target: string
  repo: string
  status: ScanStatus
  startedAt: string
  duration: string
  findingsCount: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  currentPhase?: AgentPhase
  cost?: number
}

export interface Finding {
  id: string
  scanId: string
  title: string
  severity: Severity
  category: VulnCategory
  status: FindingStatus
  confidence: 'high' | 'medium' | 'low'
  location: string
  description: string
  impact: string
  exploitSteps: string[]
  proofOfImpact: string
  remediation: string
  codeSnippet?: string
}

export interface PipelineAgent {
  name: string
  displayName: string
  phase: AgentPhase
  state: AgentState
  icon: string
  duration?: string
  cost?: number
}

export interface DashboardMetrics {
  totalScans: number
  totalScansChange: number
  activeScans: number
  criticalFindings: number
  criticalFindingsChange: number
  avgScanTime: string
  avgScanTimeChange: string
}

export interface Boundary {
  id: string
  name: string
  type: string
  fileCount: number
  language: string
  inScope: boolean
}
