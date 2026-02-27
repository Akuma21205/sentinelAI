import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

function RiskChart({ counts }) {
  const data = [
    { name: 'Critical', count: counts.Critical },
    { name: 'High', count: counts.High },
    { name: 'Medium', count: counts.Medium },
    { name: 'Low', count: counts.Low },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-200 mb-4">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskChart;
