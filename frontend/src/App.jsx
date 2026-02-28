import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ScanPage from './pages/ScanPage';
import Dashboard from './pages/Dashboard';

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen relative">
        {/* Animated gradient mesh background */}
        <div className="gradient-mesh" />

        {/* Floating particles */}
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                opacity: 0.1 + Math.random() * 0.3,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <nav className="relative z-50 border-b border-border bg-bg-primary/60 backdrop-blur-xl sticky top-0">
          <div className="max-w-[1300px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
              </div>
              <span className="text-base font-bold tracking-tight">
                Sentinel<span className="gradient-text">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-low/8 border border-low/15">
                <div className="w-1.5 h-1.5 rounded-full bg-low">
                  <div className="w-1.5 h-1.5 rounded-full bg-low animate-ping" style={{animationDuration:'2s'}} />
                </div>
                <span className="text-[11px] text-low font-medium">Live</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 max-w-[1300px] mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/dashboard/:scanId" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
