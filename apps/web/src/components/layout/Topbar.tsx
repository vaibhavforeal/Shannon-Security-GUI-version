import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface TopbarProps {
  title?: string
  showSearch?: boolean
  customLeft?: ReactNode
}

export default function Topbar({ title, showSearch = true, customLeft }: TopbarProps) {
  const navigate = useNavigate()

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-6 py-3 bg-[#09090b] border-b border-[#27272a] sticky top-0 z-40 h-16">
      {/* Left section — add left padding on mobile for hamburger */}
      <div className="flex-1 flex items-center pl-10 md:pl-0">
        {customLeft ? (
          customLeft
        ) : showSearch ? (
          <div className="relative w-64 max-w-md hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded py-1.5 pl-9 pr-4 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant focus-ring"
              placeholder="Search resources..."
              type="text"
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-secondary flex items-center gap-2">
            <span>Scans</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{title || 'Configure'}</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button
          onClick={() => navigate('/new-scan')}
          className="bg-primary text-on-primary text-sm font-medium px-3 md:px-4 py-1.5 rounded hover:bg-primary-container transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer focus-ring"
        >
          <span className="material-symbols-outlined text-sm">bolt</span>
          <span className="hidden sm:inline">Quick Scan</span>
        </button>
        <div className="h-5 w-px bg-[#27272a] mx-0.5 hidden sm:block" />
        <div className="flex items-center gap-1 text-on-surface-variant">
          <button className="p-1.5 hover:bg-surface-container-high hover:text-on-background rounded-md transition-colors relative cursor-pointer focus-ring">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-[#09090b]" />
          </button>
          <button className="p-1.5 hover:bg-surface-container-high hover:text-on-background rounded-md transition-colors cursor-pointer focus-ring">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  )
}
