import { useState } from 'react';

const RISK_COLORS = {
  Critical: { bg: 'rgba(217,79,79,0.06)', border: 'rgba(217,79,79,0.15)', text: '#D94F4F', bar: '#D94F4F' },
  High:     { bg: 'rgba(217,123,79,0.06)', border: 'rgba(217,123,79,0.15)', text: '#D97B4F', bar: '#D97B4F' },
  Medium:   { bg: 'rgba(201,168,79,0.06)', border: 'rgba(201,168,79,0.15)', text: '#C9A84F', bar: '#C9A84F' },
  Low:      { bg: 'rgba(79,175,123,0.06)', border: 'rgba(79,175,123,0.15)', text: '#4FAF7B', bar: '#4FAF7B' },
};

const STAGE_COLORS = {
  'Initial Access':       { bg: 'rgba(217,123,79,0.06)', text: '#D97B4F', border: 'rgba(217,123,79,0.15)' },
  'Privilege Escalation': { bg: 'rgba(217,79,79,0.06)', text: '#D94F4F', border: 'rgba(217,79,79,0.15)' },
  'Lateral Movement':     { bg: 'rgba(201,168,79,0.06)', text: '#C9A84F', border: 'rgba(201,168,79,0.15)' },
  'Data Exfiltration':    { bg: 'rgba(217,79,79,0.06)', text: '#D94F4F', border: 'rgba(217,79,79,0.15)' },
};

function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 85 ? '#D94F4F' : pct >= 70 ? '#D97B4F' : pct >= 50 ? '#C9A84F' : '#4FAF7B';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: color, opacity: 0.7, transition: 'width 0.7s ease' }} />
      </div>
      <span className="font-mono text-text-muted" style={{ fontSize: '11px', width: '32px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

function MitreBadge({ id }) {
  return (
    <span
      className="font-mono"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', backgroundColor: 'rgba(196,120,91,0.06)',
        border: '1px solid rgba(196,120,91,0.12)', borderRadius: '4px',
        fontSize: '10px', fontWeight: 600, color: 'var(--color-accent)',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '10px', height: '10px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      {id}
    </span>
  );
}

function StageBadge({ stage }) {
  const style = STAGE_COLORS[stage] || STAGE_COLORS['Initial Access'];
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 10px', borderRadius: '6px',
      fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`,
    }}>
      {stage}
    </span>
  );
}

function EvidenceList({ evidence }) {
  if (!evidence || evidence.length === 0) return null;
  return (
    <div>
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }} className="text-text-muted">Evidence</p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none', padding: 0, margin: 0 }}>
        {evidence.map((item, i) => (
          <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, paddingLeft: '14px', borderLeft: '2px solid rgba(196,120,91,0.15)' }} className="text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ step, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(step.confidence_score * 100);
  const severity = pct >= 85 ? 'Critical' : pct >= 70 ? 'High' : pct >= 50 ? 'Medium' : 'Low';
  const colors = RISK_COLORS[severity] || RISK_COLORS.Low;

  return (
    <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
      {/* Timeline connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: colors.bg, border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1, transition: 'transform 0.2s ease',
          transform: expanded ? 'scale(1.1)' : 'scale(1)',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: colors.text }}>{step.step}</span>
        </div>
        {!isLast && <div style={{ width: '1px', flex: 1, backgroundColor: 'var(--color-border)', minHeight: '24px' }} />}
      </div>

      {/* Step content */}
      <div style={{
        flex: 1, marginBottom: '16px', borderRadius: '12px',
        border: `1px solid ${colors.border}`, backgroundColor: colors.bg,
        transition: 'all 0.2s ease', overflow: 'hidden',
      }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '8px', cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
            <StageBadge stage={step.stage} />
            <span style={{ fontSize: '14px', fontWeight: 600 }} className="text-text-primary">{step.technique}</span>
            <MitreBadge id={step.mitre_id} />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '16px', height: '16px', flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            className="text-text-muted"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {expanded && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--color-border)' }}>
            {/* Target */}
            <div style={{ paddingTop: '16px', display: 'flex', gap: '32px' }}>
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }} className="text-text-muted">Target</p>
                <p className="font-mono text-accent" style={{ fontSize: '13px' }}>{step.subdomain}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }} className="text-text-muted">IP</p>
                <p className="font-mono text-text-muted" style={{ fontSize: '13px' }}>{step.ip}</p>
              </div>
            </div>

            {/* Impact detail */}
            {step.impact_detail && (
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }} className="text-text-muted">Impact Analysis</p>
                <p style={{ fontSize: '13px', lineHeight: 1.6 }} className="text-text-secondary">{step.impact_detail}</p>
              </div>
            )}

            {/* Evidence */}
            <EvidenceList evidence={step.evidence} />

            {/* Confidence */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }} className="text-text-muted">Confidence</p>
              <ConfidenceBar score={step.confidence_score} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AttackSimulation({ simulation }) {
  if (!simulation) return null;

  const { entry_point, attack_path, impact_summary, overall_risk, mitigation_notes } = simulation;
  const riskStyle = RISK_COLORS[overall_risk] || RISK_COLORS.Low;
  const hasPath = attack_path && attack_path.length > 0;

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: 'rgba(217,79,79,0.06)', border: '1px solid rgba(217,79,79,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', color: 'var(--color-critical)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600 }} className="text-text-primary">Attack Chain Analysis</h4>
            <p className="font-mono text-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
              {hasPath ? `${attack_path.length} step${attack_path.length > 1 ? 's' : ''} · ${[...new Set(attack_path.map(s => s.stage))].length} stages` : 'No viable path'}
            </p>
          </div>
        </div>
        <span style={{
          padding: '6px 14px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          backgroundColor: riskStyle.bg, color: riskStyle.text, border: `1px solid ${riskStyle.border}`,
        }}>
          {overall_risk} Risk
        </span>
      </div>

      {/* Entry point */}
      {hasPath && entry_point && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', backgroundColor: 'rgba(196,120,91,0.04)',
          border: '1px solid rgba(196,120,91,0.1)', borderRadius: '10px',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px', color: 'var(--color-accent)', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }} className="text-text-muted">Entry Point</p>
          <span className="font-mono text-accent" style={{ fontSize: '13px' }}>{entry_point}</span>
        </div>
      )}

      {/* Attack chain timeline */}
      {hasPath ? (
        <div style={{ paddingLeft: '4px' }}>
          {attack_path.map((step, i) => (
            <StepCard key={step.step} step={step} isLast={i === attack_path.length - 1} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '48px 24px', textAlign: 'center', borderRadius: '12px',
          backgroundColor: 'rgba(79,175,123,0.04)', border: '1px solid rgba(79,175,123,0.1)',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px', color: 'var(--color-low)', margin: '0 auto 12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <p style={{ fontSize: '16px', fontWeight: 600 }} className="text-low">Minimal Attack Surface Detected</p>
          <p className="text-text-muted" style={{ fontSize: '13px', marginTop: '6px' }}>All assets present low risk with minimal exposure.</p>
        </div>
      )}

      {/* Impact summary */}
      {impact_summary && (
        <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }} className="text-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Impact Assessment
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.6 }} className="text-text-secondary">{impact_summary}</p>
        </div>
      )}

      {/* Mitigation notes */}
      {mitigation_notes && mitigation_notes.length > 0 && (
        <div style={{ padding: '16px 20px', backgroundColor: 'rgba(79,175,123,0.04)', border: '1px solid rgba(79,175,123,0.1)', borderRadius: '12px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-low)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            Mitigation Recommendations
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
            {mitigation_notes.map((note, i) => (
              <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, paddingLeft: '14px', borderLeft: '2px solid rgba(79,175,123,0.2)' }} className="text-text-secondary">{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AttackSimulation;
