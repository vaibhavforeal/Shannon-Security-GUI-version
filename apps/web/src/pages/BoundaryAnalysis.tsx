import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { mockBoundaries } from '../data/mock'

export default function BoundaryAnalysis() {
  const [boundaries, setBoundaries] = useState(mockBoundaries)

  const toggleScope = (id: string) => {
    setBoundaries(prev => prev.map(b => b.id === id ? { ...b, inScope: !b.inScope } : b))
  }

  const inScopeCount = boundaries.filter(b => b.inScope).length
  const totalFiles = boundaries.filter(b => b.inScope).reduce((sum, b) => sum + b.fileCount, 0)

  const typeIcons: Record<string, string> = {
    service: 'dns',
    frontend: 'web',
    worker: 'memory',
    infra: 'storage',
  }

  const typeColors: Record<string, string> = {
    service: 'text-primary bg-primary/10',
    frontend: 'text-tertiary bg-tertiary/10',
    worker: 'text-[#f59e0b] bg-[#f59e0b]/10',
    infra: 'text-secondary bg-secondary/10',
  }

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar showSearch={false} title="Boundaries" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 animate-fade-in">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-on-background">Boundary Analysis</h2>
            <p className="text-on-surface-variant text-sm mt-1">Detected service boundaries in the monorepo. Toggle scope to include or exclude services from the scan.</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
            <div className="bg-surface-container border border-outline-variant rounded-lg p-5 card-hover">
              <p className="text-sm text-on-surface-variant font-medium mb-1">Total Boundaries</p>
              <p className="text-2xl font-bold text-on-background">{boundaries.length}</p>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-lg p-5 card-hover">
              <p className="text-sm text-on-surface-variant font-medium mb-1">In Scope</p>
              <p className="text-2xl font-bold text-primary">{inScopeCount}</p>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-lg p-5 card-hover">
              <p className="text-sm text-on-surface-variant font-medium mb-1">Files to Scan</p>
              <p className="text-2xl font-bold text-on-background">{totalFiles.toLocaleString()}</p>
            </div>
          </div>

          {/* Boundary Map (Visual) */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-base font-semibold text-on-surface mb-4">Service Architecture</h3>
            <div className="flex items-center justify-center gap-4 py-8 flex-wrap">
              {boundaries.map(b => (
                <div
                  key={b.id}
                  onClick={() => toggleScope(b.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 min-w-[120px] ${
                    b.inScope
                      ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(167,139,250,0.1)]'
                      : 'border-outline-variant bg-surface-container-high opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[b.type] || typeColors.service}`}>
                    <span className="material-symbols-outlined text-[20px]">{typeIcons[b.type] || 'dns'}</span>
                  </div>
                  <span className="text-xs font-medium text-on-surface text-center">{b.name}</span>
                  <span className="text-[10px] text-on-surface-variant">{b.fileCount} files</span>
                  {b.inScope && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] text-on-primary">check</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boundary Table */}
          <div className="bg-surface-container border border-outline-variant rounded-lg animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="p-6 pb-4">
              <h3 className="text-base font-semibold text-on-surface">Boundary Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-outline-variant text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Service</th>
                    <th className="text-left px-6 py-3 font-medium">Type</th>
                    <th className="text-left px-6 py-3 font-medium">Language</th>
                    <th className="text-left px-6 py-3 font-medium">Files</th>
                    <th className="text-center px-6 py-3 font-medium">In Scope</th>
                  </tr>
                </thead>
                <tbody>
                  {boundaries.map(b => (
                    <tr key={b.id} className="border-t border-outline-variant hover:bg-surface-container-high/50 transition-colors">
                      <td className="px-6 py-3 text-on-surface font-medium">{b.name}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${typeColors[b.type]}`}>
                          <span className="material-symbols-outlined text-[14px]">{typeIcons[b.type]}</span>
                          {b.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-on-surface-variant">{b.language}</td>
                      <td className="px-6 py-3 text-on-surface-variant">{b.fileCount}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => toggleScope(b.id)}
                          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${b.inScope ? 'bg-primary' : 'bg-outline-variant'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${b.inScope ? 'translate-x-4' : ''}`} />
                        </button>
                      </td>
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
