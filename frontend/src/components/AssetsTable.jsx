const severityColor = {
  Critical: 'bg-critical/20 text-critical',
  High: 'bg-high/20 text-high',
  Medium: 'bg-medium/20 text-medium',
  Low: 'bg-low/20 text-low',
};

function AssetsTable({ assets }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        No assets discovered.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h3 className="text-base font-semibold text-slate-200">Discovered Assets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">Subdomain</th>
              <th className="text-left px-5 py-3 font-medium">IP</th>
              <th className="text-left px-5 py-3 font-medium">Open Ports</th>
              <th className="text-left px-5 py-3 font-medium">Risk Score</th>
              <th className="text-left px-5 py-3 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-5 py-3 font-mono text-slate-300 text-xs">{asset.subdomain}</td>
                <td className="px-5 py-3 font-mono text-slate-400 text-xs">{asset.ip}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(asset.open_ports || []).length > 0 ? (
                      asset.open_ports.map((port) => (
                        <span
                          key={port}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-mono"
                        >
                          {port}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600 text-xs">None</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 font-bold text-slate-200">{asset.risk_score}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${severityColor[asset.severity] || 'bg-slate-800 text-slate-400'}`}>
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
