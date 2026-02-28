import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScan } from '../services/api';
import SummaryCards from '../components/SummaryCards';
import AssetsTable from '../components/AssetsTable';
import RiskChart from '../components/RiskChart';
import HeatmapGrid from '../components/HeatmapGrid';
import AISummary from '../components/AISummary';

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 32px',
  width: '100%',
};

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
      <div style={container}>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="relative mx-auto" style={{ width: '48px', height: '48px', marginBottom: '20px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--color-border)' }} />
              <div className="animate-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--color-accent)' }} />
            </div>
            <p className="text-text-muted" style={{ fontSize: '14px' }}>Loading scan results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={container}>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center" style={{ maxWidth: '400px', background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '40px' }}>
            <p className="text-critical" style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => navigate('/')}
              className="text-accent hover:text-accent-hover transition-colors"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              ← Back to Scanner
            </button>
          </div>
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
    <div style={container}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingTop: '40px', paddingBottom: '80px' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              className="flex items-center justify-center"
              style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-text-primary">{scanData?.domain}</h2>
              <p className="text-text-muted font-mono" style={{ fontSize: '12px', marginTop: '2px' }}>{scanId?.slice(0, 16)}...</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-text-secondary hover:text-text-primary transition-colors flex items-center"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'white',
              gap: '8px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            New Scan
          </button>
        </div>

        {/* Summary Cards */}
        <div className="animate-fade-up stagger-1" style={{ opacity: 0 }}>
          <SummaryCards total={scanData?.total_assets || 0} counts={severityCounts} avgRisk={avgRisk} />
        </div>

        {/* Empty State */}
        {assets.length === 0 ? (
          <div className="animate-fade-up stagger-2" style={{ opacity: 0, background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
            <div
              className="flex items-center justify-center mx-auto"
              style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(79,175,123,0.08)', marginBottom: '16px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-low" style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }} className="text-text-primary">Minimal Attack Surface</h3>
            <p className="text-text-muted" style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
              No notable exposure found for <span className="font-mono text-accent">{scanData?.domain}</span>.
            </p>
          </div>
        ) : (
          <>
            {/* Charts Row */}
            <div className="animate-fade-up stagger-2" style={{ opacity: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              <RiskChart counts={severityCounts} />
              <HeatmapGrid assets={assets} />
            </div>

            {/* Assets Table */}
            <div className="animate-fade-up stagger-3" style={{ opacity: 0 }}>
              <AssetsTable assets={assets} />
            </div>

            {/* Intelligence Section */}
            <div className="animate-fade-up stagger-4" style={{ opacity: 0 }}>
              <AISummary scanId={scanId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
