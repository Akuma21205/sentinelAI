import { useState } from 'react';
import { getPosture } from '../services/api';

const MATURITY_COLORS = {
  Basic:        { bg: 'rgba(217,79,79,0.06)', text: '#D94F4F', border: 'rgba(217,79,79,0.12)' },
  Developing:   { bg: 'rgba(217,123,79,0.06)', text: '#D97B4F', border: 'rgba(217,123,79,0.12)' },
  Intermediate: { bg: 'rgba(201,168,79,0.06)', text: '#C9A84F', border: 'rgba(201,168,79,0.12)' },
  Advanced:     { bg: 'rgba(79,175,123,0.06)', text: '#4FAF7B', border: 'rgba(79,175,123,0.12)' },
};

function PostureGauge({ score }) {
  const color = score >= 75 ? '#4FAF7B' : score >= 55 ? '#C9A84F' : score >= 30 ? '#D97B4F' : '#D94F4F';
  const label = score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : score >= 30 ? 'Developing' : 'Critical';
  const pct = score / 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        <svg viewBox="0 0 36 36" style={{ width: '120px', height: '120px', transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2" stroke="var(--color-border)" />
          <circle
            cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
            strokeDasharray={`${pct * 94.2} 94.2`}
            strokeLinecap="round"
            style={{ stroke: color, transition: 'stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{score}</span>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color }}>{label}</span>
        </div>
      </div>
      <p style={{ fontSize: '9px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '10px', maxWidth: '140px', lineHeight: 1.4, opacity: 0.6 }}>
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
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p className="text-text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>Generate a strategic posture assessment with maturity scoring.</p>
        <button
          onClick={handleGenerate}
          className="btn-accent disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ padding: '12px 28px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Generate Assessment
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 0' }}>
        <div style={{ position: 'relative', width: '20px', height: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--color-border)' }} />
          <div className="animate-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--color-accent)' }} />
        </div>
        <span className="text-text-muted" style={{ fontSize: '14px' }}>Generating strategic intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(217,79,79,0.15)', backgroundColor: 'rgba(217,79,79,0.04)', fontSize: '13px' }} className="text-critical">
        <span style={{ fontWeight: 700 }}>Error: </span>{error}
      </div>
    );
  }

  const maturity = MATURITY_COLORS[data.maturity_level] || MATURITY_COLORS.Developing;
  const confidencePct = Math.round((data.confidence_score || 0) * 100);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Confidence badge */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }} className="text-text-muted">Confidence</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-accent)' }}>{confidencePct}%</span>
        </div>
      </div>

      {/* Top row — gauge + metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '24px', alignItems: 'center' }}>
        <PostureGauge score={data.posture_score} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }} className="text-text-muted">Maturity Level</p>
            <span style={{
              display: 'inline-flex', padding: '6px 14px', borderRadius: '8px',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              backgroundColor: maturity.bg, color: maturity.text, border: `1px solid ${maturity.border}`,
            }}>
              {data.maturity_level}
            </span>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '10px', padding: '14px', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }} className="text-text-muted">Attacker Profile</p>
            <p style={{ fontSize: '14px', fontWeight: 600 }} className="text-text-primary">{data.likely_attacker_profile}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '10px', padding: '14px', border: '1px solid var(--color-border)', alignSelf: 'start' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }} className="text-text-muted">Dominant Risk Theme</p>
          <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }} className="text-text-primary">{data.dominant_risk_theme}</p>
        </div>
      </div>

      {/* Strategic outlook */}
      <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px' }} className="text-text-muted">Strategic Risk Outlook</p>
        <p style={{ fontSize: '14px', lineHeight: 1.7 }} className="text-text-secondary">{data.strategic_risk_outlook}</p>
      </div>

      {/* Priorities */}
      {data.priority_improvements?.length > 0 && (
        <div style={{ backgroundColor: 'rgba(79,175,123,0.04)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(79,175,123,0.1)' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '16px', color: 'var(--color-low)' }}>Strategic Priorities</p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
            {data.priority_improvements.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0,
                  backgroundColor: 'rgba(79,175,123,0.08)', color: 'var(--color-low)',
                  fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '13px', lineHeight: 1.6 }} className="text-text-secondary">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Assessment basis */}
      {data.assessment_basis?.length > 0 && (
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '12px' }} className="text-text-muted">Assessment Basis</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.assessment_basis.map((basis, i) => (
              <span
                key={i}
                className="font-mono"
                style={{
                  padding: '6px 12px', backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)', borderRadius: '8px',
                  fontSize: '11px', color: 'var(--color-text-muted)',
                }}
              >
                {basis}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostureIntelligence;
