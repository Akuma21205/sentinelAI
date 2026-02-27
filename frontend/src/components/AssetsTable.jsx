import { useState } from 'react';

const severityStyles = {
  Critical: 'bg-critical/10 text-critical border border-critical/15',
  High: 'bg-high/10 text-high border border-high/15',
  Medium: 'bg-medium/10 text-medium border border-medium/15',
  Low: 'bg-low/10 text-low border border-low/15',
  Informational: 'bg-bg-elevated text-text-muted border border-border',
};

const PORT_COLLAPSE_THRESHOLD = 5;

function AssetsTable({ assets }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!assets || assets.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-text-muted text-xs">No discoverable assets with notable exposure.</p>
      </div>
    );
  }

  const toggleRow = (idx) => setExpandedRow(expandedRow === idx ? null : idx);

  return (
    <div className="card overflow-hidden">
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
            {assets.map((asset, idx) => {
              const ports = asset.open_ports || [];
              const hasOverflow = ports.length > PORT_COLLAPSE_THRESHOLD;
              const isExpanded = expandedRow === idx;
              const visiblePorts = isExpanded ? ports : ports.slice(0, PORT_COLLAPSE_THRESHOLD);

              return (
                <tr
                  key={idx}
                  className={`border-b border-border/50 hover:bg-bg-card-hover/40 transition-colors ${hasOverflow ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-bg-card-hover/20' : ''}`}
                  onClick={() => hasOverflow && toggleRow(idx)}
                >
                  <td className="px-5 py-3 font-mono text-accent-hover text-xs">{asset.subdomain}</td>
                  <td className="px-5 py-3 font-mono text-text-muted text-xs">{asset.ip}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1 items-center">
                      {visiblePorts.length > 0 ? (
                        <>
                          {visiblePorts.map((port) => (
                            <span key={port} className="px-1.5 py-0.5 bg-bg-elevated text-text-secondary rounded text-[10px] font-mono border border-border">{port}</span>
                          ))}
                          {hasOverflow && !isExpanded && (
                            <span className="px-1.5 py-0.5 bg-accent-muted text-accent-hover rounded text-[10px] font-mono border border-accent/15">+{ports.length - PORT_COLLAPSE_THRESHOLD}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-text-primary text-sm">{asset.risk_score}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityStyles[asset.severity] || 'bg-bg-elevated text-text-muted'}`}>
                      {asset.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetsTable;
