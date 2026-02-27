import { useState } from 'react';
import { getSummary, simulateAttack } from '../services/api';

function AISummary({ scanId }) {
  const [summary, setSummary] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [simulationError, setSimulationError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [simulationOpen, setSimulationOpen] = useState(true);

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
      const data = await simulateAttack(scanId);
      setSimulation(data);
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

  const ChevronIcon = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 2 1 3 2 4l-5 5a2 2 0 1 0 3 3l5-5c1 1 2 2 4 2a4 4 0 0 0 0-8"/><path d="M15 9l3-3"/></svg>
        <h3 className="text-sm font-semibold text-text-primary">AI Analysis</h3>
        <span className="text-[9px] text-accent-hover bg-accent-muted px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Powered by Groq</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSummary}
          disabled={loadingSummary}
          className="px-4 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent-hover text-xs font-semibold rounded-lg border border-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loadingSummary ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          )}
          {loadingSummary ? 'Generating...' : 'Executive Summary'}
        </button>
        <button
          onClick={handleSimulation}
          disabled={loadingSimulation}
          className="px-4 py-2.5 bg-critical/10 hover:bg-critical/15 text-critical text-xs font-semibold rounded-lg border border-critical/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loadingSimulation ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          )}
          {loadingSimulation ? 'Simulating...' : 'Attack Simulation'}
        </button>
      </div>

      {/* Errors */}
      {summaryError && (
        <div className="px-3 py-2 bg-critical/10 border border-critical/20 rounded-lg text-critical text-xs">
          <span className="font-semibold">Error: </span>{summaryError}
        </div>
      )}
      {simulationError && (
        <div className="px-3 py-2 bg-critical/10 border border-critical/20 rounded-lg text-critical text-xs">
          <span className="font-semibold">Error: </span>{simulationError}
        </div>
      )}

      {/* Executive Summary */}
      {summary && (
        <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-bg-card-hover/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-hover animate-pulse-dot" />
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Executive Summary</h4>
            </div>
            <ChevronIcon open={summaryOpen} />
          </button>
          {summaryOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-border/50">
              <p className="text-text-secondary text-sm leading-relaxed pt-4">{summary.summary}</p>

              {summary.top_risks?.length > 0 && (
                <div className="bg-critical/5 border border-critical/10 rounded-lg p-4">
                  <h5 className="text-[10px] uppercase tracking-widest text-critical font-bold mb-2.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-critical" />
                    Top Risks
                  </h5>
                  <ul className="space-y-2">
                    {summary.top_risks.map((risk, i) => (
                      <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-critical/30">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.recommendations?.length > 0 && (
                <div className="bg-low/5 border border-low/10 rounded-lg p-4">
                  <h5 className="text-[10px] uppercase tracking-widest text-low font-bold mb-2.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-low" />
                    Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-low/30">
                        {rec}
                      </li>
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
        <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
          <button
            onClick={() => setSimulationOpen(!simulationOpen)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-bg-card-hover/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse-dot" />
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Attack Simulation</h4>
            </div>
            <ChevronIcon open={simulationOpen} />
          </button>
          {simulationOpen && (
            <div className="px-5 pb-5 border-t border-border/50">
              <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-sans pt-4">
                {simulation.attack_simulation}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AISummary;
