import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  Critical: '#ff4757',
  High: '#ff6b35',
  Medium: '#ffc312',
  Low: '#2ed573',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-2.5 shadow-xl border border-border-light">
      <p className="text-text-primary text-xs font-bold">{label}</p>
      <p className="text-text-muted text-[10px] mt-0.5">{payload[0].value} assets</p>
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
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        </div>
        <h3 className="text-sm font-bold text-text-primary">Risk Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.04)' }} />
          <Bar dataKey="count" radius={[10, 10, 4, 4]} barSize={40}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskChart;
