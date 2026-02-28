import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  Critical: '#D94F4F',
  High: '#D97B4F',
  Medium: '#C9A84F',
  Low: '#4FAF7B',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</p>
      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{payload[0].value} assets</p>
    </div>
  );
};

function RiskChart({ counts }) {
  const data = [
    { name: 'Critical', count: counts.Critical },
    { name: 'High', count: counts.High },
    { name: 'Medium', count: counts.Medium },
    { name: 'Low', count: counts.Low },
  ];

  return (
    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div
          className="flex items-center justify-center"
          style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(196,120,91,0.08)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }} className="text-text-primary">Risk Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196,120,91,0.04)' }} />
          <Bar dataKey="count" radius={[8, 8, 4, 4]} barSize={44}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} fillOpacity={0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskChart;
