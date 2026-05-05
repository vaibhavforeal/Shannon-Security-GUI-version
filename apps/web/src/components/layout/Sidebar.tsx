import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { path: '/', icon: 'dashboard', label: 'Dashboard' },
  { path: '/scan-detail', icon: 'troubleshoot', label: 'Scan Detail' },
  { path: '/findings', icon: 'search_check', label: 'Findings Explorer' },
  { path: '/report', icon: 'assessment', label: 'Report Viewer' },
  { path: '/new-scan', icon: 'add_circle', label: 'New Scan' },
  { path: '/boundary', icon: 'language', label: 'Boundary Analysis' },
]

const bottomItems = [
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const renderNavLink = (item: { path: string; icon: string; label: string }) => {
    const isActive = location.pathname === item.path
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-l transition-all duration-200 ease-in-out active:scale-95 focus-ring ${
          isActive
            ? 'bg-surface-container-high text-primary border-r-2 border-primary'
            : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          {item.icon}
        </span>
        {item.label}
      </Link>
    )
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-black text-[#fafafa] tracking-tighter">Obsidian</h1>
        <p className="font-sans text-sm font-medium text-secondary-fixed mt-1">Security Control Plane</p>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto font-sans text-sm font-medium flex flex-col gap-1 px-2">
        {navItems.map(renderNavLink)}
      </div>

      {/* Bottom Navigation */}
      <div className="px-2 mt-auto">
        {bottomItems.map(renderNavLink)}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors md:hidden cursor-pointer"
        aria-label="Open navigation"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 sidebar-overlay md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <nav
            className="h-full w-64 bg-[#0c0c0f] border-r border-[#27272a] flex flex-col py-6 sidebar-mobile-enter"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {sidebarContent}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 border-r border-[#27272a] bg-[#0c0c0f] flex-col py-6 z-50 hidden md:flex">
        {sidebarContent}
      </nav>
    </>
  )
}
