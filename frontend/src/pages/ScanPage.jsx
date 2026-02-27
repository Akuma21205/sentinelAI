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
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">
            Attack Surface Scanner
          </h2>
          <p className="text-slate-400 text-sm">
            Enter a domain to discover subdomains, open ports, and security risks
          </p>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 disabled:opacity-50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Scanning...
              </>
            ) : (
              'Start Scan'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 px-4 py-3 bg-critical/10 border border-critical/20 rounded-xl text-critical text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanPage;
