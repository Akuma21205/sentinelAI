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
    <div className="relative w-3.5 h-3.5">
      <div className="absolute inset-0 rounded-full border-2 border-current/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <span className="gradient-text text-base">✦</span>
          Intelligence
        </h3>
        <button
          onClick={() => setAiEnabled(!aiEnabled)}
          className="flex items-center gap-2.5 text-[10px] font-bold text-text-muted hover:text-text-secondary transition-colors"
        >
          <span className="uppercase tracking-[0.15em]">AI Augmentation</span>
          <div className={`relative w-8 h-4 rounded-full transition-all duration-300 ${aiEnabled ? 'bg-gradient-to-r from-accent to-purple shadow-[0_0_12px_rgba(124,58,237,0.3)]' : 'bg-bg-elevated border border-border'}`}>
            <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all duration-300 ${aiEnabled ? 'left-[18px] shadow-md' : 'left-[2px] opacity-50'}`} />
          </div>
          <span className={`text-[9px] font-mono font-black ${aiEnabled ? 'text-accent-hover' : 'text-text-muted/30'}`}>{aiEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSummary}
          disabled={loadingSummary}
          className="px-4 py-2.5 bg-gradient-to-r from-accent/15 to-accent/5 hover:from-accent/25 hover:to-accent/10 text-accent-hover text-xs font-bold rounded-xl border border-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]"
        >
          {loadingSummary ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          )}
          {loadingSummary ? 'Generating...' : 'Executive Summary'}
        </button>
        <button
          onClick={handleSimulation}
          disabled={loadingSimulation}
          className="px-4 py-2.5 bg-gradient-to-r from-critical/15 to-critical/5 hover:from-critical/25 hover:to-critical/10 text-critical text-xs font-bold rounded-xl border border-critical/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,71,87,0.1)]"
        >
          {loadingSimulation ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          )}
          {loadingSimulation ? 'Simulating...' : `Attack Simulation${!aiEnabled ? ' (Det.)' : ''}`}
        </button>
        <PostureIntelligence scanId={scanId} />
      </div>

      {/* Errors */}
      {summaryError && <div className="px-4 py-2.5 glass rounded-xl chip-critical text-xs"><span className="font-bold">Error: </span>{summaryError}</div>}
      {simulationError && <div className="px-4 py-2.5 glass rounded-xl chip-critical text-xs"><span className="font-bold">Error: </span>{simulationError}</div>}

      {/* Executive Summary */}
      {summary && (
        <div className="glass rounded-2xl overflow-hidden animate-fade-up">
          <button onClick={() => setSummaryOpen(!summaryOpen)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-[0.15em]">Executive Summary</h4>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-text-muted transition-transform duration-300 ${summaryOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {summaryOpen && (
            <div className="px-6 pb-6 space-y-4 border-t border-border">
              <p className="text-text-secondary text-sm leading-relaxed pt-4">{summary.summary}</p>

              {summary.top_risks?.length > 0 && (
                <div className="bg-gradient-to-r from-critical/8 to-transparent rounded-xl p-4 border border-critical/10">
                  <h5 className="text-[9px] uppercase tracking-[0.15em] text-critical font-black mb-2.5">Top Risks</h5>
                  <ul className="space-y-2">
                    {summary.top_risks.map((risk, i) => (
                      <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-critical/20">{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.recommendations?.length > 0 && (
                <div className="bg-gradient-to-r from-low/8 to-transparent rounded-xl p-4 border border-low/10">
                  <h5 className="text-[9px] uppercase tracking-[0.15em] text-low font-black mb-2.5">Recommendations</h5>
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
        <div className="glass rounded-2xl p-6">
          <AttackSimulation simulation={simulation} />
        </div>
      )}
    </div>
  );
}

export default AISummary;
