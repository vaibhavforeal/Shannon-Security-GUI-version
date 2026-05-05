import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { mockFindings } from '../data/mock'
import type { Finding, Severity, VulnCategory } from '../types'

const severityConfig: Record<Severity, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-error/10 border-error/30', text: 'text-error', label: 'Critical' },
  high: { bg: 'bg-[#f59e0b]/10 border-[#f59e0b]/30', text: 'text-[#f59e0b]', label: 'High' },
  medium: { bg: 'bg-[#eab308]/10 border-[#eab308]/30', text: 'text-[#eab308]', label: 'Medium' },
  low: { bg: 'bg-secondary/10 border-secondary/30', text: 'text-secondary', label: 'Low' },
}

const categoryConfig: Record<VulnCategory, { color: string; label: string }> = {
  injection: { color: 'bg-primary', label: 'Injection' },
  xss: { color: 'bg-tertiary', label: 'XSS' },
  auth: { color: 'bg-secondary', label: 'Auth' },
  authz: { color: 'bg-[#f59e0b]', label: 'Authz' },
  ssrf: { color: 'bg-error', label: 'SSRF' },
}

export default function FindingsExplorer() {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = mockFindings.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !f.id.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-on-background">Findings Explorer</h2>
          <p className="text-on-surface-variant text-sm mt-1">Browse, filter, and investigate all confirmed vulnerabilities.</p>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-3 mb-6 stagger-children">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map(sev => {
            const count = mockFindings.filter(f => f.severity === sev).length
            const cfg = severityConfig[sev]
            return (
              <div key={sev} className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${cfg.bg} ${cfg.text}`}>
                {cfg.label}: {count}
              </div>
            )
          })}
          <div className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container text-xs font-medium text-on-surface flex items-center gap-2">
            Total: {mockFindings.length}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative">
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded py-1.5 pl-3 pr-8 text-sm text-on-background focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded py-1.5 pl-3 pr-8 text-sm text-on-background focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="injection">Injection</option>
              <option value="xss">XSS</option>
              <option value="auth">Auth</option>
              <option value="authz">Authz</option>
              <option value="ssrf">SSRF</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded py-1.5 pl-9 pr-4 text-sm text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant"
              placeholder="Search findings..."
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Findings Table */}
          <div className={`bg-surface-container border border-outline-variant rounded-lg flex-1 transition-all duration-300 animate-slide-up ${selectedFinding ? 'max-w-[55%]' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Finding</th>
                    <th className="text-left px-4 py-3 font-medium">Severity</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => {
                    const sev = severityConfig[f.severity]
                    const cat = categoryConfig[f.category]
                    const isSelected = selectedFinding?.id === f.id
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFinding(isSelected ? null : f)}
                        className={`border-t border-outline-variant cursor-pointer transition-all duration-150 ${
                          isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-container-high/50'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{f.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-on-surface font-medium text-sm leading-tight block">{f.title}</span>
                          <span className="text-xs text-on-surface-variant font-mono mt-0.5 block">{f.location}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${sev.bg} ${sev.text}`}>{sev.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                            {cat.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-tertiary font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Exploited
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-12 text-center animate-fade-in">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3 block">filter_alt_off</span>
                <p className="text-on-surface-variant text-sm">No findings match your filters</p>
                <p className="text-on-surface-variant/60 text-xs mt-1">Try adjusting severity, category, or search query</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedFinding && (
            <div className="w-[45%] bg-surface-container border border-outline-variant rounded-lg p-6 overflow-y-auto max-h-[calc(100vh-200px)] animate-slide-in-right">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-mono text-on-surface-variant">{selectedFinding.id}</span>
                  <h3 className="text-lg font-semibold text-on-surface mt-1">{selectedFinding.title}</h3>
                </div>
                <button onClick={() => setSelectedFinding(null)} className="p-1 hover:bg-surface-container-high rounded transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityConfig[selectedFinding.severity].bg} ${severityConfig[selectedFinding.severity].text}`}>
                  {severityConfig[selectedFinding.severity].label}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-outline-variant text-on-surface-variant">
                  <span className={`w-2 h-2 rounded-full ${categoryConfig[selectedFinding.category].color}`} />
                  {categoryConfig[selectedFinding.category].label}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium border border-tertiary/30 bg-tertiary/10 text-tertiary">Exploited</span>
              </div>

              <Section title="Description">{selectedFinding.description}</Section>
              <Section title="Impact">{selectedFinding.impact}</Section>
              <Section title="Location">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{selectedFinding.location}</code>
              </Section>

              <div className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Exploitation Steps</h4>
                <ol className="space-y-2">
                  {selectedFinding.exploitSteps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-on-surface-variant">
                      <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedFinding.codeSnippet && (
                <div className="mb-5">
                  <h4 className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Proof of Concept</h4>
                  <pre className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 overflow-x-auto text-xs font-mono text-on-surface-variant">
                    <code>{selectedFinding.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <Section title="Proof of Impact">{selectedFinding.proofOfImpact}</Section>
              <Section title="Remediation">
                <span className="text-tertiary">{selectedFinding.remediation}</span>
              </Section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{children}</p>
    </div>
  )
}
