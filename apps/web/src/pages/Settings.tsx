import { useState } from 'react'
import Topbar from '../components/layout/Topbar'

const tabs = [
  { id: 'provider', label: 'Provider', icon: 'key' },
  { id: 'pipeline', label: 'Pipeline', icon: 'tune' },
  { id: 'integrations', label: 'Integrations', icon: 'extension' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('provider')
  const [provider, setProvider] = useState('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [retryPreset, setRetryPreset] = useState('default')
  const [maxPipelines, setMaxPipelines] = useState(5)
  const [adaptiveThinking, setAdaptiveThinking] = useState(true)

  return (
    <div className="flex-1 flex flex-col md:ml-64 w-full">
      <Topbar showSearch={false} title="Settings" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-on-background">Settings</h2>
            <p className="text-on-surface-variant text-sm mt-1">Configure provider credentials, pipeline defaults, and integrations.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-outline-variant">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Provider Tab */}
          {activeTab === 'provider' && (
            <div className="space-y-6">
              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <h3 className="text-base font-semibold text-on-surface mb-5">LLM Provider</h3>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3">Provider</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'anthropic', label: 'Anthropic API', icon: 'smart_toy' },
                      { id: 'bedrock', label: 'AWS Bedrock', icon: 'cloud' },
                      { id: 'vertex', label: 'Google Vertex', icon: 'cloud_queue' },
                      { id: 'custom', label: 'Custom URL', icon: 'link' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setProvider(p.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all cursor-pointer ${
                          provider === p.id
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-outline'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">{p.icon}</span>
                        <span className="text-xs font-medium text-center">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant font-mono"
                      placeholder="sk-ant-api03-..."
                    />
                  </div>
                </div>
              </section>

              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <h3 className="text-base font-semibold text-on-surface mb-5">Model Tiers</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Small Tier', default: 'claude-haiku-4-5-20251001', desc: 'Summarization tasks' },
                    { label: 'Medium Tier', default: 'claude-sonnet-4-6', desc: 'Security analysis' },
                    { label: 'Large Tier', default: 'claude-opus-4-7', desc: 'Deep reasoning' },
                  ].map(tier => (
                    <div key={tier.label} className="flex items-center gap-4">
                      <div className="w-32">
                        <span className="text-xs font-medium text-on-surface">{tier.label}</span>
                        <p className="text-[10px] text-on-surface-variant">{tier.desc}</p>
                      </div>
                      <input
                        className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-xs text-on-background focus:outline-none focus:border-primary transition-colors font-mono"
                        defaultValue={tier.default}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Pipeline Tab */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <h3 className="text-base font-semibold text-on-surface mb-5">Pipeline Defaults</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Retry Preset</label>
                    <div className="flex gap-3">
                      {['default', 'subscription'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setRetryPreset(preset)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                            retryPreset === preset
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-surface-container-high border-outline-variant text-on-surface-variant'
                          }`}
                        >
                          {preset === 'default' ? 'Default (30min backoff)' : 'Subscription (6h backoff)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Max Concurrent Pipelines</label>
                      <span className="text-sm font-mono text-primary font-bold">{maxPipelines}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={maxPipelines}
                      onChange={e => setMaxPipelines(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                      <span>1 (slow, low cost)</span>
                      <span>5 (fast, high cost)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-outline-variant">
                    <div>
                      <span className="text-sm font-medium text-on-surface">Adaptive Thinking</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">Let Claude decide when and how deeply to reason (Opus 4.6/4.7)</p>
                    </div>
                    <button
                      onClick={() => setAdaptiveThinking(!adaptiveThinking)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${adaptiveThinking ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${adaptiveThinking ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <h3 className="text-base font-semibold text-on-surface mb-5">CI/CD Integration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Webhook URL</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant font-mono text-xs"
                      placeholder="https://your-ci.com/webhooks/shannon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">GitHub Repository</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant font-mono text-xs"
                      placeholder="org/repo"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-base font-semibold text-on-surface">GitHub PR Scanning</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-primary/30 bg-primary/10 text-primary">Pro</span>
                </div>
                <p className="text-sm text-on-surface-variant">Automatically trigger scans on pull requests. Configure branch patterns and scan scope per repository.</p>
                <button className="mt-4 bg-primary/10 text-primary text-xs font-medium px-4 py-2 rounded-lg border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Configure Repository
                </button>
              </section>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <h3 className="text-base font-semibold text-on-surface mb-5">Alert Rules</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Critical findings detected', desc: 'Alert when a scan discovers critical-severity findings', enabled: true },
                    { label: 'Scan completed', desc: 'Notify when any scan finishes successfully', enabled: true },
                    { label: 'Scan failed', desc: 'Alert on scan failures or errors', enabled: true },
                    { label: 'Weekly digest', desc: 'Summary of all scan activity sent weekly', enabled: false },
                  ].map(rule => (
                    <div key={rule.label} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
                      <div>
                        <span className="text-sm font-medium text-on-surface">{rule.label}</span>
                        <p className="text-xs text-on-surface-variant mt-0.5">{rule.desc}</p>
                      </div>
                      <button className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${rule.enabled ? 'bg-primary' : 'bg-outline-variant'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-4' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-surface-container border border-outline-variant rounded-lg p-6">
                <h3 className="text-base font-semibold text-on-surface mb-5">Channels</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Slack Webhook</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant font-mono text-xs"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Email</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant"
                      placeholder="security-team@company.com"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button className="bg-primary text-on-primary text-sm font-medium px-6 py-2 rounded-lg hover:bg-primary-container transition-colors active:scale-95 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
