import { ShieldCheck, Activity, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home({ user }) {
  return (
    <main aria-label="Medy Healthcare Homepage">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
            <span className="status-badge status-Approved" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1.25rem', fontSize: '1rem', background: 'white' }}>
              <Activity size={18} color="var(--brand-primary)" aria-hidden="true" /> Smart Healthcare Platform
            </span>
          </div>
          <h1 id="hero-heading">Clinical Excellence, Simplified.</h1>
          <p style={{ marginBottom: '3rem', maxWidth: '700px' }}>
            Experience seamless medical scheduling, secure identity verification, and instant access to top healthcare professionals across our verified network.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to={user ? "/dashboard" : "/register"} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-pill)' }} aria-label={user ? "Go to Dashboard" : "Register to Get Started"}>
              Get Started <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      
      <section className="container" style={{ padding: '4rem 0 8rem' }} aria-labelledby="features-heading">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 id="features-heading" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>The Medy Standard</h2>
          <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto' }}>
            A unified, secure platform designed for both patients and healthcare providers.
          </p>
        </div>
        
        <div className="grid">
          <article className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ width: 64, height: 64, background: 'var(--bg-main)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--brand-primary)' }}>
              <ShieldCheck size={32} aria-hidden="true" />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>Secure & Private</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Your medical data is encrypted with strict security standards and accessed only via secure verification.</p>
          </article>
          
          <article className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ width: 64, height: 64, background: 'var(--bg-main)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--brand-primary)' }}>
              <Activity size={32} aria-hidden="true" />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>Verified Network</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>We partner exclusively with accredited hospitals and certified medical specialists for top-tier care.</p>
          </article>
          
          <article className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ width: 64, height: 64, background: 'var(--bg-main)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--brand-primary)' }}>
              <Clock size={32} aria-hidden="true" />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>Instant Scheduling</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Skip the waiting room. View real-time availability and book your consultation instantly.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
