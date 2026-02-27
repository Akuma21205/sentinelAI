function SummaryCards({ total, counts }) {
  const cards = [
    { label: 'Total Assets', value: total, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    { label: 'Critical', value: counts.Critical, color: 'text-critical', bg: 'bg-critical/10', border: 'border-critical/20' },
    { label: 'High', value: counts.High, color: 'text-high', bg: 'bg-high/10', border: 'border-high/20' },
    { label: 'Medium', value: counts.Medium, color: 'text-medium', bg: 'bg-medium/10', border: 'border-medium/20' },
    { label: 'Low', value: counts.Low, color: 'text-low', bg: 'bg-low/10', border: 'border-low/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border ${card.border} rounded-xl p-4`}
        >
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{card.label}</p>
          <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
