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

const CARD_STYLES = {
  'Total Assets': { bg: 'rgba(196,120,91,0.06)', color: 'var(--color-accent)', border: 'rgba(196,120,91,0.12)' },
  'Avg Risk':     { bg: 'rgba(91,138,158,0.06)', color: 'var(--color-cyan)', border: 'rgba(91,138,158,0.12)' },
  'Critical':     { bg: 'rgba(217,79,79,0.06)',   color: 'var(--color-critical)', border: 'rgba(217,79,79,0.12)' },
  'High':         { bg: 'rgba(217,123,79,0.06)',  color: 'var(--color-high)', border: 'rgba(217,123,79,0.12)' },
  'Medium':       { bg: 'rgba(201,168,79,0.06)',  color: 'var(--color-medium)', border: 'rgba(201,168,79,0.12)' },
  'Low':          { bg: 'rgba(79,175,123,0.06)',   color: 'var(--color-low)', border: 'rgba(79,175,123,0.12)' },
};

function SummaryCards({ total, counts, avgRisk }) {
  const cards = [
    { label: 'Total Assets', value: total },
    { label: 'Avg Risk', value: avgRisk ?? 0 },
    { label: 'Critical', value: counts.Critical },
    { label: 'High', value: counts.High },
    { label: 'Medium', value: counts.Medium },
    { label: 'Low', value: counts.Low },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
      {cards.map((card) => {
        const style = CARD_STYLES[card.label];
        return (
          <div
            key={card.label}
            style={{
              backgroundColor: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: '16px',
              padding: '24px',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '10px' }}>
              {card.label}
            </p>
            <p style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', color: style.color, lineHeight: 1 }}>
              <AnimatedNumber value={card.value} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
