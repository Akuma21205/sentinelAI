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
          <svg className="animate-spin w-10 h-10 text-accent mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-slate-400">Loading scan data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="px-6 py-4 bg-critical/10 border border-critical/20 rounded-xl text-critical mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-accent hover:text-accent-hover transition-colors text-sm"
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{scanData?.domain}</h2>
          <p className="text-slate-400 text-sm mt-1">
            Scan ID: <span className="font-mono text-slate-500">{scanId}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors"
        >
          New Scan
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards total={scanData?.total_assets || 0} counts={severityCounts} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskChart counts={severityCounts} />
        <HeatmapGrid assets={assets} />
      </div>

      {/* Assets Table */}
      <AssetsTable assets={assets} />

      {/* AI Section */}
      <AISummary scanId={scanId} />
    </div>
  );
}

export default Dashboard;
