/**
 * Skeleton loading components for the Obsidian UI
 */

export function SkeletonCard() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-8 w-8 rounded-md" />
      </div>
      <div className="skeleton h-8 w-20 rounded mt-2" />
      <div className="skeleton h-3 w-16 rounded mt-3" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
      <div className="skeleton h-4 w-32 rounded mb-2" />
      <div className="skeleton h-3 w-48 rounded mb-6" />
      <div className="skeleton h-48 w-full rounded" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg">
      <div className="p-6 pb-4">
        <div className="skeleton h-4 w-28 rounded mb-2" />
        <div className="skeleton h-3 w-48 rounded" />
      </div>
      <div className="border-t border-outline-variant">
        {/* Header */}
        <div className="flex gap-6 px-6 py-3 border-b border-outline-variant">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-2.5 flex-1 rounded" />
          ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-6 px-6 py-4 border-b border-outline-variant last:border-0" style={{ opacity: 1 - i * 0.12 }}>
            {[...Array(5)].map((_, j) => (
              <div key={j} className="skeleton h-3 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonPipeline() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
      <div className="skeleton h-4 w-36 rounded mb-6" />
      <div className="flex justify-between items-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-2 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="skeleton h-8 w-40 rounded mb-2" />
        <div className="skeleton h-3 w-80 rounded" />
      </div>
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2"><SkeletonChart /></div>
        <SkeletonChart />
      </div>
      {/* Table */}
      <SkeletonTable />
    </div>
  )
}
