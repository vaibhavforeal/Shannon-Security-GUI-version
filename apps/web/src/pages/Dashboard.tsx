import { useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { useScanStore } from '../stores/scanStore'
import { mockMetrics } from '../data/mock'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import { Link } from 'react-router-dom'

const statusStyles: Record<string, { dot: string; text: string; label: string }> = {
  running: { dot: 'bg-primary animate-pulse', text: 'text-primary', label: 'Running' },
  completed: { dot: 'bg-tertiary', text: 'text-tertiary', label: 'Completed' },
  failed: { dot: 'bg-error', text: 'text-error', label: 'Failed' },
  queued: { dot: 'bg-secondary', text: 'text-secondary', label: 'Queued' },
}

function MetricCard({ label, value, icon, change, changeDirection, isError }: {
  label: string; value: string | number; icon: string; change?: string;
  changeDirection?: 'up' | 'down'; isError?: boolean
}) {
  return (
    <div className={`bg-surface-container border border-outline-variant rounded-lg p-5 hover:border-outline transition-colors group relative overflow-hidden card-hover`}>
      {isError && <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-full blur-2xl -mr-10 -mt-10" />}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className={`text-sm font-medium transition-colors ${isError ? 'text-on-surface-variant group-hover:text-error' : 'text-on-surface-variant group-hover:text-on-background'}`}>
          {label}
        </p>
        <span className={`material-symbols-outlined p-1.5 rounded-md ${isError ? 'text-error bg-error/10' : 'text-primary bg-primary/10'}`}>
          {icon}
        </span>
      </div>
      <div className="flex items-end gap-2 relative z-10">
        <h3 className={`text-3xl font-display font-bold ${isError ? 'text-error' : 'text-on-background'}`}>{value}</h3>
        {change && (
          <span className={`text-xs font-medium mb-1 flex items-center ${isError ? 'text-error' : 'text-tertiary'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {changeDirection === 'down' ? 'arrow_downward' : 'arrow_upward'}
            </span>
            {change}
          </span>
        )}
        {!change && !isError && (
          <span className="text-xs font-medium text-on-surface-variant mb-1">running currently</span>
        )}
      </div>
    </div>
  )
}

function TrendChart() {
  return (
    <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-on-background">Findings Trend</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">30 Day Historical Data</p>
        </div>
      </div>
      <div className="h-64 flex items-end gap-2 relative pt-8">
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-on-surface-variant pr-2 border-r border-outline-variant w-8">
          <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
        </div>
        <div className="absolute left-8 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-full border-t h-0 ${i === 4 ? 'border-outline-variant' : 'border-outline-variant/30'}`} />
          ))}
        </div>
        <div className="flex-1 h-full relative z-10 ml-8 flex items-end justify-between">
          <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,30 L80,35 L90,20 L100,25 V100 H0 Z" fill="url(#trendGradient)" />
            <path d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,30 L80,35 L90,20 L100,25" fill="none" stroke="#a78bfa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-on-surface-variant">
            <span>1st</span><span>8th</span><span>15th</span><span>22nd</span><span>30th</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DonutChart() {
  const segments = [
    { label: 'Injection', pct: 35, color: 'bg-primary' },
    { label: 'XSS', pct: 25, color: 'bg-tertiary' },
    { label: 'Auth', pct: 20, color: 'bg-secondary' },
    { label: 'SSRF', pct: 12, color: 'bg-error' },
  ]

  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-semibold text-on-background">Vulnerability Distribution</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">By Category</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center pt-2">
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-surface-container-lowest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="35, 100" strokeWidth="4" />
            <path className="text-tertiary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="25, 100" strokeDashoffset="-35" strokeWidth="4" />
            <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="20, 100" strokeDashoffset="-60" strokeWidth="4" />
            <path className="text-error" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="12, 100" strokeDashoffset="-80" strokeWidth="4" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-on-background">412</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Total</span>
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          {segments.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-on-surface-variant">{s.label} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

export default function Dashboard() {
  const { workspaces, isLoading, isApiConnected, fetchWorkspaces, checkApiConnection } = useScanStore()

  useEffect(() => {
    checkApiConnection()
    fetchWorkspaces()
  }, [])

  // Compute metrics from real workspaces or fallback to mock
  const metrics = isApiConnected && workspaces.length > 0
    ? {
        totalScans: workspaces.length,
        activeScans: workspaces.filter(w => w.status === 'running').length,
        criticalFindings: 0, // Would require aggregating findings
        avgScanTime: formatDuration(
          workspaces.reduce((sum, w) => sum + w.durationMs, 0) / Math.max(workspaces.length, 1)
        ),
      }
    : mockMetrics

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-headline font-bold tracking-tight text-on-background">Dashboard</h2>
            <p className="text-on-surface-variant text-sm mt-1">High-level overview of scan aggregates and current system security posture.</p>
          </div>
          {/* API connection indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
            isApiConnected
              ? 'border-tertiary/30 bg-tertiary/10 text-tertiary'
              : 'border-outline-variant bg-surface-container-high text-on-surface-variant'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isApiConnected ? 'bg-tertiary' : 'bg-secondary animate-pulse'}`} />
            {isApiConnected ? 'API Connected' : 'Mock Data'}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
          <MetricCard
            label="Total Scans"
            value={typeof metrics.totalScans === 'number' ? metrics.totalScans.toLocaleString() : metrics.totalScans}
            icon="library_books"
            change={isApiConnected ? undefined : `${mockMetrics.totalScansChange}%`}
            changeDirection="up"
          />
          <MetricCard
            label="Active Scans"
            value={typeof metrics.activeScans === 'number' ? metrics.activeScans : mockMetrics.activeScans}
            icon="sync"
          />
          <MetricCard
            label="Critical Findings"
            value={typeof metrics.criticalFindings === 'number' ? metrics.criticalFindings : mockMetrics.criticalFindings}
            icon="warning"
            change={isApiConnected ? undefined : `${mockMetrics.criticalFindingsChange}`}
            changeDirection="up"
            isError
          />
          <MetricCard
            label="Avg Scan Time"
            value={metrics.avgScanTime || mockMetrics.avgScanTime}
            icon="timer"
            change={isApiConnected ? undefined : mockMetrics.avgScanTimeChange}
            changeDirection="down"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <TrendChart />
          <DonutChart />
        </div>

        {/* Recent Scans Table */}
        <div className="bg-surface-container border border-outline-variant rounded-lg animate-slide-up" style={{ animationDelay: '350ms' }}>
          <div className="flex justify-between items-center p-6 pb-4">
            <div>
              <h3 className="text-base font-semibold text-on-background">Recent Scans</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isApiConnected
                  ? `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''} from API`
                  : 'Showing mock data — connect API for real workspaces'
                }
              </p>
            </div>
            <Link to="/new-scan" className="text-xs text-primary hover:text-primary-fixed-dim transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Scan
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-outline-variant text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Target</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Duration</th>
                  <th className="text-left px-6 py-3 font-medium">Agents</th>
                  <th className="text-right px-6 py-3 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.length > 0 ? workspaces.map(ws => {
                  const st = statusStyles[ws.status] || statusStyles.running
                  return (
                    <tr key={ws.id} className="border-t border-outline-variant hover:bg-surface-container-high/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <Link to="/scan-detail" className="text-on-surface font-medium hover:text-primary transition-colors">{ws.target}</Link>
                        <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{ws.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant text-xs font-medium ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-on-surface-variant">{formatDuration(ws.durationMs)}</td>
                      <td className="px-6 py-4 text-on-surface">{ws.agentCount}</td>
                      <td className="px-6 py-4 text-right text-on-surface-variant font-mono">${ws.costUsd.toFixed(2)}</td>
                    </tr>
                  )
                }) : (
                  <tr className="border-t border-outline-variant">
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3 block">search_off</span>
                      <p className="text-on-surface-variant text-sm">No workspaces found</p>
                      <p className="text-on-surface-variant/60 text-xs mt-1">
                        {isApiConnected ? 'Run a scan to create your first workspace' : 'Start the API server to load real data'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
