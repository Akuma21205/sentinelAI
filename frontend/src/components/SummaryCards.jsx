import { useEffect, useState, useRef } from 'react';

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return display;
}

function SummaryCards({ total, counts, avgRisk }) {
  const cards = [
    { label: 'Total Assets', value: total, gradient: 'from-accent/20 to-purple/10', textColor: 'text-accent-hover', borderColor: 'border-accent/15' },
    { label: 'Avg Risk', value: avgRisk ?? 0, gradient: 'from-cyan/20 to-cyan/5', textColor: 'text-cyan', borderColor: 'border-cyan/15' },
    { label: 'Critical', value: counts.Critical, gradient: 'from-critical/20 to-critical/5', textColor: 'text-critical', borderColor: 'border-critical/15' },
    { label: 'High', value: counts.High, gradient: 'from-high/20 to-high/5', textColor: 'text-high', borderColor: 'border-high/15' },
    { label: 'Medium', value: counts.Medium, gradient: 'from-medium/20 to-medium/5', textColor: 'text-medium', borderColor: 'border-medium/15' },
    { label: 'Low', value: counts.Low, gradient: 'from-low/20 to-low/5', textColor: 'text-low', borderColor: 'border-low/15' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.borderColor} p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg group`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] rounded-full -translate-y-4 translate-x-4 group-hover:scale-150 transition-transform duration-500" />
          <p className="text-text-muted text-[9px] uppercase tracking-[0.15em] font-bold mb-2 relative z-10">{card.label}</p>
          <p className={`text-3xl font-black ${card.textColor} tracking-tight relative z-10`}>
            <AnimatedNumber value={card.value} />
          </p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
