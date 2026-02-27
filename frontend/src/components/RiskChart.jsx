import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  Critical: '#e54d4d',
  High: '#e8873a',
  Medium: '#d4a72c',
  Low: '#3bba6a',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-border rounded-lg px-3 py-2 shadow-md">
      <p className="text-text-primary text-xs font-semibold">{label}</p>
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
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        <h3 className="text-sm font-semibold text-text-primary">Risk Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#5a6478', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#5a6478', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(91,108,240,0.04)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
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
