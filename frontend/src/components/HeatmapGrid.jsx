import { useMemo } from 'react';

const SEVERITY_COLORS = {
  Critical: { bar: '#ff4757', bg: 'rgba(255,71,87,0.15)' },
  High: { bar: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  Medium: { bar: '#ffc312', bg: 'rgba(255,195,18,0.15)' },
  Low: { bar: '#2ed573', bg: 'rgba(46,213,115,0.15)' },
  Informational: { bar: '#64748b', bg: 'rgba(100,116,139,0.15)' },
};

function HeatmapGrid({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-text-muted text-xs">No assets to visualize.</p>
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
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-cyan/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
        </div>
        <h3 className="text-sm font-bold text-text-primary">Risk Heatmap</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((asset, idx) => {
          const colors = SEVERITY_COLORS[asset.severity] || SEVERITY_COLORS.Low;
          const widthPct = Math.max((asset.risk_score / maxScore) * 100, 6);
          const isShared = sharedIPs.has(asset.ip);
          return (
            <div key={idx} className="flex items-center gap-3 group">
              <span
                className="text-[10px] text-text-muted font-mono w-36 truncate shrink-0 group-hover:text-text-secondary transition-colors flex items-center gap-1.5"
                title={asset.subdomain}
              >
                {isShared && <span className="w-1.5 h-1.5 rounded-full bg-purple shrink-0" title="Shared IP" />}
                {asset.subdomain}
              </span>
              <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div
                  className="h-full rounded-lg flex items-center justify-end px-2.5 transition-all duration-700 group-hover:brightness-125"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${colors.bg}, ${colors.bar}40)`,
                    boxShadow: `inset 0 0 12px ${colors.bar}20`,
                  }}
                >
                  <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">{asset.risk_score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-5 pt-3 border-t border-border">
        {Object.entries(SEVERITY_COLORS).filter(([k]) => k !== 'Informational').map(([label, c]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c.bar }} />
            <span className="text-[9px] text-text-muted">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple" />
          <span className="text-[9px] text-text-muted">Shared IP</span>
        </div>
      </div>
    </div>
  );
}

export default HeatmapGrid;
