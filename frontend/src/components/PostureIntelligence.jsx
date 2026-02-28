import { useState } from 'react';
import { getPosture } from '../services/api';

const MATURITY_COLORS = {
  Basic:        { gradient: 'from-critical/20 to-critical/5', text: 'text-critical', border: 'border-critical/20' },
  Developing:   { gradient: 'from-high/20 to-high/5', text: 'text-high', border: 'border-high/20' },
  Intermediate: { gradient: 'from-medium/20 to-medium/5', text: 'text-medium', border: 'border-medium/20' },
  Advanced:     { gradient: 'from-low/20 to-low/5', text: 'text-low', border: 'border-low/20' },
};

function PostureGauge({ score }) {
  const color = score >= 75 ? '#2ed573' : score >= 55 ? '#ffc312' : score >= 30 ? '#ff6b35' : '#ff4757';
  const label = score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : score >= 30 ? 'Developing' : 'Critical';
  const pct = score / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2" className="gauge-track" />
          <circle
            cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
            strokeDasharray={`${pct * 94.2} 94.2`}
            strokeLinecap="round"
            className="gauge-fill"
            style={{ stroke: color }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-text-primary">{score}</span>
          <span className="text-[8px] uppercase tracking-[0.15em] font-bold" style={{ color }}>{label}</span>
        </div>
      </div>
      <p className="text-[8px] text-text-muted/40 text-center mt-2 max-w-[140px] leading-tight">
        Weighted severity, density & concentration
      </p>
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
        className="px-4 py-2.5 bg-gradient-to-r from-cyan/15 to-cyan/5 hover:from-cyan/20 hover:to-cyan/10 text-cyan text-xs font-bold rounded-xl border border-cyan/20 transition-all duration-300 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Strategic Posture
      </button>
    );
  }

  if (loading) {
    return (
      <div className="glass-glow rounded-2xl p-8 flex items-center justify-center gap-3">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full border-2 border-cyan/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan animate-spin" />
        </div>
        <span className="text-text-muted text-sm">Generating strategic intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 glass rounded-xl chip-critical text-xs">
        <span className="font-bold">Error: </span>{error}
      </div>
    );
  }

  const maturity = MATURITY_COLORS[data.maturity_level] || MATURITY_COLORS.Developing;
  const confidencePct = Math.round((data.confidence_score || 0) * 100);

  return (
    <div className="glass-glow rounded-2xl overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan/20 to-purple/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h4 className="text-sm font-bold text-text-primary">Strategic Intelligence</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Confidence</span>
          <span className="text-sm font-black gradient-text">{confidencePct}%</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Top row — gauge + metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
          <div className="flex justify-center">
            <PostureGauge score={data.posture_score} />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-text-muted font-bold mb-1.5">Maturity Level</p>
              <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${maturity.gradient} ${maturity.text} border ${maturity.border}`}>
                {data.maturity_level}
              </span>
            </div>
            <div className="bg-bg-elevated/20 rounded-xl p-3 border border-border/50">
              <p className="text-[9px] uppercase tracking-[0.15em] text-text-muted font-bold mb-1">Attacker Profile</p>
              <p className="text-sm text-text-primary font-semibold">{data.likely_attacker_profile}</p>
            </div>
          </div>

          <div className="bg-bg-elevated/20 rounded-xl p-3 border border-border/50">
            <p className="text-[9px] uppercase tracking-[0.15em] text-text-muted font-bold mb-1">Dominant Risk Theme</p>
            <p className="text-sm text-text-primary font-medium leading-snug">{data.dominant_risk_theme}</p>
          </div>
        </div>

        {/* Strategic outlook */}
        <div className="bg-bg-elevated/15 rounded-xl p-4 border border-border/30">
          <p className="text-[9px] uppercase tracking-[0.15em] text-text-muted font-bold mb-1.5">Strategic Risk Outlook</p>
          <p className="text-xs text-text-secondary leading-relaxed">{data.strategic_risk_outlook}</p>
        </div>

        {/* Priorities */}
        {data.priority_improvements?.length > 0 && (
          <div className="bg-gradient-to-r from-low/5 to-transparent rounded-xl p-4 border border-low/10">
            <p className="text-[9px] uppercase tracking-[0.15em] text-low font-black mb-3">Strategic Priorities</p>
            <ol className="space-y-2.5">
              {data.priority_improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-lg bg-low/10 text-low text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-xs text-text-secondary leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Assessment basis */}
        {data.assessment_basis?.length > 0 && (
          <div className="pt-3 border-t border-border/30">
            <p className="text-[9px] uppercase tracking-[0.15em] text-text-muted font-bold mb-2">Assessment Basis</p>
            <div className="flex flex-wrap gap-1.5">
              {data.assessment_basis.map((basis, i) => (
                <span key={i} className="px-2.5 py-1 bg-bg-elevated/30 text-text-muted rounded-lg text-[10px] font-mono border border-border/50">{basis}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostureIntelligence;
