import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { ShieldCheck, ArrowRight, Phone, KeyRound } from 'lucide-react';

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await login(identifier, password);
      setMsg({ text: 'Login Successful', type: 'success' });
      localStorage.setItem('token', res.token);
      if (onLogin) onLogin(res.user);
      navigate('/dashboard');
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container" aria-label="Login Page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
      <section className="card" aria-labelledby="login-heading" style={{ maxWidth: '480px', width: '100%', margin: '2rem 1rem', background: 'white', borderRadius: '32px', textAlign: 'center', position: 'relative', zIndex: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        
        <div style={{ background: 'var(--brand-primary)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }} aria-hidden="true">
          <ShieldCheck size={42} color="white" />
        </div>
        
        <h1 id="login-heading" style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: 800 }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Log in to access your secure medical dashboard.</p>

        {msg.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            fontWeight: 700,
            background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: msg.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fecaca'}`,
            textAlign: 'left'
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Phone size={20} color="var(--text-muted)" style={{ position: 'absolute', top: 22, left: 16 }} />
            <input 
              aria-label="Phone or Email"
              className="input-field" 
              placeholder="Phone or Email" 
              value={identifier} 
              onChange={e => setIdentifier(e.target.value)} 
              style={{ height: '64px', paddingLeft: '3rem' }}
              required
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <KeyRound size={20} color="var(--text-muted)" style={{ position: 'absolute', top: 22, left: 16 }} />
            <input 
              aria-label="Password"
              type="password"
              className="input-field" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ height: '64px', paddingLeft: '3rem' }}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ height: '64px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? 'Authenticating...' : 'Sign In securely'} <ArrowRight size={20} />
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <span role="button" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Enter') navigate('/register') }} onClick={() => navigate('/register')} style={{ color: 'var(--brand-primary)', fontWeight: 800, cursor: 'pointer' }}>Register here</span>
        </p>
      </section>
    </main>
  );
}
