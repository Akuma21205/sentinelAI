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
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-border" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
          </div>
          <p className="text-text-muted text-sm">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <p className="text-critical text-sm mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="text-accent-hover hover:text-accent text-sm font-medium transition-colors">← Back to Scanner</button>
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
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight">{scanData?.domain}</h2>
          <p className="text-text-muted text-[11px] font-mono mt-0.5">{scanId?.slice(0, 16)}...</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-2 bg-bg-card hover:bg-bg-card-hover text-text-secondary text-xs font-medium rounded-lg border border-border transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          New Scan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-in-up stagger-1" style={{opacity:0}}>
        <SummaryCards total={scanData?.total_assets || 0} counts={severityCounts} avgRisk={avgRisk} />
      </div>

      {/* Empty State */}
      {assets.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in-up stagger-2" style={{opacity:0}}>
          <h3 className="text-base font-semibold text-text-primary mb-2">Minimal Public Attack Surface</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
            No discoverable assets with notable exposure for <span className="font-mono text-accent-hover">{scanData?.domain}</span>.
          </p>
          <p className="text-text-muted/40 text-xs mt-3">Consider rescanning with broader scope.</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up stagger-2" style={{opacity:0}}>
            <RiskChart counts={severityCounts} />
            <HeatmapGrid assets={assets} />
          </div>

          {/* Assets Table */}
          <div className="animate-fade-in-up stagger-3" style={{opacity:0}}>
            <AssetsTable assets={assets} />
          </div>

          {/* Intelligence */}
          <div className="animate-fade-in-up stagger-4" style={{opacity:0}}>
            <AISummary scanId={scanId} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
