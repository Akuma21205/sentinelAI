import { useState } from 'react';

const SEVERITY_CHIP = {
  Critical: { bg: 'rgba(217,79,79,0.08)', color: '#D94F4F', border: 'rgba(217,79,79,0.15)' },
  High:     { bg: 'rgba(217,123,79,0.08)', color: '#D97B4F', border: 'rgba(217,123,79,0.15)' },
  Medium:   { bg: 'rgba(201,168,79,0.08)', color: '#C9A84F', border: 'rgba(201,168,79,0.15)' },
  Low:      { bg: 'rgba(79,175,123,0.08)', color: '#4FAF7B', border: 'rgba(79,175,123,0.15)' },
  Informational: { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', border: 'var(--color-border)' },
};

function AssetsTable({ assets }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!assets || assets.length === 0) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
        <p className="text-text-muted" style={{ fontSize: '13px' }}>No assets discovered.</p>
      </div>
    );
  }

  const thStyle = {
    textAlign: 'left',
    padding: '14px 24px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 700,
    color: 'var(--color-text-muted)',
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(196,120,91,0.08)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }} className="text-text-primary">Discovered Assets</h3>
        </div>
        <span
          className="font-mono text-text-muted"
          style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
        >
          {assets.length} found
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={thStyle}>Subdomain</th>
              <th style={thStyle}>IP Address</th>
              <th style={thStyle}>Ports</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => {
              const ports = asset.open_ports || [];
              const isExpanded = expandedRow === idx;
              const visiblePorts = isExpanded ? ports : ports.slice(0, 5);
              const hasMore = ports.length > 5;
              const chipStyle = SEVERITY_CHIP[asset.severity] || SEVERITY_CHIP.Low;

              return (
                <tr
                  key={idx}
                  onClick={() => hasMore && setExpandedRow(isExpanded ? null : idx)}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    cursor: hasMore ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="font-mono text-accent" style={{ padding: '16px 24px', fontSize: '13px' }}>{asset.subdomain}</td>
                  <td className="font-mono text-text-muted" style={{ padding: '16px 24px', fontSize: '13px' }}>{asset.ip}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      {visiblePorts.length > 0 ? (
                        <>
                          {visiblePorts.map((p) => (
                            <span
                              key={p}
                              className="font-mono"
                              style={{ padding: '2px 8px', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-secondary)' }}
                            >
                              {p}
                            </span>
                          ))}
                          {hasMore && !isExpanded && (
                            <span
                              className="font-mono"
                              style={{ padding: '2px 8px', backgroundColor: 'rgba(196,120,91,0.06)', border: '1px solid rgba(196,120,91,0.12)', borderRadius: '6px', fontSize: '11px', color: 'var(--color-accent)' }}
                            >
                              +{ports.length - 5}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-text-muted" style={{ fontSize: '13px' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }} className="text-text-primary">{asset.risk_score}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        backgroundColor: chipStyle.bg,
                        color: chipStyle.color,
                        border: `1px solid ${chipStyle.border}`,
                      }}
                    >
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
