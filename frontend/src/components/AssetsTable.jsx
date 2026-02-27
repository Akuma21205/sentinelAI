const severityStyles = {
  Critical: 'bg-critical/15 text-critical border border-critical/20',
  High: 'bg-high/15 text-high border border-high/20',
  Medium: 'bg-medium/15 text-medium border border-medium/20',
  Low: 'bg-low/15 text-low border border-low/20',
};

function AssetsTable({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">No assets discovered.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          <h3 className="text-sm font-semibold text-text-primary">Discovered Assets</h3>
        </div>
        <span className="text-xs text-text-muted font-mono">{assets.length} found</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-text-muted text-[10px] uppercase tracking-widest font-semibold">Subdomain</th>
              <th className="text-left px-5 py-3 text-text-muted text-[10px] uppercase tracking-widest font-semibold">IP Address</th>
              <th className="text-left px-5 py-3 text-text-muted text-[10px] uppercase tracking-widest font-semibold">Open Ports</th>
              <th className="text-left px-5 py-3 text-text-muted text-[10px] uppercase tracking-widest font-semibold">Risk Score</th>
              <th className="text-left px-5 py-3 text-text-muted text-[10px] uppercase tracking-widest font-semibold">Severity</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => (
              <tr
                key={idx}
                className="border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors"
              >
                <td className="px-5 py-3.5 font-mono text-cyan text-xs">{asset.subdomain}</td>
                <td className="px-5 py-3.5 font-mono text-text-muted text-xs">{asset.ip}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {(asset.open_ports || []).length > 0 ? (
                      asset.open_ports.map((port) => (
                        <span
                          key={port}
                          className="px-1.5 py-0.5 bg-bg-elevated text-text-secondary rounded text-[10px] font-mono border border-border"
                        >
                          {port}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-muted text-xs italic">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-bold text-text-primary text-sm">{asset.risk_score}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityStyles[asset.severity] || 'bg-bg-elevated text-text-muted'}`}>
                    {asset.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetsTable;
