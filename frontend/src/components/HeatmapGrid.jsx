const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

function HeatmapGrid({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Risk Heatmap</h3>
        <p className="text-text-muted text-sm text-center py-8">No data available.</p>
      </div>
    );
  }

  const maxScore = Math.max(...assets.map(a => a.risk_score), 1);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
        <h3 className="text-sm font-semibold text-text-primary">Risk Heatmap</h3>
      </div>
      <div className="space-y-1.5">
        {assets.map((asset, idx) => {
          const color = SEVERITY_COLORS[asset.severity] || SEVERITY_COLORS.Low;
          const widthPct = Math.max((asset.risk_score / maxScore) * 100, 8);
          return (
            <div key={idx} className="flex items-center gap-2 group">
              <span
                className="text-[10px] text-text-muted font-mono w-36 truncate shrink-0 group-hover:text-cyan transition-colors"
                title={asset.subdomain}
              >
                {asset.subdomain}
              </span>
              <div className="flex-1 h-6 rounded bg-bg-elevated overflow-hidden">
                <div
                  className="h-full rounded flex items-center justify-end px-2 transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${color}20, ${color}90)`,
                  }}
                >
                  <span className="text-[9px] font-bold text-white drop-shadow-sm">{asset.risk_score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
        {Object.entries(SEVERITY_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-text-muted font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeatmapGrid;
