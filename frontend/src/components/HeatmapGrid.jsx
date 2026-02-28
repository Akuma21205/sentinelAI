import { useMemo } from 'react';

const SEVERITY_COLORS = {
  Critical: { bar: '#D94F4F', bg: 'rgba(217,79,79,0.1)' },
  High: { bar: '#D97B4F', bg: 'rgba(217,123,79,0.1)' },
  Medium: { bar: '#C9A84F', bg: 'rgba(201,168,79,0.1)' },
  Low: { bar: '#4FAF7B', bg: 'rgba(79,175,123,0.1)' },
  Informational: { bar: '#9E9E9E', bg: 'rgba(158,158,158,0.1)' },
};

function HeatmapGrid({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p className="text-text-muted" style={{ fontSize: '13px' }}>No assets to visualize.</p>
      </div>
    );
  }

  const sorted = useMemo(() =>
    [...assets].sort((a, b) => b.risk_score - a.risk_score),
    [assets]
  );

  const sharedIPs = useMemo(() => {
    const freq = {};
    assets.forEach(a => { if (a.ip) freq[a.ip] = (freq[a.ip] || 0) + 1; });
    return new Set(Object.entries(freq).filter(([, c]) => c > 1).map(([ip]) => ip));
  }, [assets]);

  const maxScore = Math.max(...sorted.map(a => a.risk_score), 1);

  return (
    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div
          className="flex items-center justify-center"
          style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(91,138,158,0.08)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', color: 'var(--color-cyan)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }} className="text-text-primary">Risk Heatmap</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sorted.map((asset, idx) => {
          const colors = SEVERITY_COLORS[asset.severity] || SEVERITY_COLORS.Low;
          const widthPct = Math.max((asset.risk_score / maxScore) * 100, 6);
          const isShared = sharedIPs.has(asset.ip);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                className="font-mono text-text-muted"
                title={asset.subdomain}
                style={{ fontSize: '11px', width: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isShared && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-purple)', flexShrink: 0 }} title="Shared IP" />}
                {asset.subdomain}
              </span>
              <div style={{ flex: 1, height: '24px', borderRadius: '6px', backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    borderRadius: '6px',
                    backgroundColor: colors.bg,
                    borderRight: `3px solid ${colors.bar}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px',
                    transition: 'width 0.7s ease',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: colors.bar }}>{asset.risk_score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        {Object.entries(SEVERITY_COLORS).filter(([k]) => k !== 'Informational').map(([label, c]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: c.bar }} />
            <span style={{ fontSize: '10px' }} className="text-text-muted">{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-purple)' }} />
          <span style={{ fontSize: '10px' }} className="text-text-muted">Shared IP</span>
        </div>
      </div>
    </div>
  );
}

export default HeatmapGrid;
