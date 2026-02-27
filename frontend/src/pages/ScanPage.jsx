import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScan } from '../services/api';

function ScanPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await startScan(domain.trim());
      navigate(`/dashboard/${result.scan_id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Scan failed. Check backend connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* ═══ Hero ═══ */}
      <section className="pt-16 pb-14 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight leading-tight">
          Sentinel<span className="text-accent-hover">AI</span>
        </h1>
        <p className="text-text-secondary text-sm font-medium uppercase tracking-[0.2em] mt-3">
          Attack Surface Intelligence Platform
        </p>
        <p className="text-text-muted text-sm mt-5 max-w-lg mx-auto leading-relaxed">
          Quantify external exposure. Model attack paths. Deliver executive clarity.
        </p>

        {/* Domain Input */}
        <form onSubmit={handleScan} className="mt-10 max-w-md mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative focus-ring rounded-lg">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent/40 disabled:opacity-40 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze Domain'
              )}
            </button>
          </div>
          <button
            type="button"
            className="mt-3 text-text-muted text-xs hover:text-text-secondary transition-colors"
            onClick={() => { setDomain('microsoft.com'); }}
          >
            View Demo → microsoft.com
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-5 max-w-md mx-auto px-4 py-2.5 bg-critical/8 border border-critical/15 rounded-lg text-critical text-xs text-left">
            <span className="font-semibold">Error: </span>{error}
          </div>
        )}

        {/* Credibility Badges */}
        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          {[
            { label: 'Deterministic Risk Engine', icon: '◆' },
            { label: 'AI-Augmented Intelligence', icon: '◇' },
            { label: 'MITRE-Aligned Attack Modeling', icon: '▣' },
          ].map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-md text-[10px] text-text-muted font-medium tracking-wide"
            >
              <span className="text-accent-hover text-[8px]">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ Feature Preview Section ═══ */}
      <section className="pb-16 max-w-4xl mx-auto animate-fade-in-up stagger-2" style={{opacity:0}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Preview 1 — Risk Overview */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-accent-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-xs font-semibold text-text-primary tracking-wide">Risk Overview</h3>
            </div>
            {/* Mini gauge */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-bg-elevated" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-low" strokeDasharray="70 100" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-text-primary">78</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-critical" />
                  <span className="text-[10px] text-text-muted">Critical 0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-high" />
                  <span className="text-[10px] text-text-muted">High 1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-medium" />
                  <span className="text-[10px] text-text-muted">Medium 3</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-low" />
                  <span className="text-[10px] text-text-muted">Low 4</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Weighted posture scoring with severity, service density, and infrastructure concentration.
            </p>
          </div>

          {/* Preview 2 — Attack Simulation */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-critical/8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-critical" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="text-xs font-semibold text-text-primary tracking-wide">Attack Simulation</h3>
            </div>
            {/* Mini attack chain */}
            <div className="space-y-2.5">
              {['Initial Access', 'Privilege Escalation', 'Lateral Movement', 'Data Exfiltration'].map((stage, i) => {
                const colors = ['text-high', 'text-critical', 'text-medium', 'text-critical'];
                const bgs = ['bg-high/8', 'bg-critical/8', 'bg-medium/8', 'bg-critical/8'];
                return (
                  <div key={stage} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full ${bgs[i]} flex items-center justify-center`}>
                      <span className={`text-[9px] font-bold ${colors[i]}`}>{i + 1}</span>
                    </div>
                    <span className="text-[11px] text-text-secondary">{stage}</span>
                    {i < 3 && <span className="text-text-muted/30 text-[10px]">→</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed mt-4">
              Deterministic MITRE ATT&CK–mapped chains with AI-enhanced narratives.
            </p>
          </div>

          {/* Preview 3 — Strategic Intelligence */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-cyan/8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-xs font-semibold text-text-primary tracking-wide">Strategic Intelligence</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-low/10 text-low rounded border border-low/15">Advanced</span>
                <span className="text-[10px] text-text-muted">Maturity Level</span>
              </div>
              <div>
                <p className="text-[10px] text-text-muted mb-1">Dominant Risk Theme</p>
                <p className="text-[11px] text-text-secondary">Service exposure on non-production interfaces</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted mb-1.5">Top Priorities</p>
                <div className="space-y-1">
                  {['Restrict staging access', 'Harden admin portals', 'Reduce port surface'].map((p, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-accent-hover text-[9px] font-bold mt-px">{i + 1}.</span>
                      <span className="text-[10px] text-text-secondary leading-tight">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ScanPage;
