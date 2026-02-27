import { useState } from 'react';
import { getPosture } from '../services/api';

const MATURITY_COLORS = {
  Basic:        { bg: 'bg-critical/8', text: 'text-critical', border: 'border-critical/15' },
  Developing:   { bg: 'bg-high/8', text: 'text-high', border: 'border-high/15' },
  Intermediate: { bg: 'bg-medium/8', text: 'text-medium', border: 'border-medium/15' },
  Advanced:     { bg: 'bg-low/8', text: 'text-low', border: 'border-low/15' },
};

function PostureGauge({ score }) {
  const color = score >= 75 ? '#3bba6a' : score >= 55 ? '#d4a72c' : score >= 30 ? '#e8873a' : '#e54d4d';
  const label = score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : score >= 30 ? 'Weak' : 'Critical';
  const pct = score / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-bg-elevated" />
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2.5" strokeDasharray={`${pct * 94.2} 94.2`} strokeLinecap="round" style={{ stroke: color, transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-text-primary">{score}</span>
          <span className="text-[8px] text-text-muted font-semibold uppercase tracking-wider">{label}</span>
        </div>
      </div>
      <p className="text-[8px] text-text-muted/50 text-center mt-2 max-w-[140px] leading-tight">
        Severity distribution, service density, infrastructure concentration.
      </p>
    </div>
  );
}

function StatCard({ label, value, tooltip }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 relative">
      <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold mb-1 flex items-center gap-1">
        {label}
        {tooltip && (
          <span
            className="ml-auto cursor-help text-text-muted/30 hover:text-text-muted transition-colors"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </span>
        )}
      </p>
      <p className="text-sm text-text-primary font-medium leading-snug">{value}</p>
      {showTip && tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bg-secondary border border-border rounded-md px-2.5 py-1.5 text-[9px] text-text-muted shadow-md z-20 w-48 text-center">
          {tooltip}
        </div>
      )}
    </div>
  );
}

function PostureIntelligence({ scanId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getPosture(scanId);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Strategic intelligence unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading && !error) {
    return (
      <button
        onClick={handleGenerate}
        className="px-4 py-2 bg-cyan/6 hover:bg-cyan/10 text-cyan text-xs font-semibold rounded-lg border border-cyan/15 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Strategic Posture
      </button>
    );
  }

  if (loading) {
    return (
      <div className="card-elevated p-6 flex items-center justify-center gap-3">
        <svg className="animate-spin w-4 h-4 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-text-muted text-sm">Generating strategic intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 bg-critical/6 border border-critical/15 rounded-lg text-critical text-xs">
        <span className="font-semibold">Error: </span>{error}
      </div>
    );
  }

  const maturity = MATURITY_COLORS[data.maturity_level] || MATURITY_COLORS.Developing;
  const confidencePct = Math.round((data.confidence_score || 0) * 100);

  return (
    <div className="card-elevated overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan/8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Strategic Intelligence</h4>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Confidence</p>
          <p className="text-sm font-bold text-text-primary">{confidencePct}%</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="flex justify-center">
            <PostureGauge score={data.posture_score} />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold mb-1">Maturity Level</p>
              <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${maturity.bg} ${maturity.text} border ${maturity.border}`}>
                {data.maturity_level}
              </span>
            </div>
            <StatCard label="Attacker Profile" value={data.likely_attacker_profile} />
          </div>

          <div className="space-y-3">
            <StatCard
              label="Dominant Risk Theme"
              value={data.dominant_risk_theme}
            />
          </div>
        </div>

        {/* Strategic outlook */}
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold mb-1.5">Strategic Risk Outlook</p>
          <p className="text-xs text-text-secondary leading-relaxed">{data.strategic_risk_outlook}</p>
        </div>

        {/* Priorities */}
        {data.priority_improvements?.length > 0 && (
          <div className="bg-low/4 border border-low/10 rounded-lg p-4">
            <p className="text-[9px] uppercase tracking-widest text-low font-bold mb-2.5">Strategic Priorities</p>
            <ol className="space-y-2">
              {data.priority_improvements.map((item, i) => (
                <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-low/20 flex items-start gap-2">
                  <span className="text-low font-bold shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Assessment basis */}
        {data.assessment_basis?.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold mb-1.5">Assessment Basis</p>
            <div className="flex flex-wrap gap-1.5">
              {data.assessment_basis.map((basis, i) => (
                <span key={i} className="px-2 py-0.5 bg-bg-elevated text-text-muted rounded text-[10px] font-mono border border-border">
                  {basis}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostureIntelligence;
