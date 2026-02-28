import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScan } from '../services/api';

const TYPING_PHRASES = [
  'Quantify external exposure.',
  'Model attack paths.',
  'Deliver executive clarity.',
];

function useTypingEffect(phrases, speed = 60, pause = 2000) {
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((phraseIdx + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return text;
}

function AnimatedCounter({ end, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * end));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [end, duration]);

  return <>{count}{suffix}</>;
}

/* ─── Shared container style ─── */
const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 32px',
  width: '100%',
};

function ScanPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const typedText = useTypingEffect(TYPING_PHRASES);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await startScan(domain.trim());
      navigate(`/dashboard/${result.scan_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Scan failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ═══════════════════════════════════════
           HERO SECTION — 70vh, centered
         ═══════════════════════════════════════ */}
      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '80px',
          paddingBottom: '80px',
        }}
      >
        <div style={{ ...container, textAlign: 'center' }}>
          <div className="animate-fade-up">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border"
              style={{ padding: '6px 16px', marginBottom: '32px', backgroundColor: '#F5F4F0' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span style={{ fontSize: '11px', letterSpacing: '0.1em' }} className="text-text-secondary font-semibold uppercase">
                Attack Surface Intelligence
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(48px, 7vw, 64px)', lineHeight: 1.05, marginBottom: '24px' }} className="font-black tracking-tight">
              <span className="text-text-primary">Sentinel</span>
              <span className="text-accent">AI</span>
            </h1>

            {/* Typing animation */}
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: 'clamp(18px, 2.5vw, 22px)' }} className="text-text-secondary font-light">
                {typedText}<span className="text-accent">|</span>
              </p>
            </div>

            {/* Description */}
            <p style={{ fontSize: '15px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 48px' }} className="text-text-muted">
              Discover your organization's external attack surface, score risk deterministically, and receive AI-powered strategic intelligence.
            </p>
          </div>

          {/* Domain Input */}
          <form onSubmit={handleScan} className="animate-fade-up stagger-2" style={{ opacity: 0, maxWidth: '600px', margin: '0 auto' }}>
            <div
              className="flex items-stretch gap-4"
              style={{ flexWrap: 'wrap' }}
            >
              {/* Input */}
              <div
                className={`flex-1 flex items-center rounded-xl border overflow-hidden transition-all duration-200 ${
                  focused ? 'border-accent' : 'border-border'
                }`}
                style={{ backgroundColor: '#FFFFFF', minWidth: '260px' }}
              >
                <div style={{ paddingLeft: '16px', paddingRight: '4px' }} className="text-text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Enter domain (e.g. microsoft.com)"
                  disabled={loading}
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted font-mono focus:outline-none disabled:opacity-40"
                  style={{ padding: '14px 8px', fontSize: '14px' }}
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="btn-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ padding: '14px 32px', fontSize: '14px', whiteSpace: 'nowrap' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Scanning...
                  </>
                ) : 'Analyze'}
              </button>
            </div>

            {/* Demo link */}
            <button
              type="button"
              className="text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
              style={{ marginTop: '16px', fontSize: '12px' }}
              onClick={() => { setDomain('microsoft.com'); }}
            >
              <span className="opacity-60">Try demo →</span>
              <span className="font-mono text-text-secondary">microsoft.com</span>
            </button>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl border border-critical/20 text-critical text-left animate-fade-up"
                style={{ marginTop: '24px', padding: '12px 16px', fontSize: '13px', backgroundColor: 'rgba(217,79,79,0.04)' }}
              >
                <span className="font-semibold">Error: </span>{error}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           STATS ROW
         ═══════════════════════════════════════ */}
      <section className="animate-fade-up stagger-3" style={{ opacity: 0, paddingTop: '0', paddingBottom: '80px' }}>
        <div style={container}>
          <div className="flex items-center justify-center flex-wrap" style={{ gap: '48px' }}>
            {[
              { value: 4, suffix: '-Layer', label: 'Risk Engine' },
              { value: 2, suffix: ' LLMs', label: 'AI Models' },
              { value: 15, suffix: '+', label: 'MITRE Techniques' },
            ].map((stat) => (
              <div key={stat.label} className="text-center" style={{ padding: '0 16px' }}>
                <p style={{ fontSize: '28px' }} className="font-bold text-text-primary">
                  <AnimatedCounter end={stat.value} />{stat.suffix}
                </p>
                <p style={{ fontSize: '10px', letterSpacing: '0.12em', marginTop: '6px' }} className="text-text-muted uppercase font-semibold">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Divider ═══ */}
      <div style={{ maxWidth: '120px', margin: '0 auto', borderTop: '1px solid var(--color-border)' }} />

      {/* ═══════════════════════════════════════
           FEATURE CARDS
         ═══════════════════════════════════════ */}
      <section className="animate-fade-up stagger-4" style={{ opacity: 0, paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={container}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >

            {/* Card 1 — Risk Scoring */}
            <div className="glass group" style={{ padding: '28px' }}>
              <div
                className="flex items-center justify-center rounded-lg border border-border group-hover:border-accent/30 transition-colors duration-200"
                style={{ width: '44px', height: '44px', marginBottom: '20px', backgroundColor: '#FAFAF8' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }} className="font-semibold text-text-primary">Risk Scoring</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }} className="text-text-muted">
                Deterministic 4-layer engine: port exposure, context, compound risk, and global posture.
              </p>

              {/* Mini severity bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Critical', w: '15%', color: 'bg-critical' },
                  { label: 'High', w: '30%', color: 'bg-high' },
                  { label: 'Medium', w: '55%', color: 'bg-medium' },
                  { label: 'Low', w: '80%', color: 'bg-low' },
                ].map((bar) => (
                  <div key={bar.label} className="flex items-center" style={{ gap: '8px' }}>
                    <span style={{ fontSize: '10px', width: '50px' }} className="text-text-muted font-medium">{bar.label}</span>
                    <div className="flex-1 overflow-hidden" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#F0EFEB' }}>
                      <div className={`h-full ${bar.color} opacity-50`} style={{ width: bar.w, borderRadius: '3px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Attack Simulation */}
            <div className="glass group" style={{ padding: '28px' }}>
              <div
                className="flex items-center justify-center rounded-lg border border-border group-hover:border-accent/30 transition-colors duration-200"
                style={{ width: '44px', height: '44px', marginBottom: '20px', backgroundColor: '#FAFAF8' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }} className="font-semibold text-text-primary">Attack Simulation</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }} className="text-text-muted">
                MITRE ATT&CK–mapped attack chains with AI-enhanced threat narratives.
              </p>

              {/* Mini attack chain */}
              <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
                {['Recon', 'Access', 'Escalate', 'Exfil'].map((stage, i) => (
                  <div key={stage} className="flex items-center" style={{ gap: '8px' }}>
                    <div
                      className="font-bold uppercase border border-border text-text-secondary"
                      style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '9px', letterSpacing: '0.08em', backgroundColor: '#F5F4F0' }}
                    >
                      {stage}
                    </div>
                    {i < 3 && <span className="text-text-muted" style={{ opacity: 0.3 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — Strategic Intelligence */}
            <div className="glass group" style={{ padding: '28px' }}>
              <div
                className="flex items-center justify-center rounded-lg border border-border group-hover:border-accent/30 transition-colors duration-200"
                style={{ width: '44px', height: '44px', marginBottom: '20px', backgroundColor: '#FAFAF8' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }} className="font-semibold text-text-primary">Strategic Intelligence</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }} className="text-text-muted">
                Gemini-powered posture assessment with maturity scoring and priorities.
              </p>

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="rounded-lg border border-border" style={{ padding: '10px 14px', backgroundColor: '#FAFAF8' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '0.1em' }} className="text-text-muted uppercase font-semibold">Maturity</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }} className="font-bold text-low">Advanced</p>
                </div>
                <div className="rounded-lg border border-border" style={{ padding: '10px 14px', backgroundColor: '#FAFAF8' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '0.1em' }} className="text-text-muted uppercase font-semibold">Confidence</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }} className="font-bold text-accent">89%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           BOTTOM BADGES
         ═══════════════════════════════════════ */}
      <section className="animate-fade-up stagger-5" style={{ opacity: 0, paddingTop: '0', paddingBottom: '80px', textAlign: 'center' }}>
        <div style={container}>
          <div className="flex items-center justify-center flex-wrap" style={{ gap: '12px' }}>
            {['Deterministic Core', 'Groq + Gemini AI', 'MITRE ATT&CK', 'Zero Trust Scoring'].map((badge) => (
              <span
                key={badge}
                className="font-medium text-text-secondary border border-border"
                style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '11px', letterSpacing: '0.04em', backgroundColor: '#F5F4F0' }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ScanPage;
