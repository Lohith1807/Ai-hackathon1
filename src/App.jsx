import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { getProfile } from './api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Activity, LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  return (
    <Router>
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <div style={{ width: '40px', height: '40px', background: 'var(--brand-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow)' }}>
              <Activity size={24} color="white" />
            </div>
            <span>Medy<span style={{ color: 'var(--brand-primary)' }}>.</span></span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <LayoutGrid size={18} /> Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                      <UserIcon size={16} color="var(--brand-primary)" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bold)' }}>{user.name.split(' ')[0]}</span>
                  </div>
                  <button 
                    className="btn-secondary" 
                    onClick={() => { localStorage.clear(); window.location.href='/'; }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/login" style={{ fontWeight: 700 }}>Sign In</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Get Started</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard/*" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      
      <footer style={{ padding: '4rem 0', background: 'white', borderTop: '1px solid var(--border-light)', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div className="logo" style={{ marginBottom: '1rem' }}>
              <span>Medy<span style={{ color: 'var(--brand-primary)' }}>.</span></span>
            </div>
            <p className="text-muted" style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
              Revolutionizing healthcare scheduling through intelligent automation and patient-centric design.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-bold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platform</span>
              <Link to="/" className="text-muted" style={{ fontSize: '0.9rem' }}>Doctors</Link>
              <Link to="/" className="text-muted" style={{ fontSize: '0.9rem' }}>Hospitals</Link>
              <Link to="/" className="text-muted" style={{ fontSize: '0.9rem' }}>Pricing</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-bold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</span>
              <Link to="/" className="text-muted" style={{ fontSize: '0.9rem' }}>Help Center</Link>
              <Link to="/" className="text-muted" style={{ fontSize: '0.9rem' }}>Privacy Policy</Link>
              <Link to="/" className="text-muted" style={{ fontSize: '0.9rem' }}>Terms</Link>
            </div>
          </div>
        </div>
        <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>&copy; 2026 Medy Healthcare Systems. All rights reserved.</p>
        </div>
      </footer>
    </Router>
  );
}
