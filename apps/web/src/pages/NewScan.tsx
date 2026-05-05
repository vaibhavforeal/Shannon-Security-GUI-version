import { useState } from 'react'
import Topbar from '../components/layout/Topbar'

const vulnClasses = [
  { id: 'injection', label: 'Injection', icon: 'database' },
  { id: 'xss', label: 'XSS', icon: 'code' },
  { id: 'auth', label: 'Auth', icon: 'lock' },
  { id: 'authz', label: 'Authz', icon: 'admin_panel_settings' },
  { id: 'ssrf', label: 'SSRF', icon: 'cloud' },
]

export default function NewScan() {
  const [targetUrl, setTargetUrl] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [description, setDescription] = useState('')
  const [loginType, setLoginType] = useState('form')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [loginUrl, setLoginUrl] = useState('')
  const [enabledVulns, setEnabledVulns] = useState<string[]>(vulnClasses.map(v => v.id))
  const [exploitEnabled, setExploitEnabled] = useState(true)
  const [minSeverity, setMinSeverity] = useState('low')
  const [rulesOfEngagement, setRulesOfEngagement] = useState('')

  const toggleVuln = (id: string) => {
    setEnabledVulns(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])
  }

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar showSearch={false} title="New Scan" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6 stagger-children">
          <div className="mb-2 animate-fade-in">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-on-background">Configure Scan</h2>
            <p className="text-on-surface-variant text-sm mt-1">Set up target, authentication, and scope for your security assessment.</p>
          </div>

          {/* Target Configuration */}
          <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-[20px]">target</span>
              <h3 className="text-base font-semibold text-on-surface">Target</h3>
            </div>
            <div className="space-y-4">
              <InputField label="Target URL" value={targetUrl} onChange={setTargetUrl} placeholder="https://your-app.com" required />
              <InputField label="Repository Path" value={repoPath} onChange={setRepoPath} placeholder="/path/to/repo" mono required />
              <InputField label="Workspace Name" value={workspace} onChange={setWorkspace} placeholder="q1-audit (optional)" />
              <div>
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant resize-none"
                  placeholder="Describe the target environment..."
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block text-right">{description.length}/500</span>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-[20px]">key</span>
              <h3 className="text-base font-semibold text-on-surface">Authentication</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Login Type</label>
                <div className="flex gap-2">
                  {['form', 'sso', 'api', 'basic'].map(type => (
                    <button
                      key={type}
                      onClick={() => setLoginType(type)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-all cursor-pointer ${
                        loginType === type
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <InputField label="Login URL" value={loginUrl} onChange={setLoginUrl} placeholder="https://your-app.com/login" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Username / Email" value={username} onChange={setUsername} placeholder="test@example.com" />
                <InputField label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
              </div>
              <InputField label="TOTP Secret (Optional)" value={totpSecret} onChange={setTotpSecret} placeholder="LB2E2RX7XFHSTGCK" mono />
            </div>
          </section>

          {/* Scan Scope */}
          <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              <h3 className="text-base font-semibold text-on-surface">Scan Scope</h3>
            </div>

            <div className="mb-5">
              <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3">Vulnerability Classes</label>
              <div className="grid grid-cols-5 gap-3">
                {vulnClasses.map(vc => {
                  const enabled = enabledVulns.includes(vc.id)
                  return (
                    <button
                      key={vc.id}
                      onClick={() => toggleVuln(vc.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer active:scale-90 ${
                        enabled
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{vc.icon}</span>
                      <span className="text-xs font-medium">{vc.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-outline-variant">
              <div>
                <span className="text-sm font-medium text-on-surface">Exploitation Phase</span>
                <p className="text-xs text-on-surface-variant mt-0.5">Run real exploits against the application to confirm vulnerabilities</p>
              </div>
              <button
                onClick={() => setExploitEnabled(!exploitEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${exploitEnabled ? 'bg-primary' : 'bg-outline-variant'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${exploitEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Rules of Engagement</label>
              <textarea
                value={rulesOfEngagement}
                onChange={e => setRulesOfEngagement(e.target.value)}
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant resize-none font-mono text-xs"
                placeholder="- No password brute-force; cap login attempts at 5&#10;- Throttle to under 5 req/s per endpoint"
              />
            </div>
          </section>

          {/* Report Filters */}
          <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-[20px]">filter_alt</span>
              <h3 className="text-base font-semibold text-on-surface">Report Filters</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Min Severity</label>
                <div className="relative">
                  <select
                    value={minSeverity}
                    onChange={e => setMinSeverity(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Min Confidence</label>
                <div className="relative">
                  <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary appearance-none cursor-pointer">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          {/* Launch */}
          <button className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-sm cursor-pointer hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] focus-ring">
            <span className="material-symbols-outlined">rocket_launch</span>
            Start Scan
          </button>
        </div>
      </main>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text', mono, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; mono?: boolean; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant ${mono ? 'font-mono text-xs' : ''}`}
        placeholder={placeholder}
      />
    </div>
  )
}
