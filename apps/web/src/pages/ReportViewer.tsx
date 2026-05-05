import { useMemo } from 'react'
import Topbar from '../components/layout/Topbar'
import { mockReportMarkdown } from '../data/mock'

export default function ReportViewer() {

  // Extract headings for table of contents
  const headings = useMemo(() => {
    const matches = [...mockReportMarkdown.matchAll(/^(#{1,3})\s+(.+)$/gm)]
    return matches.map((m, i) => ({
      id: `heading-${i}`,
      level: m[1].length,
      text: m[2],
    }))
  }, [])

  // Simple markdown to JSX renderer
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n')
    const elements: React.JSX.Element[] = []
    let inCodeBlock = false
    let codeBuffer: string[] = []
    let codeLang = ''
    let headingIdx = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${i}`} className="relative group mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-surface-container-highest border border-outline-variant rounded-t-lg">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">{codeLang || 'text'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  Copy
                </button>
              </div>
              <pre className="bg-surface-container-lowest border border-t-0 border-outline-variant rounded-b-lg p-4 overflow-x-auto">
                <code className="text-xs font-mono text-on-surface-variant">{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          )
          codeBuffer = []
          inCodeBlock = false
        } else {
          codeLang = line.replace('```', '').trim()
          inCodeBlock = true
        }
        continue
      }

      if (inCodeBlock) {
        codeBuffer.push(line)
        continue
      }

      // Headings
      if (line.startsWith('# ')) {
        const hId = `heading-${headingIdx++}`
        elements.push(<h1 key={hId} id={hId} className="text-2xl font-bold text-on-background mt-8 mb-4 pt-4 border-t border-outline-variant">{line.replace('# ', '')}</h1>)
        continue
      }
      if (line.startsWith('## ')) {
        const hId = `heading-${headingIdx++}`
        elements.push(<h2 key={hId} id={hId} className="text-xl font-semibold text-on-background mt-6 mb-3">{line.replace('## ', '')}</h2>)
        continue
      }
      if (line.startsWith('### ')) {
        const hId = `heading-${headingIdx++}`
        elements.push(<h3 key={hId} id={hId} className="text-base font-semibold text-on-surface mt-4 mb-2">{line.replace('### ', '')}</h3>)
        continue
      }

      // Horizontal rule
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${i}`} className="border-outline-variant my-6" />)
        continue
      }

      // Bullet lists
      if (line.startsWith('- ')) {
        const content = line.replace('- ', '')
        elements.push(
          <li key={`li-${i}`} className="text-sm text-on-surface-variant ml-4 list-disc mb-1">
            {renderInline(content)}
          </li>
        )
        continue
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '')
        elements.push(
          <li key={`ol-${i}`} className="text-sm text-on-surface-variant ml-4 list-decimal mb-1">
            {renderInline(content)}
          </li>
        )
        continue
      }

      // Empty lines
      if (line.trim() === '') {
        continue
      }

      // Regular paragraphs
      elements.push(
        <p key={`p-${i}`} className="text-sm text-on-surface-variant leading-relaxed mb-3">
          {renderInline(line)}
        </p>
      )
    }

    return elements
  }

  const renderInline = (text: string) => {
    // Split by inline code, bold, and links
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{part.slice(1, -1)}</code>
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-on-surface">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar showSearch={false} title="Report" />
      <main className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Table of Contents */}
          <aside className="hidden lg:block w-64 border-r border-outline-variant p-6 sticky top-0 h-screen overflow-y-auto">
            <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-4">Table of Contents</h3>
            <nav className="space-y-1">
              {headings.map(h => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className={`block text-xs py-1 transition-colors hover:text-primary ${
                    h.level === 1 ? 'text-on-surface font-medium' :
                    h.level === 2 ? 'text-on-surface-variant pl-3' :
                    'text-on-surface-variant/70 pl-6'
                  }`}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </aside>

          {/* Report Content */}
          <div className="flex-1 p-6 lg:p-8 max-w-4xl">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
              <button className="bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                Export PDF
              </button>
              <button className="bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">code</span>
                Export Markdown
              </button>
              <button className="bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">share</span>
                Share
              </button>
            </div>

            {/* Rendered Report */}
            <article className="prose prose-invert max-w-none">
              {renderMarkdown(mockReportMarkdown)}
            </article>
          </div>
        </div>
      </main>
    </div>
  )
}
