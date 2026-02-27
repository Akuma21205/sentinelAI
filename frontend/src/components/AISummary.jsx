import { useState } from 'react';
import { getSummary, simulateAttack } from '../services/api';
import AttackSimulation from './AttackSimulation';
import PostureIntelligence from './PostureIntelligence';

function AISummary({ scanId }) {
  const [summary, setSummary] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [simulationError, setSimulationError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleSummary = async () => {
    setLoadingSummary(true);
    setSummaryError('');
    try {
      const data = await getSummary(scanId);
      setSummary(data);
    } catch (err) {
      setSummaryError(err.response?.data?.detail || 'Failed to generate summary.');
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
      setSimulationError(err.response?.data?.detail || 'Failed to simulate attack.');
    } finally {
      setLoadingSimulation(false);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* Header with AI toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Intelligence</h3>
        <button
          onClick={() => setAiEnabled(!aiEnabled)}
          className="flex items-center gap-2 text-[10px] font-medium text-text-muted hover:text-text-secondary transition-colors"
        >
          <span className="uppercase tracking-wider">AI Augmentation</span>
          <div className={`relative w-7 h-3.5 rounded-full transition-colors duration-200 ${aiEnabled ? 'bg-accent/25' : 'bg-bg-elevated border border-border'}`}>
            <div className={`absolute top-[2px] w-2.5 h-2.5 rounded-full transition-all duration-200 ${aiEnabled ? 'bg-accent-hover' : 'bg-text-muted/30'}`} style={{ left: aiEnabled ? '15px' : '2px' }} />
          </div>
          <span className={`text-[9px] font-mono ${aiEnabled ? 'text-accent-hover' : 'text-text-muted/40'}`}>{aiEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSummary}
          disabled={loadingSummary}
          className="px-4 py-2 bg-accent-muted hover:bg-accent/15 text-accent-hover text-xs font-semibold rounded-lg border border-accent/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loadingSummary ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          )}
          {loadingSummary ? 'Generating...' : 'Executive Summary'}
        </button>
        <button
          onClick={handleSimulation}
          disabled={loadingSimulation}
          className="px-4 py-2 bg-critical/6 hover:bg-critical/10 text-critical text-xs font-semibold rounded-lg border border-critical/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loadingSimulation ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          )}
          {loadingSimulation ? 'Simulating...' : `Attack Simulation${!aiEnabled ? ' (Deterministic)' : ''}`}
        </button>
        <PostureIntelligence scanId={scanId} />
      </div>

      {/* Errors */}
      {summaryError && (
        <div className="px-3 py-2 bg-critical/6 border border-critical/15 rounded-lg text-critical text-xs">
          <span className="font-semibold">Error: </span>{summaryError}
        </div>
      )}
      {simulationError && (
        <div className="px-3 py-2 bg-critical/6 border border-critical/15 rounded-lg text-critical text-xs">
          <span className="font-semibold">Error: </span>{simulationError}
        </div>
      )}

      {/* Executive Summary */}
      {summary && (
        <div className="card overflow-hidden animate-fade-in-up">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-bg-card-hover/30 transition-colors"
          >
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Executive Summary</h4>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-text-muted transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {summaryOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-border">
              <p className="text-text-secondary text-sm leading-relaxed pt-4">{summary.summary}</p>

              {summary.top_risks?.length > 0 && (
                <div className="bg-critical/4 border border-critical/10 rounded-lg p-4">
                  <h5 className="text-[10px] uppercase tracking-widest text-critical font-bold mb-2.5">Top Risks</h5>
                  <ul className="space-y-2">
                    {summary.top_risks.map((risk, i) => (
                      <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-critical/20">{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.recommendations?.length > 0 && (
                <div className="bg-low/4 border border-low/10 rounded-lg p-4">
                  <h5 className="text-[10px] uppercase tracking-widest text-low font-bold mb-2.5">Recommendations</h5>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-low/20">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Attack Simulation */}
      {simulation && (
        <div className="card p-5">
          <AttackSimulation simulation={simulation} />
        </div>
      )}
    </div>
  );
}

export default AISummary;
