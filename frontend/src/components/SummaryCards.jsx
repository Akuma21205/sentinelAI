function SummaryCards({ total, counts, avgRisk }) {
  const cards = [
    { label: 'Total Assets', value: total, color: 'text-accent-hover', border: 'border-accent/20', bg: 'bg-accent/5', glow: 'glow-accent', icon: '◉' },
    { label: 'Avg Risk', value: avgRisk ?? '—', color: 'text-cyan', border: 'border-cyan/20', bg: 'bg-cyan/5', glow: '', icon: '◎' },
    { label: 'Critical', value: counts.Critical, color: 'text-critical', border: 'border-critical/20', bg: 'bg-critical/5', glow: 'glow-critical', icon: '●' },
    { label: 'High', value: counts.High, color: 'text-high', border: 'border-high/20', bg: 'bg-high/5', glow: 'glow-high', icon: '●' },
    { label: 'Medium', value: counts.Medium, color: 'text-medium', border: 'border-medium/20', bg: 'bg-medium/5', glow: 'glow-medium', icon: '●' },
    { label: 'Low', value: counts.Low, color: 'text-low', border: 'border-low/20', bg: 'bg-low/5', glow: 'glow-low', icon: '●' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border ${card.border} rounded-xl p-4 ${card.value > 0 ? card.glow : ''} transition-all hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-semibold">{card.label}</p>
            <span className={`${card.color} text-[8px]`}>{card.icon}</span>
          </div>
          <p className={`text-3xl font-bold ${card.color} tracking-tight`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
