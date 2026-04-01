import { useState, useEffect } from 'react';
import { searchDoctors, getSlots, bookAppointment, getHospitalsForPatients } from '../api';
import { Search, MapPin, Clock, Star, Activity, User, CalendarDays, ShieldCheck, ChevronDown, Map, ChevronRight, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home({ user }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHospitalInfo, setSelectedHospitalInfo] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [bookingSlot, setBookingSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => { 
    getHospitalsForPatients().then(setHospitals);
  }, []);

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, hospitalFilter]);

  const handleSearch = async () => {
    try { 
      const res = await searchDoctors(query, hospitalFilter);
      setDoctors(res); 
    } catch (err) {}
  };

  const loadSlots = async (docId) => {
    setSelectedDoctor(docId);
    try { setSlots(await getSlots(docId, date)); } catch(err) {}
  };

  const handleBookRequest = (slot) => {
    if (!user) return navigate('/login');
    setBookingSlot(slot);
  };

  const confirmBooking = async () => {
    if (!bookingSlot) return;
    setIsBooking(true);
    try {
      await bookAppointment(bookingSlot.id);
      setBookingSuccess(true);
      setBookingSlot(null);
      loadSlots(selectedDoctor);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredHospitals = query.length > 0 
    ? hospitals.filter(h => h.name.toLowerCase().includes(query.toLowerCase()) || h.location?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelectHospital = (h) => {
    setQuery(h.name);
    setHospitalFilter(h.id);
    setSelectedHospitalInfo(h);
    setShowSuggestions(false);
  };

  return (
    <div>
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
            <span className="status-badge status-Approved" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1.25rem', fontSize: '1rem', background: 'white' }}>
              <Activity size={18} color="var(--brand-primary)"/> AI-Powered Scheduling
            </span>
          </div>
          <h1>Find Highly-Rated Healthcare Near You</h1>
          <p style={{ marginBottom: '2.5rem' }}>Book instant appointments with world-class medical professionals seamlessly. Zero waiting times for verified users.</p>
          
          <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '50px', boxShadow: 'var(--shadow-md)', padding: '0.5rem 0.5rem 0.5rem 1.5rem' }}>
              <Search size={22} color="var(--brand-primary)" style={{ flexShrink: 0 }}/>
              <input 
                type="text" 
                placeholder="Search hospitals or specialists..." 
                value={query}
                onChange={(e) => { 
                  setQuery(e.target.value); 
                  setShowSuggestions(true); 
                  if (!e.target.value) { setHospitalFilter(''); setSelectedHospitalInfo(null); } 
                }}
                onFocus={() => setShowSuggestions(true)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '1rem', fontSize: '1.1rem', background: 'transparent' }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setHospitalFilter(''); setSelectedHospitalInfo(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
              )}
            </div>

            {showSuggestions && filteredHospitals.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)', zIndex: 100, marginTop: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                {filteredHospitals.map(h => (
                  <div 
                    key={h.id} 
                    onClick={() => handleSelectHospital(h)}
                    style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'hsla(var(--brand-hue), 80%, 50%, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Activity size={18} color="var(--brand-primary)"/>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{h.name}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {h.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedHospitalInfo && (
            <div style={{ maxWidth: '750px', margin: '2rem auto 0', background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)', textAlign: 'left', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow)', flexShrink: 0 }}>
                    <Activity size={32} color="white"/>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{selectedHospitalInfo.name}</h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                      <MapPin size={16}/> {selectedHospitalInfo.location}
                    </p>
                  </div>
                </div>
                <span className="status-badge status-Approved" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>{selectedHospitalInfo.status || 'Verified Facility'}</span>
              </div>
              
              {selectedHospitalInfo.specialties && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>AVAILABLE SPECIALTIES</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {selectedHospitalInfo.specialties.split(',').map((s, i) => (
                      <span key={i} style={{ padding: '0.5rem 1rem', background: 'var(--bg-main)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-primary)', border: '1px solid var(--border-light)' }}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedHospitalInfo.location + ' ' + selectedHospitalInfo.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.875rem 1.5rem', background: 'var(--brand-gradient)', color: 'white', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', boxShadow: 'var(--brand-glow-subtle)' }}
                >
                  <MapPin size={18}/> Get Directions
                </a>
                <button 
                  onClick={() => { setSelectedHospitalInfo(null); setQuery(''); setHospitalFilter(''); }}
                  className="btn-secondary" style={{ padding: '0.875rem 1.5rem', fontSize: '1rem' }}
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <section className="container" style={{ padding: '6rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.75rem', marginBottom: '1.25rem', fontWeight: 800 }}>The Medy Advantage</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto' }}>
            We've redesigned healthcare scheduling from the ground up to be faster, smarter, and completely transparent.
          </p>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'hsla(220, 90%, 45%, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--brand-primary)' }}>
              <ShieldCheck size={36} />
            </div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>Secure & Private</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Your medical data is encrypted with bank-grade security and accessed only via secure OTP verification.</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'hsla(150, 70%, 45%, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--success)' }}>
              <Activity size={36} />
            </div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>AI Matching</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Our smart algorithms identify the best specialists based on your needs, location, and real patient reviews.</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'hsla(40, 90%, 50%, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--warning)' }}>
              <Clock size={36} />
            </div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>Instant Booking</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Skip the phone calls. See real-time availability and book your slot in under 30 seconds.</p>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '8rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center', fontWeight: 800 }}>
          {hospitalFilter ? `Available Specialists at ${selectedHospitalInfo?.name}` : 'Recommended Specialists'}
        </h2>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {doctors.map(doc => (
            <div key={doc.id} className="card" style={{ padding: '2rem', borderTop: '6px solid var(--brand-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                    <User size={24} color="var(--brand-primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Dr. {doc.name}</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>{doc.specialization}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 800 }}>
                    <Star size={16} fill="var(--warning)"/> {doc.rating || '5.0'}
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>120+ Reviews</p>
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>AFFILIATED FACILITY</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 800 }}>
                  <Activity size={16} /> {doc.Hospital?.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <MapPin size={14} className="text-muted" /> <span className="text-muted">{doc.Hospital?.location}</span>
                </div>
              </div>

              <button 
                className={selectedDoctor === doc.id ? "btn-secondary" : "btn-primary"} 
                style={{ width: '100%', padding: '1rem' }} 
                onClick={() => loadSlots(doc.id)}
              >
                <CalendarDays size={18} /> {selectedDoctor === doc.id ? 'Viewing Availability' : 'Check Availability'}
              </button>

              {selectedDoctor === doc.id && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--border-light)' }}>
                  <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="var(--brand-primary)"/> Available for {new Date(date).toLocaleDateString()}
                  </h4>
                  
                  {slots.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>No more slots available for this date.</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {(!user || user.role === 'User') ? (
                        slots.map(slot => (
                          <button 
                            key={slot.id} 
                            className="btn-secondary" 
                            onClick={() => handleBookRequest(slot)}
                            style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
                          >
                            {slot.startTime}
                          </button>
                        ))
                      ) : (
                        <p className="text-success" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          Logged in as {user.role}. Booking restricted to Patients.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {bookingSlot && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '3.5rem', background: 'white' }}>
              <div style={{ width: 80, height: 80, background: 'hsla(var(--brand-hue), 80%, 53%, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--brand-primary)' }}>
                <Clock size={40} />
              </div>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Confirm Clinical Booking</h2>
              <p className="text-muted" style={{ fontSize: '1.15rem', marginBottom: '2.5rem' }}>
                You are booking a consultation with <strong>Dr. {doctors.find(d => d.id === selectedDoctor)?.name}</strong> on <strong>{new Date(bookingSlot.date).toLocaleDateString()}</strong> at <strong>{bookingSlot.startTime}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={confirmBooking} disabled={isBooking} style={{ padding: '1.25rem 2.5rem' }}>
                  {isBooking ? 'Processing...' : 'Confirm Booking'}
                </button>
                <button className="btn-secondary" onClick={() => setBookingSlot(null)} style={{ padding: '1.25rem 2.5rem' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '8rem', padding: '6rem 4rem', background: 'var(--brand-gradient)', borderRadius: '32px', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'var(--brand-glow)' }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ color: 'white', fontSize: '3.25rem', marginBottom: '1.5rem', fontWeight: 800 }}>Our Mission</h2>
            <p style={{ fontSize: '1.5rem', maxWidth: '850px', margin: '0 auto', opacity: 0.95, lineHeight: 1.6 }}>
              At Medy, we believe that access to quality healthcare should be as simple as booking a ride. 
              Our platform bridges the gap between top medical specialists and those who need them most, 
              eliminating administrative friction through secure, automated scheduling.
            </p>
          </div>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 400, height: 400, background: 'white', opacity: 0.05, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 500, height: 500, background: 'white', opacity: 0.05, borderRadius: '50%' }}></div>
        </div>
      </section>

      {bookingSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '4rem 3rem', background: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ background: 'var(--success)', width: '100px', height: '100px', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 20px 40px hsla(150, 80%, 40%, 0.3)' }}>
              <ShieldCheck size={50} color="white" />
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Booking Confirmed!</h2>
            <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2.5rem' }}>Your appointment has been successfully recorded. The doctor has been notified of your booking.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '1.25rem' }}>View My Appointments</button>
              <button className="btn-secondary" onClick={() => setBookingSuccess(false)} style={{ padding: '1rem' }}>Continue Browsing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
