function SummaryCards({ total, counts, avgRisk }) {
  const cards = [
    { label: 'Total Assets', value: total, color: 'text-accent-hover', bg: 'bg-accent-muted', borderAccent: 'border-accent/10' },
    { label: 'Avg Risk', value: avgRisk ?? '—', color: 'text-cyan', bg: 'bg-cyan/6', borderAccent: 'border-cyan/10' },
    { label: 'Critical', value: counts.Critical, color: 'text-critical', bg: 'bg-critical/6', borderAccent: 'border-critical/10' },
    { label: 'High', value: counts.High, color: 'text-high', bg: 'bg-high/6', borderAccent: 'border-high/10' },
    { label: 'Medium', value: counts.Medium, color: 'text-medium', bg: 'bg-medium/6', borderAccent: 'border-medium/10' },
    { label: 'Low', value: counts.Low, color: 'text-low', bg: 'bg-low/6', borderAccent: 'border-low/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border ${card.borderAccent} rounded-xl p-4 transition-colors`}
        >
          <p className="text-text-muted text-[10px] uppercase tracking-widest font-semibold mb-2">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color} tracking-tight`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
