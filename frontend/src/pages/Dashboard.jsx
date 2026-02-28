import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScan } from '../services/api';
import SummaryCards from '../components/SummaryCards';
import AssetsTable from '../components/AssetsTable';
import RiskChart from '../components/RiskChart';
import HeatmapGrid from '../components/HeatmapGrid';
import AISummary from '../components/AISummary';

function Dashboard() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchScan() {
      try {
        const data = await getScan(scanId);
        setScanData(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load scan data.');
      } finally {
        setLoading(false);
      }
    }
    fetchScan();
  }, [scanId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-accent/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan animate-spin" style={{animationDirection:'reverse', animationDuration:'0.8s'}} />
          </div>
          <p className="text-text-muted text-sm">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm glass rounded-2xl p-8">
          <p className="text-critical text-sm mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="text-accent-hover hover:text-accent text-sm font-semibold transition-colors">← Back to Scanner</button>
        </div>
      </div>
    );
  }

  const assets = scanData?.assets || [];
  const severityCounts = {
    Critical: assets.filter(a => a.severity === 'Critical').length,
    High: assets.filter(a => a.severity === 'High').length,
    Medium: assets.filter(a => a.severity === 'Medium').length,
    Low: assets.filter(a => a.severity === 'Low').length,
  };

  const avgRisk = assets.length > 0
    ? Math.round(assets.reduce((sum, a) => sum + (a.risk_score || 0), 0) / assets.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-accent/20 blur-lg" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight">{scanData?.domain}</h2>
            <p className="text-text-muted text-[11px] font-mono mt-0.5">{scanId?.slice(0, 16)}...</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2.5 glass hover:bg-white/[0.04] text-text-secondary text-xs font-semibold rounded-xl border border-border transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          New Scan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-up stagger-1" style={{opacity:0}}>
        <SummaryCards total={scanData?.total_assets || 0} counts={severityCounts} avgRisk={avgRisk} />
      </div>

      {/* Empty State */}
      {assets.length === 0 ? (
        <div className="glass-glow rounded-2xl p-12 text-center animate-fade-up stagger-2" style={{opacity:0}}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-low/20 to-low/5 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h3 className="text-lg font-black text-text-primary mb-2">Minimal Attack Surface</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
            No notable exposure found for <span className="font-mono gradient-text">{scanData?.domain}</span>.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-up stagger-2" style={{opacity:0}}>
            <RiskChart counts={severityCounts} />
            <HeatmapGrid assets={assets} />
          </div>

          {/* Assets Table */}
          <div className="animate-fade-up stagger-3" style={{opacity:0}}>
            <AssetsTable assets={assets} />
          </div>

          {/* Intelligence Section */}
          <div className="animate-fade-up stagger-4" style={{opacity:0}}>
            <AISummary scanId={scanId} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
