/**
 * Shannon API — Workspace Service
 *
 * Reads workspace data from the filesystem. Each workspace directory
 * contains a session.json and a deliverables/ directory with agent outputs.
 *
 * Directory structure:
 *   workspaces/<name>/
 *     ├── session.json        — Session metadata + metrics
 *     ├── workflow.log        — Agent execution log
 *     └── agents/
 *         └── <agent>/
 *             └── deliverables/
 *                 └── *.md    — Agent deliverables
 *
 * And in the target repo:
 *   <repo>/.shannon/deliverables/
 *     ├── comprehensive_security_assessment_report.md
 *     ├── *_deliverable.md
 *     └── *_evidence.md
 */

import fs from 'node:fs/promises'
import path from 'node:path'

// === Types matching worker's session.json ===

interface SessionJson {
  session: {
    id: string
    webUrl: string
    repoPath?: string
    status: 'in-progress' | 'completed' | 'failed'
    createdAt: string
    completedAt?: string
  }
  metrics: {
    total_cost_usd: number
    total_duration_ms?: number
    agents?: Record<string, AgentMetricEntry>
  }
  resume_history?: Array<{
    timestamp: string
    workflow_id: string
  }>
}

interface AgentMetricEntry {
  status: string
  duration_ms: number
  cost_usd: number
  input_tokens?: number
  output_tokens?: number
  num_turns?: number
  model?: string
}

// === Public API types ===

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

export interface FindingParsed {
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

// Known agent names → display phases
const PHASE_MAP: Record<string, string> = {
  'pre-recon': 'pre-recon',
  'recon': 'recon',
  'injection-vuln': 'vuln-analysis',
  'xss-vuln': 'vuln-analysis',
  'auth-vuln': 'vuln-analysis',
  'ssrf-vuln': 'vuln-analysis',
  'authz-vuln': 'vuln-analysis',
  'injection-exploit': 'exploitation',
  'xss-exploit': 'exploitation',
  'auth-exploit': 'exploitation',
  'ssrf-exploit': 'exploitation',
  'authz-exploit': 'exploitation',
  'report': 'report',
}

export class WorkspaceService {
  constructor(private workspacesDir: string) {}

  /**
   * List all workspaces with summary data
   */
  async listWorkspaces(): Promise<WorkspaceSummary[]> {
    let entries: string[]
    try {
      entries = await fs.readdir(this.workspacesDir)
    } catch {
      return []
    }

    const workspaces: WorkspaceSummary[] = []

    for (const entry of entries) {
      const sessionPath = path.join(this.workspacesDir, entry, 'session.json')
      try {
        const content = await fs.readFile(sessionPath, 'utf8')
        const data = JSON.parse(content) as SessionJson

        const createdAt = new Date(data.session.createdAt)
        const completedAt = data.session.completedAt ? new Date(data.session.completedAt) : null
        const durationMs = data.metrics.total_duration_ms ??
          ((completedAt ?? new Date()).getTime() - createdAt.getTime())

        workspaces.push({
          id: data.session.id,
          name: entry,
          target: data.session.webUrl,
          repoPath: data.session.repoPath || '',
          status: data.session.status === 'in-progress' ? 'running' : data.session.status,
          createdAt: data.session.createdAt,
          completedAt: data.session.completedAt || null,
          costUsd: data.metrics.total_cost_usd || 0,
          durationMs,
          agentCount: data.metrics.agents ? Object.keys(data.metrics.agents).length : 0,
        })
      } catch {
        // Skip invalid directories
      }
    }

    // Sort by creation date, most recent first
    workspaces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return workspaces
  }

  /**
   * Get detailed workspace info including per-agent metrics
   */
  async getWorkspace(name: string): Promise<WorkspaceDetail | null> {
    const sessionPath = path.join(this.workspacesDir, name, 'session.json')
    try {
      const content = await fs.readFile(sessionPath, 'utf8')
      const data = JSON.parse(content) as SessionJson

      const createdAt = new Date(data.session.createdAt)
      const completedAt = data.session.completedAt ? new Date(data.session.completedAt) : null
      const durationMs = data.metrics.total_duration_ms ??
        ((completedAt ?? new Date()).getTime() - createdAt.getTime())

      // Parse per-agent metrics
      const agents: AgentDetail[] = []
      if (data.metrics.agents) {
        for (const [agentName, metrics] of Object.entries(data.metrics.agents)) {
          agents.push({
            name: agentName,
            status: metrics.status,
            durationMs: metrics.duration_ms || 0,
            costUsd: metrics.cost_usd || 0,
            inputTokens: metrics.input_tokens ?? null,
            outputTokens: metrics.output_tokens ?? null,
            numTurns: metrics.num_turns ?? null,
            model: metrics.model ?? null,
          })
        }
      }

      // Check for deliverables
      const deliverables = await this.listDeliverables(name, data.session.repoPath)

      const hasReport = deliverables.some(d =>
        d.includes('comprehensive_security_assessment_report')
      )

      return {
        id: data.session.id,
        name,
        target: data.session.webUrl,
        repoPath: data.session.repoPath || '',
        status: data.session.status === 'in-progress' ? 'running' : data.session.status,
        createdAt: data.session.createdAt,
        completedAt: data.session.completedAt || null,
        costUsd: data.metrics.total_cost_usd || 0,
        durationMs,
        agentCount: agents.length,
        agents,
        deliverables,
        hasReport,
      }
    } catch {
      return null
    }
  }

  /**
   * Get the workflow log content
   */
  async getWorkflowLog(name: string): Promise<string | null> {
    const logPath = path.join(this.workspacesDir, name, 'workflow.log')
    try {
      return await fs.readFile(logPath, 'utf8')
    } catch {
      return null
    }
  }

  /**
   * Get a specific deliverable file
   */
  async getDeliverable(name: string, filename: string, repoPath?: string): Promise<string | null> {
    // Try workspace deliverables dir first
    const paths = [
      path.join(this.workspacesDir, name, 'deliverables', filename),
    ]

    // Also try repo deliverables dir
    if (repoPath) {
      paths.push(path.join(repoPath, '.shannon', 'deliverables', filename))
    }

    for (const p of paths) {
      try {
        return await fs.readFile(p, 'utf8')
      } catch {
        // Try next path
      }
    }
    return null
  }

  /**
   * Get the full security assessment report
   */
  async getReport(name: string): Promise<string | null> {
    // First get workspace detail to know the repo path
    const workspace = await this.getWorkspace(name)
    if (!workspace) return null

    return this.getDeliverable(
      name,
      'comprehensive_security_assessment_report.md',
      workspace.repoPath,
    )
  }

  /**
   * List all deliverable files for a workspace
   */
  private async listDeliverables(name: string, repoPath?: string): Promise<string[]> {
    const files: string[] = []

    // Check workspace deliverables dir
    const workspaceDeliverables = path.join(this.workspacesDir, name, 'deliverables')
    try {
      const entries = await fs.readdir(workspaceDeliverables)
      files.push(...entries.filter(e => e.endsWith('.md')))
    } catch {
      // No workspace deliverables dir
    }

    // Check repo deliverables dir
    if (repoPath) {
      const repoDeliverables = path.join(repoPath, '.shannon', 'deliverables')
      try {
        const entries = await fs.readdir(repoDeliverables)
        const newFiles = entries.filter(e => e.endsWith('.md') && !files.includes(e))
        files.push(...newFiles)
      } catch {
        // No repo deliverables dir
      }
    }

    return files.sort()
  }

  /**
   * Parse findings from the security assessment report markdown
   */
  async parseFindings(name: string): Promise<FindingParsed[]> {
    const report = await this.getReport(name)
    if (!report) return []

    const findings: FindingParsed[] = []

    // Parse ## headings as finding sections
    // Pattern: ## ID: Title
    const sections = report.split(/^## /m).slice(1) // Skip content before first ##

    for (const section of sections) {
      const lines = section.split('\n')
      const headerLine = lines[0]?.trim()
      if (!headerLine) continue

      // Match patterns like "INJ-VULN-01: SQL Injection Authentication Bypass"
      const headerMatch = headerLine.match(/^([A-Z]+-[A-Z]+-\d+):\s+(.+)$/)
      if (!headerMatch) continue

      const [, id, title] = headerMatch

      // Extract severity, confidence, status from the body
      const bodyText = lines.slice(1).join('\n')
      const severityMatch = bodyText.match(/\*\*Severity:\*\*\s*(\w+)/i)
      const confidenceMatch = bodyText.match(/\*\*Confidence:\*\*\s*(\w+)/i)
      const statusMatch = bodyText.match(/\*\*Status:\*\*\s*(\w+)/i)
      const locationMatch = bodyText.match(/\*\*Location:\*\*\s*`?([^`\n]+)`?/i)
      const descMatch = bodyText.match(/\*\*Description:\*\*\s*\n([\s\S]*?)(?=\n\*\*|\n##|$)/)
      const impactMatch = bodyText.match(/\*\*Impact:\*\*\s*([^\n]+)/)
      const remediationMatch = bodyText.match(/\*\*Remediation:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]*)*)/i)

      // Determine category from ID prefix
      const categoryMap: Record<string, string> = {
        'INJ': 'injection',
        'XSS': 'xss',
        'AUTH': 'auth',
        'AUTHZ': 'authz',
        'SSRF': 'ssrf',
      }
      const prefix = id.split('-')[0]
      const category = categoryMap[prefix] || 'unknown'

      // Extract code blocks as exploit steps
      const codeBlocks = [...bodyText.matchAll(/```[\s\S]*?```/g)]
      const codeSnippet = codeBlocks.length > 0
        ? codeBlocks[0][0].replace(/```\w*\n?/g, '').trim()
        : null

      // Extract exploitation steps (numbered list items)
      const exploitSteps: string[] = []
      const stepsMatch = bodyText.match(/Exploitation Steps[\s\S]*?(?=\n\*\*|\n##|$)/i)
      if (stepsMatch) {
        const stepLines = stepsMatch[0].match(/^\d+\.\s+(.+)$/gm)
        if (stepLines) {
          exploitSteps.push(...stepLines.map(l => l.replace(/^\d+\.\s+/, '')))
        }
      }

      findings.push({
        id,
        title,
        severity: severityMatch?.[1]?.toLowerCase() || 'medium',
        confidence: confidenceMatch?.[1]?.toLowerCase() || 'medium',
        status: statusMatch?.[1]?.toLowerCase() || 'potential',
        category,
        location: locationMatch?.[1]?.trim() || 'Unknown',
        description: descMatch?.[1]?.trim() || '',
        impact: impactMatch?.[1]?.trim() || '',
        exploitSteps,
        proofOfImpact: '',
        remediation: remediationMatch?.[1]?.trim() || '',
        codeSnippet,
      })
    }

    return findings
  }
}
