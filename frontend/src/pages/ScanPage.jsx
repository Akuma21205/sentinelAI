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
    let start = 0;
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
      {/* ═══ Hero Section ═══ */}
      <section className="pt-20 pb-16 text-center relative">
        {/* Decorative orb */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/8 border border-accent/15 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] text-accent-hover font-semibold uppercase tracking-widest">Attack Surface Intelligence</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="text-text-primary">Sentinel</span>
            <span className="gradient-text">AI</span>
          </h1>

          {/* Typing animation */}
          <div className="h-8 flex items-center justify-center mb-6">
            <p className="text-lg sm:text-xl text-text-secondary font-light">
              {typedText}<span className="animate-pulse text-accent">|</span>
            </p>
          </div>

          <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed mb-10">
            Discover your organization's external attack surface, score risk deterministically, and receive AI-powered strategic intelligence.
          </p>
        </div>

        {/* Domain Input */}
        <form onSubmit={handleScan} className="max-w-lg mx-auto animate-fade-up stagger-2" style={{opacity:0}}>
          <div className={`relative rounded-2xl transition-all duration-500 ${focused ? 'shadow-[0_0_40px_rgba(124,58,237,0.15)]' : ''}`}>
            {/* Gradient border on focus */}
            <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-accent via-cyan to-purple transition-opacity duration-500 ${focused ? 'opacity-30' : 'opacity-0'}`} />

            <div className="relative flex items-center bg-bg-secondary/80 backdrop-blur-xl rounded-2xl border border-border overflow-hidden">
              <div className="pl-5 pr-2 text-text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter domain (e.g. microsoft.com)"
                disabled={loading}
                className="flex-1 py-4 px-2 bg-transparent text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none disabled:opacity-40"
              />
              <div className="pr-2">
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="btn-accent px-6 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>
          </div>

          <button
            type="button"
            className="mt-4 text-text-muted text-xs hover:text-accent-hover transition-colors inline-flex items-center gap-1"
            onClick={() => { setDomain('microsoft.com'); }}
          >
            <span className="opacity-50">Try demo →</span>
            <span className="font-mono text-accent-hover/70">microsoft.com</span>
          </button>
        </form>

        {error && (
          <div className="mt-5 max-w-md mx-auto px-4 py-2.5 glass rounded-xl border-critical/20 text-critical text-xs text-left animate-fade-up">
            <span className="font-semibold">Error: </span>{error}
          </div>
        )}
      </section>

      {/* ═══ Stats Row ═══ */}
      <section className="pb-12 animate-fade-up stagger-3" style={{opacity:0}}>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {[
            { value: 4, suffix: '-Layer', label: 'Risk Engine' },
            { value: 2, suffix: ' LLMs', label: 'AI Models' },
            { value: 15, suffix: '+', label: 'MITRE Techniques' },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-6">
              <p className="text-2xl font-bold gradient-text">
                <AnimatedCounter end={stat.value} />{stat.suffix}
              </p>
              <p className="text-text-muted text-[10px] uppercase tracking-widest mt-1 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Feature Cards ═══ */}
      <section className="pb-20 max-w-5xl mx-auto animate-fade-up stagger-4" style={{opacity:0}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1 — Risk Scoring */}
          <div className="glass group p-6 relative overflow-hidden animate-shimmer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[60px] group-hover:bg-accent/10 transition-all duration-500" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Risk Scoring</h3>
              <p className="text-text-muted text-xs leading-relaxed mb-4">Deterministic 4-layer engine: port exposure, context, compound risk, and global posture.</p>

              {/* Mini severity bars */}
              <div className="space-y-2">
                {[
                  { label: 'Critical', w: '15%', color: 'bg-critical' },
                  { label: 'High', w: '30%', color: 'bg-high' },
                  { label: 'Medium', w: '55%', color: 'bg-medium' },
                  { label: 'Low', w: '80%', color: 'bg-low' },
                ].map((bar) => (
                  <div key={bar.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-text-muted w-12 font-medium">{bar.label}</span>
                    <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color} opacity-60 transition-all duration-1000`} style={{ width: bar.w }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Attack Simulation */}
          <div className="glass group p-6 relative overflow-hidden animate-shimmer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-critical/5 rounded-full blur-[60px] group-hover:bg-critical/10 transition-all duration-500" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-critical/20 to-critical/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-critical" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Attack Simulation</h3>
              <p className="text-text-muted text-xs leading-relaxed mb-4">MITRE ATT&CK–mapped attack chains with AI-enhanced threat narratives.</p>

              {/* Mini attack chain */}
              <div className="flex items-center gap-1.5">
                {['Recon', 'Access', 'Escalate', 'Exfil'].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-1.5">
                    <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider ${
                      i === 0 ? 'bg-high/15 text-high' :
                      i === 1 ? 'bg-critical/15 text-critical' :
                      i === 2 ? 'bg-medium/15 text-medium' :
                      'bg-critical/15 text-critical'
                    }`}>
                      {stage}
                    </div>
                    {i < 3 && <span className="text-text-muted/20">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 — Strategic Intelligence */}
          <div className="glass group p-6 relative overflow-hidden animate-shimmer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 rounded-full blur-[60px] group-hover:bg-cyan/10 transition-all duration-500" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan/20 to-cyan/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">Strategic Intelligence</h3>
              <p className="text-text-muted text-xs leading-relaxed mb-4">Gemini-powered posture assessment with maturity scoring and priorities.</p>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg-elevated/30 rounded-lg px-3 py-2">
                  <p className="text-[8px] text-text-muted uppercase tracking-wider font-semibold">Maturity</p>
                  <p className="text-xs font-bold text-low mt-0.5">Advanced</p>
                </div>
                <div className="bg-bg-elevated/30 rounded-lg px-3 py-2">
                  <p className="text-[8px] text-text-muted uppercase tracking-wider font-semibold">Confidence</p>
                  <p className="text-xs font-bold text-accent-hover mt-0.5">89%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Bottom Badges ═══ */}
      <section className="pb-16 text-center animate-fade-up stagger-5" style={{opacity:0}}>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {['Deterministic Core', 'Groq + Gemini AI', 'MITRE ATT&CK', 'Zero Trust Scoring'].map((badge) => (
            <span key={badge} className="px-3 py-1.5 rounded-full text-[10px] font-medium text-text-muted bg-bg-elevated/30 border border-border tracking-wide">
              {badge}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ScanPage;
