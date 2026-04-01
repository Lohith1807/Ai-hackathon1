import { useState } from 'react';
import { register, verifyRegisterOtp } from '../api';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, MapPin, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', dob: '', idFile: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, idFile: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a clear image of your Government ID.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idFile) return alert('Government Identity Verification (Image) is mandatory.');
    setLoading(true);
    try {
      const res = await register(formData);
      if (res.requiresVerification) {
        setIsVerifying(true);
      } else {
        alert('Registered successfully! Welcome to Medy.');
        navigate('/login');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyRegisterOtp(formData.email, otp);
      alert('Account verified and created successfully! Welcome to Medy.');
      navigate('/login');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '3.5rem 3rem', background: 'white', borderRadius: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 80, height: 80, background: 'var(--brand-gradient)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow)' }}>
              <ShieldCheck size={40} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify Email</h2>
              <p className="text-muted">Enter the 4-digit code sent to<br/><strong>{formData.email}</strong></p>
            </div>
          </div>
          <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '1.5rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="0000" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              maxLength="4" 
              required 
              style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '1rem', fontWeight: 800, height: '70px', paddingLeft: '1rem' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%', height: '60px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Complete Registration'}
            </button>
            <button type="button" onClick={() => setIsVerifying(false)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer' }}>
              Oops, back to details
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '4rem 2rem' }}>
      <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '3.5rem', background: 'white', borderRadius: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ width: 70, height: 70, background: 'var(--brand-gradient)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow)', flexShrink: 0 }}>
            <UserPlus size={36} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Join Medy</h2>
            <p className="text-muted">Experience the future of seamless healthcare management.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>FULL NAME</label>
            <input type="text" name="name" className="input-field" placeholder="John Doe" required onChange={handleChange} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>EMAIL ADDRESS</label>
             <input type="email" name="email" className="input-field" placeholder="john@example.com" required onChange={handleChange} />
          </div>

          <div style={{ position: 'relative' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>PHONE NUMBER</label>
            <input type="text" name="phone" className="input-field" placeholder="+1 (555) 000-0000" required onChange={handleChange} />
          </div>

          <div style={{ position: 'relative' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>DATE OF BIRTH</label>
            <input type="date" name="dob" className="input-field" required onChange={handleChange} />
          </div>

          <div style={{ gridColumn: 'span 2', position: 'relative' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>RESIDENTIAL LOCATION</label>
            <input type="text" name="location" className="input-field" placeholder="San Francisco, CA" required onChange={handleChange} />
          </div>

          <div style={{ gridColumn: 'span 2', position: 'relative' }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>GOVERNMENT IDENTITY VERIFICATION (REQUIRED)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="file" accept="image/*" className="input-field" required onChange={handleFileChange} style={{ padding: '0.75rem' }} />
              {formData.idFile && <div style={{ color: 'var(--success)', whiteSpace: 'nowrap', fontWeight: 800 }}>✓ ID Loaded</div>}
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>Please upload a clear photo of your driving license or passport.</p>
          </div>
          
          <div style={{ gridColumn: 'span 2', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Sending Verification...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>Start Your Journey <ArrowRight size={20} /></span>}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
              Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--brand-primary)', fontWeight: 800, cursor: 'pointer' }}>Sign In here</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
