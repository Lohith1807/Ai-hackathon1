import { useState } from 'react';
import { register } from '../api';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', dob: '', idFile: '', password: ''
  });
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
      await register(formData);
      alert('Registered successfully! Welcome to Medy.');
      navigate('/login');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container" aria-label="Registration Page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '2rem 1rem' }}>
      <section className="card" aria-labelledby="register-heading" style={{ maxWidth: '650px', width: '100%', background: 'white', borderRadius: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ width: 70, height: 70, background: 'var(--brand-primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
            <UserPlus size={36} color="white" />
          </div>
          <div>
            <h2 id="register-heading" style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Join Medy</h2>
            <p className="text-muted">Experience the future of seamless healthcare management.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <label htmlFor="reg-name" className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>FULL NAME</label>
            <input id="reg-name" type="text" name="name" className="input-field" placeholder="John Doe" required onChange={handleChange} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label htmlFor="reg-email" className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>EMAIL ADDRESS</label>
             <input id="reg-email" type="email" name="email" className="input-field" placeholder="john@example.com" required onChange={handleChange} />
          </div>

          <div style={{ position: 'relative' }}>
            <label htmlFor="reg-phone" className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>PHONE NUMBER</label>
            <input id="reg-phone" type="text" name="phone" className="input-field" placeholder="+1 (555) 000-0000" required onChange={handleChange} />
          </div>

          <div style={{ position: 'relative' }}>
            <label htmlFor="reg-dob" className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>DATE OF BIRTH</label>
            <input id="reg-dob" type="date" name="dob" className="input-field" required onChange={handleChange} />
          </div>

          <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
            <label htmlFor="reg-password" className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>PASSWORD</label>
            <input id="reg-password" type="password" name="password" className="input-field" placeholder="Create a strong password" required onChange={handleChange} />
          </div>

          <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
            <label htmlFor="reg-loc" className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>RESIDENTIAL LOCATION</label>
            <input id="reg-loc" type="text" name="location" className="input-field" placeholder="San Francisco, CA" required onChange={handleChange} />
          </div>

          <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
            <label htmlFor="reg-id" className="text-muted" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>GOVERNMENT IDENTITY VERIFICATION (REQUIRED)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input id="reg-id" type="file" accept="image/*" className="input-field" required onChange={handleFileChange} style={{ padding: '0.75rem' }} />
              {formData.idFile && <div style={{ color: 'var(--success)', whiteSpace: 'nowrap', fontWeight: 800 }}>✓ ID Loaded</div>}
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>Please upload a clear photo of your driving license or passport.</p>
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>Start Your Journey <ArrowRight size={20} /></span>}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
              Already have an account? <span role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate('/login'); }} onClick={() => navigate('/login')} style={{ color: 'var(--brand-primary)', fontWeight: 800, cursor: 'pointer' }}>Sign In here</span>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
