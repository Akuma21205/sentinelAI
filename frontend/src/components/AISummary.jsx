import { useState } from 'react';
import { getSummary, simulateAttack } from '../services/api';
import AttackSimulation from './AttackSimulation';
import PostureIntelligence from './PostureIntelligence';

const TABS = ['Executive Summary', 'Attack Simulation', 'Strategic Intelligence'];

function AISummary({ scanId }) {
  const [activeTab, setActiveTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [simulationError, setSimulationError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleSummary = async () => {
    setLoadingSummary(true);
    setSummaryError('');
    try {
      const data = await getSummary(scanId);
      setSummary(data);
    } catch (err) {
      setSummaryError(err.response?.data?.detail || 'Summary generation failed.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSimulation = async () => {
    setLoadingSimulation(true);
    setSimulationError('');
    try {
      const data = await simulateAttack(scanId, !aiEnabled);
      setSimulation(data.attack_simulation || data);
    } catch (err) {
      setSimulationError(err.response?.data?.detail || 'Simulation failed.');
    } finally {
      setLoadingSimulation(false);
    }
  };

  const Spinner = () => (
    <div style={{ position: 'relative', width: '14px', height: '14px' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--color-border)' }} />
      <div className="animate-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'currentColor' }} />
    </div>
  );

  return (
    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header with tab bar and AI toggle */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="text-accent" style={{ fontSize: '16px' }}>✦</span>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }} className="text-text-primary">Intelligence</h3>
        </div>

        {/* AI Toggle — minimal switch */}
        <button
          onClick={() => setAiEnabled(!aiEnabled)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="text-text-muted">AI Augmentation</span>
          <div style={{
            position: 'relative', width: '36px', height: '20px', borderRadius: '10px',
            backgroundColor: aiEnabled ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
            border: aiEnabled ? 'none' : '1px solid var(--color-border)',
            transition: 'all 0.2s ease',
          }}>
            <div style={{
              position: 'absolute', top: '3px', width: '14px', height: '14px', borderRadius: '50%',
              backgroundColor: 'white',
              left: aiEnabled ? '19px' : '3px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }} />
          </div>
          <span className="font-mono" style={{ fontSize: '10px', fontWeight: 800, color: aiEnabled ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
            {aiEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Segmented Tab Bar */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: '4px', backgroundColor: 'var(--color-bg-primary)' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: activeTab === i ? 700 : 500,
              borderRadius: '8px 8px 0 0',
              border: activeTab === i ? '1px solid var(--color-border)' : '1px solid transparent',
              borderBottom: activeTab === i ? '1px solid white' : '1px solid transparent',
              backgroundColor: activeTab === i ? 'white' : 'transparent',
              color: activeTab === i ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
              bottom: '-1px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '28px 24px', borderTop: '1px solid var(--color-border)' }}>

        {/* ─── Tab 0: Executive Summary ─── */}
        {activeTab === 0 && (
          <div>
            {!summary && !loadingSummary && !summaryError && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p className="text-text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>Generate an AI-powered executive summary of the scan results.</p>
                <button
                  onClick={handleSummary}
                  disabled={loadingSummary}
                  className="btn-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ padding: '12px 28px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Generate Summary
                </button>
              </div>
            )}

            {loadingSummary && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 0' }}>
                <Spinner />
                <span className="text-text-muted" style={{ fontSize: '14px' }}>Generating executive summary...</span>
              </div>
            )}

            {summaryError && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(217,79,79,0.15)', backgroundColor: 'rgba(217,79,79,0.04)', fontSize: '13px' }} className="text-critical">
                <span style={{ fontWeight: 700 }}>Error: </span>{summaryError}
              </div>
            )}

            {summary && (
              <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Overview */}
                <p className="text-text-secondary" style={{ fontSize: '14px', lineHeight: 1.7 }}>{summary.summary}</p>

                {/* Top Risks */}
                {summary.top_risks?.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(217,79,79,0.04)', border: '1px solid rgba(217,79,79,0.1)', borderRadius: '12px', padding: '20px' }}>
                    <h5 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: 'var(--color-critical)', marginBottom: '12px' }}>Top Risks</h5>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                      {summary.top_risks.map((risk, i) => (
                        <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, paddingLeft: '14px', borderLeft: '2px solid rgba(217,79,79,0.2)' }} className="text-text-secondary">{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {summary.recommendations?.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(79,175,123,0.04)', border: '1px solid rgba(79,175,123,0.1)', borderRadius: '12px', padding: '20px' }}>
                    <h5 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: 'var(--color-low)', marginBottom: '12px' }}>Recommendations</h5>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                      {summary.recommendations.map((rec, i) => (
                        <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, paddingLeft: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }} className="text-text-secondary">
                          <span style={{ color: 'var(--color-low)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 1: Attack Simulation ─── */}
        {activeTab === 1 && (
          <div>
            {!simulation && !loadingSimulation && !simulationError && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p className="text-text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                  Simulate MITRE ATT&CK–mapped attack paths{!aiEnabled ? ' (deterministic only)' : ''}.
                </p>
                <button
                  onClick={handleSimulation}
                  disabled={loadingSimulation}
                  className="btn-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ padding: '12px 28px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Run Simulation
                </button>
              </div>
            )}

            {loadingSimulation && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 0' }}>
                <Spinner />
                <span className="text-text-muted" style={{ fontSize: '14px' }}>Running attack simulation...</span>
              </div>
            )}

            {simulationError && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(217,79,79,0.15)', backgroundColor: 'rgba(217,79,79,0.04)', fontSize: '13px' }} className="text-critical">
                <span style={{ fontWeight: 700 }}>Error: </span>{simulationError}
              </div>
            )}

            {simulation && <AttackSimulation simulation={simulation} />}
          </div>
        )}

        {/* ─── Tab 2: Strategic Intelligence ─── */}
        {activeTab === 2 && (
          <PostureIntelligence scanId={scanId} />
        )}
      </div>
    </div>
  );
}

export default AISummary;
