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
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
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
          <div className="w-12 h-12 rounded-xl bg-critical/10 border border-critical/20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-critical" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <p className="text-critical text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-accent-hover hover:text-accent text-sm font-medium transition-colors"
          >
            ← Back to Scanner
          </button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">{scanData?.domain}</h2>
            <p className="text-text-muted text-xs font-mono mt-0.5">ID: {scanId?.slice(0, 12)}...</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-bg-card hover:bg-bg-card-hover text-text-secondary text-xs font-medium rounded-lg border border-border transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          New Scan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-in-up stagger-1" style={{opacity:0}}>
        <SummaryCards total={scanData?.total_assets || 0} counts={severityCounts} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-2" style={{opacity:0}}>
        <RiskChart counts={severityCounts} />
        <HeatmapGrid assets={assets} />
      </div>

      {/* Assets Table */}
      <div className="animate-fade-in-up stagger-3" style={{opacity:0}}>
        <AssetsTable assets={assets} />
      </div>

      {/* AI Section */}
      <div className="animate-fade-in-up stagger-4" style={{opacity:0}}>
        <AISummary scanId={scanId} />
      </div>
    </div>
  );
}

export default Dashboard;
