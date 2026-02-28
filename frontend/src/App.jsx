import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ScanPage from './pages/ScanPage';
import Dashboard from './pages/Dashboard';

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>

        {/* Navigation */}
        <nav className="border-b border-border bg-bg-primary sticky top-0 z-50">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }} className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-text-primary">
                Sentinel<span className="text-accent">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-low/8 border border-low/15">
                <div className="w-1.5 h-1.5 rounded-full bg-low" />
                <span className="text-[11px] text-low font-medium">Live</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
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
