const SEVERITY_COLORS = {
  Critical: { bg: '#ef4444', text: '#fff' },
  High: { bg: '#f97316', text: '#fff' },
  Medium: { bg: '#eab308', text: '#000' },
  Low: { bg: '#22c55e', text: '#fff' },
};

function getOpacity(riskScore) {
  if (riskScore >= 50) return 1;
  if (riskScore >= 30) return 0.75;
  if (riskScore >= 15) return 0.5;
  return 0.3;
}

function HeatmapGrid({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Risk Heatmap</h3>
        <p className="text-slate-500 text-sm text-center py-8">No data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-200 mb-4">Risk Heatmap</h3>
      <div className="space-y-2">
        {assets.map((asset, idx) => {
          const colors = SEVERITY_COLORS[asset.severity] || SEVERITY_COLORS.Low;
          const opacity = getOpacity(asset.risk_score);
          return (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono w-40 truncate shrink-0" title={asset.subdomain}>
                {asset.subdomain}
              </span>
              <div className="flex-1 h-8 rounded-md relative overflow-hidden bg-slate-800">
                <div
                  className="h-full rounded-md flex items-center justify-end px-2 transition-all"
                  style={{
                    width: `${Math.min(Math.max((asset.risk_score / 80) * 100, 10), 100)}%`,
                    backgroundColor: colors.bg,
                    opacity,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: colors.text }}>{asset.risk_score}</span>
                </div>
              </div>
              <span
                className="text-xs font-medium w-14 text-right shrink-0"
                style={{ color: colors.bg }}
              >
                {asset.severity}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800">
        {Object.entries(SEVERITY_COLORS).map(([label, c]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.bg }} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeatmapGrid;
