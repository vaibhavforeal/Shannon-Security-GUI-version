import Topbar from '../components/layout/Topbar'
import { mockPipelineAgents, mockVulnAgents, mockScans } from '../data/mock'

const scan = mockScans[0] // Use the running scan

export default function ScanDetail() {
  const customHeader = (
    <div className="flex items-center gap-4">
      <h2 className="font-sans tracking-tight text-[#fafafa] text-lg font-bold">{scan.target}</h2>
      <span className="px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant text-xs text-primary font-medium flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Running
      </span>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar customLeft={customHeader} />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
            <InfoCard label="Target Scope" value={scan.target} />
            <InfoCard label="Elapsed Time" value={scan.duration} mono />
            <InfoCard label="Est. Cost" value={`$${scan.cost?.toFixed(2) || '—'}`} mono />
            <InfoCard label="Findings" value={String(scan.findingsCount)} highlight />
          </div>

          {/* Pipeline Visualizer */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-headline tracking-tight text-on-surface">Execution Pipeline</h3>
              <span className="text-xs font-mono text-primary">PHASE 3 OF 5</span>
            </div>
            <div className="relative flex justify-between items-center">
              {/* Track */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-outline-variant z-0" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-primary z-0 transition-all duration-500" />

              {mockPipelineAgents.map((agent) => {
                const isCompleted = agent.state === 'completed'
                const isActive = agent.state === 'active'
                return (
                  <div key={agent.name} className="relative z-10 flex flex-col items-center gap-3 transition-transform hover:scale-105">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-tertiary/10 border border-tertiary text-tertiary'
                          : isActive
                          ? 'bg-surface-container shadow-[0_0_0_2px_#09090b,0_0_0_4px_#a78bfa] text-primary animate-pulse-glow'
                          : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{agent.icon}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isCompleted ? 'text-tertiary' : isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}>
                      {agent.displayName}
                    </span>
                    {agent.duration && (
                      <span className="text-[10px] font-mono text-on-surface-variant">{agent.duration}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vuln Analysis Sub-Agents */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-on-surface">Vulnerability Analysis Agents</h3>
              <span className="text-xs text-on-surface-variant">5 parallel agents</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {mockVulnAgents.map(agent => {
                const isCompleted = agent.state === 'completed'
                const isActive = agent.state === 'active'
                return (
                  <div key={agent.name} className={`rounded-lg p-4 border transition-all card-hover ${
                    isCompleted ? 'border-tertiary/30 bg-tertiary/5' :
                    isActive ? 'border-primary/30 bg-primary/5' :
                    'border-outline-variant bg-surface-container-high'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isCompleted ? 'text-tertiary' : isActive ? 'text-primary' : 'text-on-surface-variant'
                      }`}>{agent.label}</span>
                      {isCompleted && <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>}
                      {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <span className="text-xs text-on-surface-variant">{agent.findings} findings</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agent Metrics Table */}
          <div className="bg-surface-container border border-outline-variant rounded-lg animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="p-6 pb-4">
              <h3 className="text-base font-semibold text-on-surface">Agent Metrics</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Per-agent execution details</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-outline-variant text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Agent</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Duration</th>
                    <th className="text-right px-6 py-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPipelineAgents.map(agent => (
                    <tr key={agent.name} className="border-t border-outline-variant row-hover hover:bg-surface-container-high/50">
                      <td className="px-6 py-3 text-on-surface font-medium">{agent.displayName}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          agent.state === 'completed' ? 'text-tertiary' :
                          agent.state === 'active' ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.state === 'completed' ? 'bg-tertiary' :
                            agent.state === 'active' ? 'bg-primary animate-pulse' : 'bg-secondary'
                          }`} />
                          {agent.state === 'completed' ? 'Done' : agent.state === 'active' ? 'Running' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-on-surface-variant">{agent.duration || '—'}</td>
                      <td className="px-6 py-3 text-right font-mono text-on-surface-variant">{agent.cost ? `$${agent.cost.toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoCard({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg p-5 flex flex-col gap-2 card-hover">
      <span className="text-sm text-on-surface-variant font-medium">{label}</span>
      <span className={`text-xl font-headline tracking-tight ${highlight ? 'text-primary font-bold' : 'text-on-surface'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}
