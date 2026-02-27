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
    <div className="flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md">
        {/* Icon & Title */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-accent/10 border border-accent/20 blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-1.5 tracking-tight">
            Attack Surface Scanner
          </h2>
          <p className="text-text-muted text-sm">
            Discover subdomains, open ports, and security risks
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleScan} className="space-y-3 animate-fade-in-up stagger-2" style={{opacity: 0}}>
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-accent/10 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              disabled={loading}
              className="relative w-full px-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:border-accent/50 disabled:opacity-40 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 glow-accent"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Scanning target...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                Start Scan
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 px-4 py-3 bg-critical/10 border border-critical/20 rounded-xl text-critical text-xs glow-critical animate-fade-in-up">
            <span className="font-semibold">Error: </span>{error}
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-3 animate-fade-in-up stagger-3" style={{opacity: 0}}>
          {[
            { icon: '🔍', label: 'Subdomain Discovery' },
            { icon: '🛡️', label: 'Risk Analysis' },
            { icon: '🤖', label: 'AI Insights' },
          ].map((f) => (
            <div key={f.label} className="glass-card rounded-xl px-3 py-3 text-center">
              <div className="text-lg mb-1">{f.icon}</div>
              <p className="text-[10px] text-text-muted font-medium tracking-wide uppercase">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
