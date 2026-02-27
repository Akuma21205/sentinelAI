import { useState } from 'react';

const RISK_COLORS = {
  Critical: { bg: 'bg-critical/10', border: 'border-critical/30', text: 'text-critical', bar: 'bg-critical' },
  High: { bg: 'bg-high/10', border: 'border-high/30', text: 'text-high', bar: 'bg-high' },
  Medium: { bg: 'bg-medium/10', border: 'border-medium/30', text: 'text-medium', bar: 'bg-medium' },
  Low: { bg: 'bg-low/10', border: 'border-low/30', text: 'text-low', bar: 'bg-low' },
};

const STAGE_COLORS = {
  'Initial Access':       { bg: 'bg-high/10', text: 'text-high', border: 'border-high/25' },
  'Privilege Escalation': { bg: 'bg-critical/10', text: 'text-critical', border: 'border-critical/25' },
  'Lateral Movement':     { bg: 'bg-medium/10', text: 'text-medium', border: 'border-medium/25' },
  'Data Exfiltration':    { bg: 'bg-critical/10', text: 'text-critical', border: 'border-critical/25' },
};

function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 85 ? 'bg-critical' : pct >= 70 ? 'bg-high' : pct >= 50 ? 'bg-medium' : 'bg-low';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-text-muted w-8 text-right">{pct}%</span>
    </div>
  );
}

function MitreBadge({ id }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded text-[10px] font-mono font-semibold text-accent-hover tracking-wide">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      {id}
    </span>
  );
}

function StageBadge({ stage }) {
  const style = STAGE_COLORS[stage] || STAGE_COLORS['Initial Access'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
      {stage}
    </span>
  );
}

function EvidenceList({ evidence }) {
  if (!evidence || evidence.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1.5">Evidence</p>
      <ul className="space-y-1">
        {evidence.map((item, i) => (
          <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-accent/20 flex items-start gap-1.5">
            <span className="text-text-muted mt-0.5 shrink-0">›</span>
            <span>{item}</span>
          </li>
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
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center z-10 transition-all ${expanded ? 'scale-110' : ''}`}>
          <span className={`text-xs font-bold ${colors.text}`}>{step.step}</span>
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border-light min-h-[24px]" />
        )}
      </div>

      {/* Step content */}
      <div className={`flex-1 mb-4 rounded-xl border ${colors.border} ${colors.bg} transition-all hover:border-opacity-60`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left gap-2"
        >
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <StageBadge stage={step.stage} />
            <span className="text-sm font-semibold text-text-primary truncate">{step.technique}</span>
            <MitreBadge id={step.mitre_id} />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border/30">
            {/* Target */}
            <div className="pt-3 flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-0.5">Target</p>
                <p className="text-xs font-mono text-cyan">{step.subdomain}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-0.5">IP</p>
                <p className="text-xs font-mono text-text-muted">{step.ip}</p>
              </div>
            </div>

            {/* AI-enhanced impact detail */}
            {step.impact_detail && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Impact Analysis</p>
                <p className="text-xs text-text-secondary leading-relaxed">{step.impact_detail}</p>
              </div>
            )}

            {/* Evidence */}
            <EvidenceList evidence={step.evidence} />

            {/* Confidence */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1.5">Confidence</p>
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
    <div className="space-y-5 animate-fade-in-up">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-critical/10 border border-critical/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-critical" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Attack Chain Analysis</h4>
            <p className="text-[10px] text-text-muted font-mono mt-0.5">
              {hasPath ? `${attack_path.length} step${attack_path.length > 1 ? 's' : ''} · ${[...new Set(attack_path.map(s => s.stage))].length} stage${[...new Set(attack_path.map(s => s.stage))].length > 1 ? 's' : ''}` : 'No viable path'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border}`}>
          {overall_risk} Risk
        </span>
      </div>

      {/* Entry point */}
      {hasPath && entry_point && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/5 border border-accent/15 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-accent-hover shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Entry Point</p>
          <span className="text-xs font-mono text-accent-hover">{entry_point}</span>
        </div>
      )}

      {/* Attack chain timeline */}
      {hasPath ? (
        <div className="pl-1">
          {attack_path.map((step, i) => (
            <StepCard key={step.step} step={step} isLast={i === attack_path.length - 1} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 bg-low/5 border border-low/15 rounded-xl text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-low mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          <p className="text-sm text-low font-semibold">No Viable Attack Path</p>
          <p className="text-xs text-text-muted mt-1">All assets present low risk with minimal exposure.</p>
        </div>
      )}

      {/* Impact summary */}
      {impact_summary && (
        <div className="px-4 py-3.5 bg-bg-card/50 border border-border rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Impact Assessment
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">{impact_summary}</p>
        </div>
      )}

      {/* Mitigation notes (AI-generated) */}
      {mitigation_notes && mitigation_notes.length > 0 && (
        <div className="px-4 py-3.5 bg-low/5 border border-low/15 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-low font-bold mb-2.5 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            Mitigation Recommendations
          </p>
          <ul className="space-y-2">
            {mitigation_notes.map((note, i) => (
              <li key={i} className="text-xs text-text-secondary leading-relaxed pl-3 border-l-2 border-low/30">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AttackSimulation;
