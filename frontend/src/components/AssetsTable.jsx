import { useState } from 'react';

const SEVERITY_CHIP = {
  Critical: 'chip-critical',
  High: 'chip-high',
  Medium: 'chip-medium',
  Low: 'chip-low',
  Informational: 'bg-bg-elevated/50 text-text-muted border border-border',
};

function AssetsTable({ assets }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!assets || assets.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <p className="text-text-muted text-xs">No assets discovered.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <h3 className="text-sm font-bold text-text-primary">Discovered Assets</h3>
        </div>
        <span className="text-[11px] text-text-muted font-mono px-2.5 py-1 bg-accent/5 rounded-full border border-accent/10">{assets.length} found</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-text-muted text-[9px] uppercase tracking-[0.15em] font-bold">Subdomain</th>
              <th className="text-left px-6 py-3 text-text-muted text-[9px] uppercase tracking-[0.15em] font-bold">IP Address</th>
              <th className="text-left px-6 py-3 text-text-muted text-[9px] uppercase tracking-[0.15em] font-bold">Ports</th>
              <th className="text-left px-6 py-3 text-text-muted text-[9px] uppercase tracking-[0.15em] font-bold">Risk</th>
              <th className="text-left px-6 py-3 text-text-muted text-[9px] uppercase tracking-[0.15em] font-bold">Severity</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => {
              const ports = asset.open_ports || [];
              const isExpanded = expandedRow === idx;
              const visiblePorts = isExpanded ? ports : ports.slice(0, 5);
              const hasMore = ports.length > 5;

              return (
                <tr
                  key={idx}
                  className={`border-b border-border/40 transition-colors hover:bg-white/[0.02] ${hasMore ? 'cursor-pointer' : ''}`}
                  onClick={() => hasMore && setExpandedRow(isExpanded ? null : idx)}
                >
                  <td className="px-6 py-3.5 font-mono text-accent-hover text-xs">{asset.subdomain}</td>
                  <td className="px-6 py-3.5 font-mono text-text-muted text-xs">{asset.ip}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap gap-1 items-center">
                      {visiblePorts.length > 0 ? (
                        <>
                          {visiblePorts.map((p) => (
                            <span key={p} className="px-1.5 py-0.5 bg-bg-elevated/40 text-text-secondary rounded-md text-[10px] font-mono border border-border/50">{p}</span>
                          ))}
                          {hasMore && !isExpanded && (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent-hover rounded-md text-[10px] font-mono border border-accent/15">+{ports.length - 5}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-text-muted/50 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-base font-black text-text-primary">{asset.risk_score}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${SEVERITY_CHIP[asset.severity] || SEVERITY_CHIP.Low}`}>
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
