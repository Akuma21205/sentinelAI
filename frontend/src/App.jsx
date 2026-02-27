import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary grid-bg">
        {/* Nav */}
        <nav className="border-b border-border bg-bg-secondary/70 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                Sentinel<span className="text-accent-hover">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-low animate-pulse-dot" />
              <span className="text-xs text-text-muted font-medium">System Online</span>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/dashboard/:scanId" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
