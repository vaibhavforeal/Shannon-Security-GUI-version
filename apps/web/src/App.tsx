import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import ScanDetail from './pages/ScanDetail'
import FindingsExplorer from './pages/FindingsExplorer'
import ReportViewer from './pages/ReportViewer'
import NewScan from './pages/NewScan'
import BoundaryAnalysis from './pages/BoundaryAnalysis'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan-detail" element={<ScanDetail />} />
          <Route path="/findings" element={<FindingsExplorer />} />
          <Route path="/report" element={<ReportViewer />} />
          <Route path="/new-scan" element={<NewScan />} />
          <Route path="/boundary" element={<BoundaryAnalysis />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
      <footer className="app-footer">
        <span>Developed by <strong>Vaibhav Shettar</strong>, Code-V</span>
        <span>© 2026 All rights reserved</span>
      </footer>
    </div>
  )
}
