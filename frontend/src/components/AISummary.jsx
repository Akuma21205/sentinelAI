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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200">AI Analysis</h3>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSummary}
          disabled={loadingSummary}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loadingSummary ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Executive Summary'
          )}
        </button>
        <button
          onClick={handleSimulation}
          disabled={loadingSimulation}
          className="px-5 py-2.5 bg-critical/20 hover:bg-critical/30 text-critical text-sm font-medium rounded-lg border border-critical/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loadingSimulation ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Simulating...
            </>
          ) : (
            'Simulate Attack'
          )}
        </button>
      </div>

      {/* Errors */}
      {summaryError && (
        <div className="px-4 py-3 bg-critical/10 border border-critical/20 rounded-xl text-critical text-sm">
          {summaryError}
        </div>
      )}
      {simulationError && (
        <div className="px-4 py-3 bg-critical/10 border border-critical/20 rounded-xl text-critical text-sm">
          {simulationError}
        </div>
      )}

      {/* Executive Summary */}
      {summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <h4 className="text-sm font-semibold text-slate-200">Executive Summary</h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {summaryOpen && (
            <div className="px-5 pb-5 space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">{summary.summary}</p>

              {summary.top_risks && summary.top_risks.length > 0 && (
                <div>
                  <h5 className="text-xs uppercase tracking-wider text-critical font-medium mb-2">Top Risks</h5>
                  <ul className="space-y-1.5">
                    {summary.top_risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-critical mt-1.5 shrink-0"/>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.recommendations && summary.recommendations.length > 0 && (
                <div>
                  <h5 className="text-xs uppercase tracking-wider text-low font-medium mb-2">Recommendations</h5>
                  <ul className="space-y-1.5">
                    {summary.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-low mt-1.5 shrink-0"/>
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setSimulationOpen(!simulationOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <h4 className="text-sm font-semibold text-slate-200">Attack Simulation</h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform ${simulationOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {simulationOpen && (
            <div className="px-5 pb-5">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
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
