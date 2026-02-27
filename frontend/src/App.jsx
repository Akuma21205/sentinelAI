import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-slate-100 tracking-tight">
              Attack Surface Intelligence
            </h1>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
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
