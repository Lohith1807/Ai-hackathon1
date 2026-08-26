import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getProfile } from './api';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
import AIChatBot from './components/AIChatBot';
import { Activity, LogOut, User as UserIcon, LayoutGrid, Menu, X } from 'lucide-react';

function AppContent() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();
  const navigate = useNavigate();

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

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      <header className="header">
        <div className="container header-content" style={{ justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
          {user && (
            <button 
              onClick={() => {
                if (!isDashboard) {
                  setSidebarOpen(true);
                  navigate('/dashboard');
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }} 
              className="btn-secondary" 
              style={{ marginRight: '1rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen && isDashboard ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          )}
          <Link to="/" className="logo" aria-label="Medy Home" style={{ marginRight: 'auto' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--brand-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow)' }} aria-hidden="true">
              <Activity size={24} color="white" />
            </div>
            <span>Medy<span style={{ color: 'var(--brand-primary)' }}>.</span></span>
          </Link>
          <nav className="nav-links" aria-label="Main Navigation">
            {user ? (
              user.role === 'User' ? (
                <Link to="/dashboard" state={{ tab: 'BookAppointment' }} className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontWeight: 600, whiteSpace: 'nowrap', color: 'white' }}>
                  Book an Appointment
                </Link>
              ) : null
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.5rem', fontWeight: 600 }}>Sign In</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--brand-primary)' }}>Loading Medy...</div>}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard/*" element={user ? <Dashboard user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> : <Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </main>
      
      <AIChatBot />

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
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
