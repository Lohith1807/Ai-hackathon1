import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp as sendOtpRequest, verifyOtp as verifyOtpRequest } from '../api';
import { ShieldCheck, ArrowRight, Phone, KeyRound } from 'lucide-react';

export default function Login({ onLogin }) {
  const [id, setId] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!id) return;
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await sendOtpRequest(id);
      setMsg({ text: res.message, type: 'success' });
      setPhone(res.phone || id);
      setStep(2);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      const res = await verifyOtpRequest(phone, otp);
      setMsg({ text: 'Login Successful', type: 'success' });
      localStorage.setItem('token', res.token);
      if (onLogin) onLogin(res.user);
      navigate('/dashboard');
    } catch (err) {
      setMsg({ text: 'Invalid verification code.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, background: 'var(--brand-primary)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, background: 'var(--brand-secondary)', filter: 'blur(180px)', opacity: 0.08, zIndex: 0 }}></div>

      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '3.5rem 3rem', background: 'white', borderRadius: '32px', textAlign: 'center', position: 'relative', zIndex: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        
        <div style={{ background: 'var(--brand-gradient)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', boxShadow: 'var(--brand-glow)' }}>
          <ShieldCheck size={42} color="white" />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: 800 }}>Welcome to Medy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Access your secure medical dashboard to manage consultations.</p>

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

        {step === 1 ? (
          <form onSubmit={handleSend} style={{ display: 'grid', gap: '1.25rem' }}>
             <div style={{ position: 'relative' }}>
                <Phone size={20} color="var(--text-muted)" style={{ position: 'absolute', top: 22, left: 16 }} />
                <input 
                  className="input-field" 
                  placeholder="Phone or Registered Email" 
                  value={id} 
                  onChange={e => setId(e.target.value)} 
                  style={{ height: '64px', paddingLeft: '3rem' }}
                  required
                />
             </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ height: '64px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Processing...' : 'Send Verification Code'} <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <KeyRound size={20} color="var(--text-muted)" style={{ position: 'absolute', top: 22, left: 16 }} />
              <input 
                className="input-field" 
                placeholder="Enter 4-digit code" 
                maxLength={4}
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                style={{ 
                  height: '54px', 
                  textAlign: 'center', 
                  letterSpacing: otp ? '4px' : 'normal', 
                  fontSize: '1rem', 
                  background: 'var(--bg-main)',
                  fontWeight: 600
                }}
                required
                autoFocus
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ height: '64px', fontSize: '1.1rem', fontWeight: 700 }}>
              {loading ? 'Verifying...' : 'Login Securely'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem' }}>Back to Home</button>
          </form>
        )}
      </div>
    </div>
  );
}
