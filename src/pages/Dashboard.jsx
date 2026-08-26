import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  myAppointments, getPendingDoctors, updateDoctorStatus, addDoctor, 
  getHospitalDoctors, generateSlots, getAppointments, updateAppointment, 
  addHospital, getHospitals, getAllApprovedDoctors, getHospitalDetailedDocs, 
  getHospitalDetailedStaff, adminCreateUser, addTeamMember, getHospitalTeam,
  deleteDoctor, updateHospital, updateProfile, editDoctor,
  getHospitalsForPatients, searchDoctors, getSlots, bookAppointment
} from '../api';
import { 
  User as UserIcon, Calendar, CheckSquare, PlusCircle, LayoutDashboard, 
  Clock, LogOut, Activity, Star, MapPin, Search, ChevronRight, ArrowLeft, Users,
  ShieldCheck, Menu
} from 'lucide-react';

export default function Dashboard({ user, sidebarOpen, setSidebarOpen }) {
  const [adminTab, setAdminTab] = useState('Profile');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.tab) {
      setAdminTab(location.state.tab);
    }
  }, [location.state]);

  const handleNav = (tab) => {
    setAdminTab(tab);
    if (window.innerWidth < 768 && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const goHome = () => {
    if (window.innerWidth < 768 && setSidebarOpen) setSidebarOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const initialTab = user.role === 'Admin' ? 'Overview' : (user.role === 'User' ? 'MyBookings' : (user.role === 'Staff' ? 'StaffAppts' : 'ManagerDocs'));
      setAdminTab(initialTab);
    }
  }, [user]);

  if (!user) return (
    <div className="container" style={{ paddingTop: '10rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--brand-primary)' }}>
      Synchronizing Clinical Environment...
    </div>
  );

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="sidebar" style={{ minWidth: '260px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-bold)' }}>
          {user.role === 'HospitalManager' ? 'Manager' : user.role} Portal
        </h3>
        <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <UserIcon size={16} /> {user?.name || 'User'}
        </p>
        <hr style={{ margin: '1.5rem 0', opacity: 0.5 }} />
        <ul style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <li onClick={goHome}><Activity size={18} /> Home</li>
          {user.role === 'Admin' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => handleNav('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'Overview' ? 'active' : ''} onClick={() => handleNav('Overview')}><LayoutDashboard size={18} /> Overview</li>
              <li className={adminTab === 'Hospitals' ? 'active' : ''} onClick={() => handleNav('Hospitals')}><Activity size={18} /> Hospitals</li>
              <li className={adminTab === 'ManageDoctors' ? 'active' : ''} onClick={() => handleNav('ManageDoctors')}><CheckSquare size={18} /> Manage Doctors</li>
              <li className={adminTab === 'Users' ? 'active' : ''} onClick={() => handleNav('Users')}><PlusCircle size={18} /> User Management</li>
            </>
          )}
          {user.role === 'User' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => handleNav('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'MyBookings' ? 'active' : ''} onClick={() => handleNav('MyBookings')}><Calendar size={18} /> My Bookings</li>
              <li className={adminTab === 'BookAppointment' ? 'active' : ''} onClick={() => handleNav('BookAppointment')}><PlusCircle size={18} /> Book Appointment</li>
            </>
          )}
          {user.role === 'HospitalManager' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => handleNav('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'ManagerDocs' ? 'active' : ''} onClick={() => handleNav('ManagerDocs')}><PlusCircle size={18} /> Hospital Doctors</li>
            </>
          )}
          {user.role === 'Staff' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => handleNav('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'StaffAppts' ? 'active' : ''} onClick={() => handleNav('StaffAppts')}><Calendar size={18} /> Manage Appointments</li>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <AnimatedLogoutButton onLogout={() => { localStorage.clear(); window.location.href='/'; }} />
          </div>
        </ul>
      </div>
      )}
      <div className={`main-content ${sidebarOpen ? 'hide-on-mobile' : ''}`} style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Welcome back, {user?.name ? (user.name.startsWith('Dr.') ? user.name.split(' ').slice(0, 2).join(' ') : user.name.split(' ')[0]) : 'User'}!
          </h2>
        </div>
        
        {adminTab === 'Profile' && <ProfileView user={user} />}
        {adminTab !== 'Profile' && (
          <div style={{ marginTop: '2rem' }}>
            {adminTab === 'MyBookings' && <UserMyBookings />}
            {adminTab === 'BookAppointment' && <UserBookAppointmentView />}
            {adminTab === 'Overview' && <AdminDashboard activeTab={adminTab} />}
            {user.role === 'HospitalManager' && <ManagerDashboard />}
            {user.role === 'Staff' && <StaffDashboard />}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileView({ user }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ 
    name: user.name, 
    phone: user.phone, 
    email: user.email, 
    dob: user.dob || '' 
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      alert('Neural Identity updated. Restarting session sync...');
      window.location.reload();
    } catch (err) { alert(err.message); }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="card" style={{ background: 'white', padding: '3.5rem', maxWidth: '800px', borderLeft: '6px solid var(--brand-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem' }}>Personal Profile</h3>
          <p className="text-muted">Manage your clinical identity and contact records.</p>
        </div>
        <button className={editMode ? "btn-secondary" : "btn-primary"} onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel' : 'Modify Profile'}
        </button>
      </div>

      {editMode ? (
        <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '2rem' }}>
          <div className="grid">
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>FULL NAME</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>DATE OF BIRTH</label>
              <input type="date" className="input-field" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required />
            </div>
          </div>
          <div className="grid">
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>PHONE NUMBER</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>Finalize Identity Changes</button>
        </form>
      ) : (
        <div style={{ display: 'grid', gap: '2.5rem' }}>
          <div className="grid">
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em' }}>LEGAL IDENTITY</label>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.5rem 0' }}>{user.name}</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em' }}>BIO DATA</label>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.5rem 0' }}>{user.dob ? `${user.dob} (${calculateAge(user.dob)} Years)` : 'Not Specified'}</p>
            </div>
          </div>

          <div className="grid">
            <div>
              <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em' }}>CONTACT RECORD</label>
              <p style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{user.phone} | {user.email}</p>
            </div>
            {user.Hospital && (
              <div>
                <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em' }}>AFFILIATED FACILITY</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', margin: '0.5rem 0' }}>{user.Hospital?.name}</p>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(user.Hospital.name + ' ' + user.Hospital.location)}`} target="_blank" rel="noopener noreferrer" className="text-muted"><MapPin size={18} /></a>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-muted" style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em' }}>SYSTEM ROLE</label>
            <p style={{ marginTop: '0.5rem' }}><span className="status-badge" style={{ background: 'hsla(var(--brand-hue), 80%, 50%, 0.1)', color: 'var(--brand-primary)', fontWeight: 800 }}>
              {user.role === 'User' ? 'Verified Patient' : (user.role === 'HospitalManager' ? 'Lead Administrator' : user.role)}
            </span></p>
          </div>

          <div style={{ marginTop: '1rem', padding: '2.5rem', background: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--success)', width: 48, height: 48, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)' }}>
                <ShieldCheck color="white" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.25rem', margin: 0 }}>Clinical Identity Access</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Verified via National Medical Security Standards.</p>
              </div>
            </div>
            
            {user.idFile ? (
              <img 
                src={user.idFile} 
                alt="Identity Record" 
                style={{ width: '100%', maxWidth: '550px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '2px solid white' }} 
              />
            ) : (
              <div style={{ padding: '3rem', background: 'white', borderRadius: '20px', border: '2px dashed var(--border-light)', textAlign: 'center' }}>
                <Users size={48} className="text-muted" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                <p className="text-muted">Digital identity documentation pending upload.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserDashboard() {
  const [appts, setAppts] = useState([]);
  useEffect(() => { 
    myAppointments().then(setAppts).catch(err => {
      console.warn('Clinical sync error:', err.message);
      setAppts([]);
    }); 
  }, []);

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Calendar color="var(--brand-primary)"/> My Appointments</h3>
      {appts.length === 0 ? <p className="text-muted">You have no upcoming appointments.</p> : (
        <div className="grid">
          {appts.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: `4px solid ${a.status === 'Confirmed' ? 'var(--success)' : a.status === 'Completed' ? '#6b7280' : 'var(--brand-primary)'}`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0 }}>Dr. {a.Doctor?.name}</h4>
                <span className={`status-badge status-${a.status}`}>{a.status}</span>
              </div>
              <p className="text-muted" style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{a.Doctor?.specialization}</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0.75rem 0', fontWeight: 600 }}>
                <Clock size={16} color="var(--brand-primary)"/> {new Date(a.Slot?.date).toLocaleDateString()} at {a.Slot?.startTime} - {a.Slot?.endTime}
              </p>
              
              {a.Doctor?.Hospital && (
                <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="var(--brand-primary)"/> {a.Doctor.Hospital.name}
                  </p>
                  <p className="text-muted" style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14}/> {a.Doctor.Hospital.location}
                  </p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a.Doctor.Hospital.location + ' ' + a.Doctor.Hospital.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', background: 'var(--brand-gradient)', color: 'white', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
                  >
                    <MapPin size={14}/> Get Directions
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ activeTab }) {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [approvedDocs, setApprovedDocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [hSearch, setHSearch] = useState('');
  const [dSearch, setDSearch] = useState('');
  const [showVerifications, setShowVerifications] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', contactInfo: '', specialties: '' });

  const load = async () => {
    try {
      setHospitals(await getHospitals());
      setPendingDocs(await getPendingDoctors());
      setApprovedDocs(await getAllApprovedDoctors());
    } catch (err) {
      console.warn('Admin stats sync error:', err.message);
    }
  };

  useEffect(() => { load().catch(err => console.warn('Dashboard sync error:', err.message)); }, []);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    await addHospital(formData);
    setShowForm(false);
    load();
  };

  const handleStatus = async (id, status) => {
    await updateDoctorStatus(id, status);
    load();
  };

  const filteredHospitals = hospitals.filter(h => h.name.toLowerCase().includes(hSearch.toLowerCase()) || h.location.toLowerCase().includes(hSearch.toLowerCase()));
  const filteredDoctors = approvedDocs.filter(d => d.name.toLowerCase().includes(dSearch.toLowerCase()) || d.specialization.toLowerCase().includes(dSearch.toLowerCase()));

  if (activeTab === 'Hospitals' && selectedHospital) {
    return <AdminHospitalDetail hospital={selectedHospital} onBack={() => setSelectedHospital(null)} />;
  }

  return (
    <div>
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--brand-primary)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>TOTAL HOSPITALS</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-bold)' }}>{hospitals.length}</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--success)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>ACTIVE DOCTORS</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-bold)' }}>{approvedDocs.length}</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--warning)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>PENDING VERIFICATIONS</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-bold)' }}>{pendingDocs.length}</p>
          </div>
        </div>
      )}

      {activeTab === 'Hospitals' && (
        <div className="table-responsive">
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
            <h3>Hospitals Registry</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', opacity: 0.5 }} />
                <input className="input-field" placeholder="Search hospitals..." style={{ paddingLeft: '3rem', minWidth: '250px' }} value={hSearch} onChange={e => setHSearch(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Hospital</button>
            </div>
          </div>
          {showForm && (
            <form onSubmit={handleAddHospital} className="card" style={{ margin: '1.5rem', display: 'grid', gap: '1rem', border: '2px solid var(--brand-primary)', background: 'white' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Provision New Hospital</h4>
              <input className="input-field" placeholder="Hospital Name" required onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input className="input-field" placeholder="Location" required onChange={e => setFormData({ ...formData, location: e.target.value })} />
              <input className="input-field" placeholder="Contact Info" required onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} />
              <textarea className="input-field" placeholder="Specialties" required rows={3} onChange={e => setFormData({ ...formData, specialties: e.target.value })} />
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save & Approve Hospital</button>
            </form>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--bg-main)' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Hospital Name</th>
                <th style={{ padding: '1rem 1.5rem' }}>Location</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>{h.name}</td>
                  <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {h.location}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(h.name + ' ' + h.location)}`}
                      target="_blank" rel="noopener noreferrer"
                      title="View on Map"
                      style={{ color: 'var(--brand-primary)', opacity: 0.7 }}
                    >
                      <MapPin size={14} />
                    </a>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span className={`status-badge status-${h.status}`}>{h.status}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setSelectedHospital(h)}>
                      View Insights <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ManageDoctors' && (
        <div>
          {showVerifications ? (
            <div className="table-responsive">
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                <h3>Pending Verifications ({pendingDocs.length})</h3>
                <button onClick={() => setShowVerifications(false)} className="btn-secondary">Return to Doctors List</button>
              </div>
              {pendingDocs.length === 0 ? <p className="text-muted" style={{ padding: '2rem' }}>No doctors awaiting clearance.</p> : (
                <table style={{ width: '100%' }}>
                  <thead><tr style={{ textAlign: 'left', background: 'var(--bg-main)' }}><th style={{ padding: '1rem 1.5rem' }}>Doctor Profile</th><th style={{ padding: '1rem 1.5rem' }}>Expertise</th><th style={{ padding: '1rem 1.5rem' }}>Actions</th></tr></thead>
                  <tbody>
                    {pendingDocs.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Dr. {d.name}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>{d.specialization}</td>
                        <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleStatus(d.id, 'Approved')} className="btn-primary" style={{ padding: '0.4rem 0.8rem' }}>Approve</button>
                          <button onClick={() => handleStatus(d.id, 'Rejected')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Doctors Registry</h3>
                  <p className="text-muted">Global list of verified medical specialists.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', opacity: 0.5 }} />
                    <input className="input-field" placeholder="Search experts..." style={{ paddingLeft: '3rem', minWidth: '250px' }} value={dSearch} onChange={e => setDSearch(e.target.value)} />
                  </div>
                  <button onClick={() => setShowVerifications(true)} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                    Verifications ({pendingDocs.length})
                  </button>
                </div>
              </div>
              <table style={{ width: '100%' }}>
                <thead><tr style={{ textAlign: 'left', background: 'var(--bg-main)' }}><th style={{ padding: '1rem 1.5rem' }}>Doctor Profile</th><th style={{ padding: '1rem 1.5rem' }}>Associated Hospital</th><th style={{ padding: '1rem 1.5rem' }}>Rating</th></tr></thead>
                <tbody>
                  {filteredDoctors.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Dr. {d.name}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>{d.Hospital?.name}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}><Star size={14} fill="var(--warning)" color="var(--warning)"/> {d.rating || '5.0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'Users' && <AdminUserManagement hospitals={hospitals} />}
    </div>
  );
}

function AdminHospitalDetail({ hospital, onBack }) {
  const [docs, setDocs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ ...hospital });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getHospitalDetailedDocs(hospital.id),
      getHospitalDetailedStaff(hospital.id)
    ]).then(([d, s]) => {
      setDocs(d || []);
      setStaff(s || []);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [hospital.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateHospital(hospital.id, editForm);
    setEditMode(false);
    alert('Hospital documentation updated successfully.');
    window.location.reload(); 
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={onBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Return to Registry
        </button>
        <button onClick={() => setEditMode(!editMode)} className="btn-primary" style={{ background: editMode ? 'var(--danger)' : 'var(--brand-primary)' }}>
          {editMode ? 'Cancel Editing' : 'Edit Hospital Details'}
        </button>
      </div>

      {editMode ? (
        <form onSubmit={handleUpdate} className="card" style={{ marginBottom: '2.5rem', background: 'white', border: '2px solid var(--brand-primary)', padding: '2.5rem', display: 'grid', gap: '1rem' }}>
          <h3>Modify Hospital Profile</h3>
          <input className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Hospital Name" required />
          <input className="input-field" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Location" required />
          <input className="input-field" value={editForm.contactInfo} onChange={e => setEditForm({...editForm, contactInfo: e.target.value})} placeholder="Contact Details" required />
          <textarea className="input-field" value={editForm.specialties} onChange={e => setEditForm({...editForm, specialties: e.target.value})} placeholder="Specialties" rows={3} required />
          <button type="submit" className="btn-primary">Finalize Changes</button>
        </form>
      ) : (
        <div className="card" style={{ marginBottom: '2.5rem', background: 'white', borderLeft: '6px solid var(--brand-primary)', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{hospital.name}</h2>
              <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                <MapPin size={18} /> {hospital.location}
              </p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.name + ' ' + hospital.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}
              >
                <MapPin size={18} /> Get Directions on Maps
              </a>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`status-badge status-${hospital.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}>{hospital.status} Registry</span>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>Contact: {hospital.contactInfo}</p>
            </div>
          </div>
          <hr style={{ margin: '2rem 0', opacity: 0.1 }} />
          <p style={{ fontSize: '1.1rem' }}><strong>Service Expertise:</strong> {hospital.specialties}</p>
        </div>
      )}

      <div className="grid" style={{ gap: '2rem' }}>
        <div className="card" style={{ background: 'white', borderLeft: '6px solid var(--brand-primary)', padding: '2.5rem' }}>
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Hospital Doctors</h3>
          </div>
          {loading ? <p>Fetching doctors...</p> : (
            <div className="table-responsive" style={{ border: 'none', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'var(--bg-main)', textAlign: 'left' }}><th style={{ padding: '1rem' }}>Doctor</th><th style={{ padding: '1rem' }}>Expertise</th><th>Status</th></tr></thead>
                <tbody>
                  {docs.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>Dr. {d.name}</td>
                      <td style={{ padding: '1rem' }}>{d.specialization}</td>
                      <td><span className={`status-badge status-${d.status}`}>{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ background: 'white', borderLeft: '6px solid var(--brand-primary)', padding: '2.5rem' }}>
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Hospital Team</h3>
          </div>
          {loading ? <p>Fetching roster...</p> : (
            <div className="table-responsive" style={{ border: 'none', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'var(--bg-main)', textAlign: 'left' }}><th style={{ padding: '1rem' }}>Member</th><th style={{ padding: '1rem' }}>Identity</th></tr></thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{s.name}</td>
                      <td><span style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 700 }}>{s.role.replace('HospitalManager', 'Manager')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminUserManagement({ hospitals }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'HospitalManager', hospitalId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospitalId) return alert('Please specify a target hospital.');
    try {
      await adminCreateUser(formData);
      alert('Team member successfully provisioned and linked.');
    } catch(err) { alert(err.message); }
  };

  return (
    <div className="card" style={{ background: 'white', padding: '3rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Global Team Provisioning</h3>
      <p className="text-muted" style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>Deploy Hospital Managers and Medical Staff to any hospital in the Medy network.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem', maxWidth: '600px' }}>
        <div className="grid">
          <input className="input-field" placeholder="Full Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="input-field" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <input className="input-field" placeholder="Email (Unique identifier)" required onChange={e => setFormData({...formData, email: e.target.value})} />
        
        <label className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '-0.75rem', fontWeight: 700 }}>ASSIGN TO HOSPITAL</label>
        <select className="input-field" required onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
          <option value="">Select Hospital Profile</option>
          {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        
        <label className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '-0.75rem', fontWeight: 700 }}>SPECIFY ADMINISTRATIVE ROLE</label>
        <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="HospitalManager">Hospital Manager (Facility Leader)</option>
          <option value="Staff">Medical Staff (Operations)</option>
          <option value="Admin">Platform Admin (System-wide)</option>
        </select>
        
        <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', padding: '1rem' }}>Provision Account</button>
      </form>
    </div>
  );
}

function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('Doctors');
  const [doctors, setDoctors] = useState([]);
  const [team, setTeam] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialization: '', experienceYears: 0, fees: 0 });

  const loadDocs = () => getHospitalDoctors().then(setDoctors);
  const loadTeam = () => getHospitalTeam().then(setTeam);

  useEffect(() => { 
    loadDocs().catch(err => console.warn('Manager Doc error:', err.message)); 
    loadTeam().catch(err => console.warn('Manager Team error:', err.message)); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoctor(formData);
    setShowForm(false);
    loadDocs();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Exempt this doctor from your hospital?')) {
      await deleteDoctor(id);
      loadDocs();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <button className={activeTab === 'Doctors' ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab('Doctors')} style={{ padding: '0.6rem 1.5rem' }}>Doctors</button>
        <button className={activeTab === 'Team' ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab('Team')} style={{ padding: '0.6rem 1.5rem' }}>Staff Team</button>
      </div>

      {activeTab === 'Doctors' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'white', padding: '2.5rem', borderLeft: '6px solid var(--brand-primary)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div>
              <h3 style={{ fontSize: '1.75rem' }}>Hospital Doctors</h3>
              <p className="text-muted">Manage your hospital's internal medical roster.</p>
            </div>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Doctor</button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2.5rem', display: 'grid', gap: '1rem', border: '2px solid var(--brand-primary)', background: 'white' }}>
              <h4>Doctor Onboarding</h4>
              <input className="input-field" placeholder="Full Legal Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input className="input-field" placeholder="Medical Expertise" required onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
              <div className="grid">
                <input type="number" className="input-field" placeholder="Experience (Yrs)" required onChange={(e) => setFormData({...formData, experienceYears: e.target.value})} />
                <input type="number" className="input-field" placeholder="Consultation Fees ($)" required onChange={(e) => setFormData({...formData, fees: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Register Doctor</button>
            </form>
          )}

          <div className="grid">
            {doctors.map(d => (
              <div key={d.id} className="card" style={{ borderLeft: '6px solid var(--brand-primary)', position: 'relative', padding: '2.5rem' }}>
                <button 
                  onClick={() => handleDelete(d.id)} 
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  Delete
                </button>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DOCTOR NAME</label>
                    <h4 style={{ fontSize: '1.35rem', margin: '0.25rem 0' }}>Dr. {d.name}</h4>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SPECIALIST</label>
                    <p style={{ margin: '0.25rem 0', fontWeight: 600, color: 'var(--brand-primary)' }}>{d.specialization}</p>
                  </div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>FEES</label>
                      <p style={{ margin: '0.25rem 0', fontSize: '1.1rem', fontWeight: 800 }}>${d.fees}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>AUTHENTICATION</label>
                      <span className={`status-badge status-${d.status}`} style={{ margin: 0, padding: '0.5rem 1rem' }}>{d.status === 'Approved' ? 'VERIFIED' : d.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <TeamManagement team={team} loadTeam={loadTeam} />
      )}
    </div>
  );
}

function TeamManagement({ team, loadTeam }) {
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamData, setTeamData] = useState({ name: '', email: '', phone: '', role: 'Staff' });

  const handleAddMember = async (e) => {
    e.preventDefault();
    await addTeamMember(teamData);
    setShowTeamForm(false);
    loadTeam();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'white', padding: '2.5rem', borderLeft: '6px solid var(--brand-primary)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem' }}>Staff Roster</h3>
          <p className="text-muted">Monitor and manage your facility's operational team.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowTeamForm(!showTeamForm)}>+ Add Team Member</button>
      </div>

      {showTeamForm && (
        <form onSubmit={handleAddMember} className="card" style={{ marginBottom: '2.5rem', display: 'grid', gap: '1rem', border: '2px solid var(--brand-primary)', background: 'white' }}>
          <h4>Team Member Provisioning</h4>
          <input className="input-field" placeholder="Full Name" required onChange={e => setTeamData({...teamData, name: e.target.value})} />
          <input className="input-field" placeholder="Email ID" required onChange={e => setTeamData({...teamData, email: e.target.value})} />
          <input className="input-field" placeholder="Mobile Number" required onChange={e => setTeamData({...teamData, phone: e.target.value})} />
          <select className="input-field" onChange={e => setTeamData({...teamData, role: e.target.value})}>
            <option value="Staff">Operations Staff</option>
            <option value="HospitalManager">Lead Manager</option>
          </select>
          <button type="submit" className="btn-primary">Provision Identity</button>
        </form>
      )}

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', background: 'var(--bg-main)' }}><th style={{ padding: '1rem' }}>Name</th><th style={{ padding: '1rem' }}>Role</th><th style={{ padding: '1rem' }}>Contact</th></tr></thead>
          <tbody>
            {team.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem', fontWeight: 700 }}>{m.name}</td>
                <td style={{ padding: '1rem' }}><span className="status-badge" style={{ background: 'hsla(var(--brand-hue), 80%, 50%, 0.1)', color: 'var(--brand-primary)', fontWeight: 700 }}>{m.role}</span></td>
                <td style={{ padding: '1rem' }}><span className="text-muted">{m.phone} | {m.email}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('Roster');
  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [genData, setGenData] = useState({ doctorId: '', date: new Date().toISOString().split('T')[0] });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editForm, setEditForm] = useState({ workingHoursStart: '', workingHoursEnd: '', slotDurationMinutes: 15 });
  
  const load = async () => {
    getAppointments().then(setAppts);
    getHospitalDoctors().then(setDoctors); 
  };

  useEffect(() => { load().catch(err => console.warn('Dashboard sync error:', err.message)); }, []);

  const handleGenerate = async () => {
    if (!genData.doctorId) return alert('Kindly select a specialist.');
    try {
      await generateSlots(genData.doctorId, genData.date);
      alert('Dynamic slots provisioned successfully for ' + genData.date);
    } catch(err) { alert(err.message); }
  };

  const handleStatus = async (id, status) => {
    await updateAppointment(id, status);
    load();
  };

  const handleEditDoc = (doc) => {
    setSelectedDoc(doc);
    setEditForm({ 
      workingHoursStart: doc.workingHoursStart, 
      workingHoursEnd: doc.workingHoursEnd, 
      slotDurationMinutes: doc.slotDurationMinutes 
    });
  };

  const saveDocChanges = async () => {
    try {
      await editDoctor(selectedDoc.id, editForm);
      alert('Clinical matrix updated.');
      setSelectedDoc(null);
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <button className={activeTab === 'Roster' ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab('Roster')}>Daily Roster</button>
        <button className={activeTab === 'Schedules' ? "btn-primary" : "btn-secondary"} onClick={() => setActiveTab('Schedules')}>Doctor Schedules</button>
      </div>

      {activeTab === 'Roster' && (
        <>
          <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '2.5rem', borderLeft: '6px solid var(--brand-primary)' }}>
            <div>
              <h3 style={{ fontSize: '1.75rem' }}>Manage Slots</h3>
              <p className="text-muted">Create open timings for doctors.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select className="input-field" style={{ minWidth: '220px' }} onChange={e => setGenData({...genData, doctorId: e.target.value})}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
              </select>
              <input type="date" className="input-field" value={genData.date} onChange={e => setGenData({...genData, date: e.target.value})} />
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleGenerate}>
                <PlusCircle size={18} /> Generate Slots
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'white', padding: '2.5rem', borderLeft: '6px solid var(--brand-primary)' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
              <Users color="var(--brand-primary)" size={28}/>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Daily Patient Roster</h3>
            </div>
            
            {appts.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '16px' }}>
                <Users size={48} className="text-muted" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p className="text-muted">No clinical sessions registered for this hospital.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ border: 'none', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>Patient Identification</th>
                      <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Specialist</th>
                      <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Clinical Timing</th>
                      <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Status</th>
                      <th style={{ padding: '1rem', fontSize: '0.85rem', textAlign: 'right' }}>Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appts.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1.5rem', fontWeight: 800, fontSize: '1.1rem' }}>{a.Patient?.name}</td>
                        <td style={{ padding: '1.5rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>Dr. {a.Doctor?.name}</span>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(a.Slot?.date).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.Slot?.startTime}</div>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <span className={`status-badge status-${a.status}`} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>{a.status}</span>
                        </td>
                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            {a.status === 'Pending' && (
                              <>
                                <button className="btn-primary" onClick={() => handleStatus(a.id, 'Confirmed')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>Confirm</button>
                                <button className="btn-secondary" onClick={() => handleStatus(a.id, 'Rejected')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>Exempt</button>
                              </>
                            )}
                            {a.status === 'Confirmed' && (
                              <button 
                                className="btn-primary" 
                                onClick={() => handleStatus(a.id, 'Completed')} 
                                style={{ padding: '0.65rem 1.5rem', background: 'var(--success)', border: 'none', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                              >
                                Finalize Consultation
                              </button>
                            )}
                            {a.status === 'Completed' && (
                              <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={16}/> Session Finalized
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Schedules' && (
        <div>
          {selectedDoc && (
            <div className="card" style={{ marginBottom: '2.5rem', background: 'white', border: '2px solid var(--brand-primary)' }}>
              <h3>Update Timing for Dr. {selectedDoc.name}</h3>
              <div className="grid">
                <div>
                  <label className="text-muted" style={{ fontWeight: 700, fontSize: '0.85rem' }}>HOSPITAL START TIME</label>
                  <input type="time" className="input-field" value={editForm.workingHoursStart} onChange={e => setEditForm({...editForm, workingHoursStart: e.target.value})} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontWeight: 700, fontSize: '0.85rem' }}>HOSPITAL END TIME</label>
                  <input type="time" className="input-field" value={editForm.workingHoursEnd} onChange={e => setEditForm({...editForm, workingHoursEnd: e.target.value})} />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="text-muted" style={{ fontWeight: 700, fontSize: '0.85rem' }}>SLOT DURATION (MINUTES)</label>
                <input type="number" className="input-field" value={editForm.slotDurationMinutes} onChange={e => setEditForm({...editForm, slotDurationMinutes: e.target.value})} />
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" onClick={saveDocChanges}>Apply New Schedule</button>
                <button className="btn-secondary" onClick={() => setSelectedDoc(null)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="table-responsive">
             <div style={{ padding: '1.5rem 2.5rem', background: 'white' }}>
              <h3>Operational Roster</h3>
              <p className="text-muted">Manage clinical availability for doctors.</p>
            </div>
            <table style={{ width: '100%' }}>
              <thead><tr style={{ textAlign: 'left', background: 'var(--bg-main)' }}><th style={{ padding: '1rem 2.5rem' }}>Doctor Profile</th><th style={{ padding: '1rem' }}>Doctor Timing</th><th style={{ padding: '1rem' }}>Control</th></tr></thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1.25rem 2.5rem', fontWeight: 800 }}>Dr. {d.name}</td>
                    <td style={{ padding: '1rem' }}>{d.workingHoursStart} - {d.workingHoursEnd} ({d.slotDurationMinutes} min gaps)</td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn-secondary" onClick={() => handleEditDoc(d)}>Modify Timing</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const logoutButtonStates = {
  'default': {
    '--figure-duration': '100',
    '--transform-figure': 'none',
    '--walking-duration': '100',
    '--transform-arm1': 'none',
    '--transform-wrist1': 'none',
    '--transform-arm2': 'none',
    '--transform-wrist2': 'none',
    '--transform-leg1': 'none',
    '--transform-calf1': 'none',
    '--transform-leg2': 'none',
    '--transform-calf2': 'none'
  },
  'hover': {
    '--figure-duration': '100',
    '--transform-figure': 'translateX(1.5px)',
    '--walking-duration': '100',
    '--transform-arm1': 'rotate(-5deg)',
    '--transform-wrist1': 'rotate(-15deg)',
    '--transform-arm2': 'rotate(5deg)',
    '--transform-wrist2': 'rotate(6deg)',
    '--transform-leg1': 'rotate(-10deg)',
    '--transform-calf1': 'rotate(5deg)',
    '--transform-leg2': 'rotate(20deg)',
    '--transform-calf2': 'rotate(-20deg)'
  },
  'walking1': {
    '--figure-duration': '300',
    '--transform-figure': 'translateX(11px)',
    '--walking-duration': '300',
    '--transform-arm1': 'translateX(-4px) translateY(-2px) rotate(120deg)',
    '--transform-wrist1': 'rotate(-5deg)',
    '--transform-arm2': 'translateX(4px) rotate(-110deg)',
    '--transform-wrist2': 'rotate(-5deg)',
    '--transform-leg1': 'translateX(-3px) rotate(80deg)',
    '--transform-calf1': 'rotate(-30deg)',
    '--transform-leg2': 'translateX(4px) rotate(-60deg)',
    '--transform-calf2': 'rotate(20deg)'
  },
  'walking2': {
    '--figure-duration': '400',
    '--transform-figure': 'translateX(17px)',
    '--walking-duration': '300',
    '--transform-arm1': 'rotate(60deg)',
    '--transform-wrist1': 'rotate(-15deg)',
    '--transform-arm2': 'rotate(-45deg)',
    '--transform-wrist2': 'rotate(6deg)',
    '--transform-leg1': 'rotate(-5deg)',
    '--transform-calf1': 'rotate(10deg)',
    '--transform-leg2': 'rotate(10deg)',
    '--transform-calf2': 'rotate(-20deg)'
  },
  'falling1': {
    '--figure-duration': '1600',
    '--walking-duration': '400',
    '--transform-arm1': 'rotate(-60deg)',
    '--transform-wrist1': 'none',
    '--transform-arm2': 'rotate(30deg)',
    '--transform-wrist2': 'rotate(120deg)',
    '--transform-leg1': 'rotate(-30deg)',
    '--transform-calf1': 'rotate(-20deg)',
    '--transform-leg2': 'rotate(20deg)'
  },
  'falling2': {
    '--walking-duration': '300',
    '--transform-arm1': 'rotate(-100deg)',
    '--transform-arm2': 'rotate(-60deg)',
    '--transform-wrist2': 'rotate(60deg)',
    '--transform-leg1': 'rotate(80deg)',
    '--transform-calf1': 'rotate(20deg)',
    '--transform-leg2': 'rotate(-60deg)'
  },
  'falling3': {
    '--walking-duration': '500',
    '--transform-arm1': 'rotate(-30deg)',
    '--transform-wrist1': 'rotate(40deg)',
    '--transform-arm2': 'rotate(50deg)',
    '--transform-wrist2': 'none',
    '--transform-leg1': 'rotate(-30deg)',
    '--transform-leg2': 'rotate(20deg)',
    '--transform-calf2': 'none'
  }
};

function AnimatedLogoutButton({ onLogout }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    button.state = 'default';
    
    const updateButtonState = (state) => {
      if (logoutButtonStates[state]) {
        button.state = state;
        for (let key in logoutButtonStates[state]) {
          button.style.setProperty(key, logoutButtonStates[state][key]);
        }
      }
    };

    const handleMouseEnter = () => {
      if (button.state === 'default') updateButtonState('hover');
    };
    
    const handleMouseLeave = () => {
      if (button.state === 'hover') updateButtonState('default');
    };
    
    const handleClick = () => {
      if (button.state === 'default' || button.state === 'hover') {
        button.classList.add('clicked');
        updateButtonState('walking1');
        setTimeout(() => {
          button.classList.add('door-slammed');
          updateButtonState('walking2');
          setTimeout(() => {
            button.classList.add('falling');
            updateButtonState('falling1');
            setTimeout(() => {
              updateButtonState('falling2');
              setTimeout(() => {
                updateButtonState('falling3');
                setTimeout(() => {
                  button.classList.remove('clicked', 'door-slammed', 'falling');
                  updateButtonState('default');
                  if(onLogout) onLogout();
                }, 1000);
              }, parseInt(logoutButtonStates['falling2']['--walking-duration'], 10));
            }, parseInt(logoutButtonStates['falling1']['--walking-duration'], 10));
          }, parseInt(logoutButtonStates['walking2']['--figure-duration'], 10));
        }, parseInt(logoutButtonStates['walking1']['--figure-duration'], 10));
      }
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('click', handleClick);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('click', handleClick);
    };
  }, [onLogout]);

  return (
    <button ref={buttonRef} className="logoutButton logoutButton--light" style={{ width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
      <svg className="doorway" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
        <path className="bang" d="M40.5 43.7L26.6 31.4l-2.5 6.7zM41.9 50.4l-19.5-4-1.4 6.3zM40 57.4l-17.7 3.9 3.9 5.7z" />
      </svg>
      <svg className="figure" viewBox="0 0 100 100">
        <circle cx="52.1" cy="32.4" r="6.4" />
        <path d="M50.7 62.8c-1.2 2.5-3.6 5-7.2 4-3.2-.9-4.9-3.5-4-7.8.7-3.4 3.1-13.8 4.1-15.8 1.7-3.4 1.6-4.6 7-3.7 4.3.7 4.6 2.5 4.3 5.4-.4 3.7-2.8 15.1-4.2 17.9z" />
        <g className="arm1">
          <path d="M55.5 56.5l-6-9.5c-1-1.5-.6-3.5.9-4.4 1.5-1 3.7-1.1 4.6.4l6.1 10c1 1.5.3 3.5-1.1 4.4-1.5.9-3.5.5-4.5-.9z" />
          <path className="wrist1" d="M69.4 59.9L58.1 58c-1.7-.3-2.9-1.9-2.6-3.7.3-1.7 1.9-2.9 3.7-2.6l11.4 1.9c1.7.3 2.9 1.9 2.6 3.7-.4 1.7-2 2.9-3.8 2.6z" />
        </g>
        <g className="arm2">
          <path d="M34.2 43.6L45 40.3c1.7-.6 3.5.3 4 2 .6 1.7-.3 4-2 4.5l-10.8 2.8c-1.7.6-3.5-.3-4-2-.6-1.6.3-3.4 2-4z" />
          <path className="wrist2" d="M27.1 56.2L32 45.7c.7-1.6 2.6-2.3 4.2-1.6 1.6.7 2.3 2.6 1.6 4.2L33 58.8c-.7 1.6-2.6 2.3-4.2 1.6-1.7-.7-2.4-2.6-1.7-4.2z" />
        </g>
        <g className="leg1">
          <path d="M52.1 73.2s-7-5.7-7.9-6.5c-.9-.9-1.2-3.5-.1-4.9 1.1-1.4 3.8-1.9 5.2-.9l7.9 7c1.4 1.1 1.7 3.5.7 4.9-1.1 1.4-4.4 1.5-5.8.4z" />
          <path className="calf1" d="M52.6 84.4l-1-12.8c-.1-1.9 1.5-3.6 3.5-3.7 2-.1 3.7 1.4 3.8 3.4l1 12.8c.1 1.9-1.5 3.6-3.5 3.7-2 0-3.7-1.5-3.8-3.4z" />
        </g>
        <g className="leg2">
          <path d="M37.8 72.7s1.3-10.2 1.6-11.4 2.4-2.8 4.1-2.6c1.7.2 3.6 2.3 3.4 4l-1.8 11.1c-.2 1.7-1.7 3.3-3.4 3.1-1.8-.2-4.1-2.4-3.9-4.2z" />
          <path className="calf2" d="M29.5 82.3l9.6-10.9c1.3-1.4 3.6-1.5 5.1-.1 1.5 1.4.4 4.9-.9 6.3l-8.5 9.6c-1.3 1.4-3.6 1.5-5.1.1-1.4-1.3-1.5-3.5-.2-5z" />
        </g>
      </svg>
      <svg className="door" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
        <circle cx="66" cy="50" r="3.7" />
      </svg>
      <span className="button-text">Logout</span>
    </button>
  );
}

function UserMyBookings() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    myAppointments().then(data => {
      setAppointments(data || []);
      setLoading(false);
    }).catch(e => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderLeft: '4px solid var(--brand-primary)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>My Bookings</h3>
      {loading ? <p>Loading...</p> : (
        appointments.length === 0 ? <p className="text-muted">No appointments found.</p> : (
          <table style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)' }}>
                <th style={{ padding: '1rem' }}>Date & Time</th>
                <th style={{ padding: '1rem' }}>Doctor</th>
                <th style={{ padding: '1rem' }}>Hospital</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem' }}>{a.Slot?.date} at {a.Slot?.startTime}</td>
                  <td style={{ padding: '1rem' }}>Dr. {a.Slot?.Doctor?.name}</td>
                  <td style={{ padding: '1rem' }}>{a.Slot?.Doctor?.Hospital?.name}</td>
                  <td style={{ padding: '1rem' }}><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

function UserBookAppointmentView() {
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 1) {
      setLoading(true);
      getHospitalsForPatients().then(data => { setHospitals(data || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && selectedHospital) {
      setLoading(true);
      searchDoctors(specialization, selectedHospital.id).then(data => { setDoctors(data || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [step, selectedHospital, specialization]);

  useEffect(() => {
    if (step === 3 && selectedDoctor && date) {
      setLoading(true);
      getSlots(selectedDoctor.id, date).then(data => { setSlots(data || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [step, selectedDoctor, date]);

  const handleBook = async () => {
    try {
      setLoading(true);
      await bookAppointment(selectedSlot.id);
      alert('Appointment confirmed!');
      setStep(1); setSelectedHospital(null); setSelectedDoctor(null); setSelectedSlot(null);
    } catch(e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2.5rem', background: 'white', borderTop: '4px solid var(--brand-primary)' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, padding: '1rem', background: step === 1 ? 'var(--brand-primary)' : 'var(--bg-main)', color: step === 1 ? 'white' : 'var(--text-main)', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>1. Select Hospital</div>
        <div style={{ flex: 1, padding: '1rem', background: step === 2 ? 'var(--brand-primary)' : 'var(--bg-main)', color: step === 2 ? 'white' : 'var(--text-main)', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>2. Choose Doctor</div>
        <div style={{ flex: 1, padding: '1rem', background: step === 3 ? 'var(--brand-primary)' : 'var(--bg-main)', color: step === 3 ? 'white' : 'var(--text-main)', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>3. Select Time</div>
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Available Hospitals</h3>
          {loading ? <p>Loading hospitals...</p> : (
            <div className="grid">
              {hospitals.map(h => (
                <div key={h.id} className="card" style={{ padding: '1.5rem', cursor: 'pointer', border: '1px solid var(--border-light)' }} onClick={() => { setSelectedHospital(h); setStep(2); }}>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{h.name}</h4>
                  <p className="text-muted"><MapPin size={14} /> {h.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Doctors at {selectedHospital.name}</h3>
            <button onClick={() => setStep(1)} className="btn-secondary">Back to Hospitals</button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input className="input-field" placeholder="Search doctor by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 2, minWidth: '200px' }} />
            <select className="input-field" value={specialization} onChange={e => setSpecialization(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
              <option value="">All Specialties</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Pediatrician">Pediatrician</option>
            </select>
          </div>
          {loading ? <p>Loading doctors...</p> : (
            <div className="grid">
              {doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(d => (
                <div key={d.id} className="card" style={{ padding: '1.5rem', cursor: 'pointer', border: '1px solid var(--border-light)' }} onClick={() => { setSelectedDoctor(d); setStep(3); }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Dr. {d.name}</h4>
                  <p className="text-muted" style={{ fontWeight: 'bold', color: 'var(--brand-primary)' }}>{d.specialization}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Book with Dr. {selectedDoctor.name}</h3>
            <button onClick={() => setStep(2)} className="btn-secondary">Back to Doctors</button>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Date</label>
            <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth: '250px' }} />
          </div>
          <h4 style={{ marginBottom: '1rem' }}>Available Time Slots</h4>
          {loading ? <p>Loading slots...</p> : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {slots.length === 0 ? <p className="text-muted">No slots available for this date.</p> : slots.map(s => (
                <div key={s.id} onClick={() => s.isBooked ? null : setSelectedSlot(s)} style={{ padding: '1rem 1.5rem', background: selectedSlot?.id === s.id ? 'var(--brand-primary)' : (s.isBooked ? 'var(--bg-main)' : 'white'), color: selectedSlot?.id === s.id ? 'white' : (s.isBooked ? '#999' : 'var(--text-main)'), border: '1px solid var(--border-light)', borderRadius: '8px', cursor: s.isBooked ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                  {s.startTime}
                </div>
              ))}
            </div>
          )}
          {selectedSlot && (
            <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid var(--brand-primary)' }}>
              <h4>Confirm Appointment</h4>
              <p style={{ margin: '0.5rem 0 1.5rem' }}>You are booking an appointment with <strong>Dr. {selectedDoctor.name}</strong> on <strong>{date}</strong> at <strong>{selectedSlot.startTime}</strong>.</p>
              <button onClick={handleBook} disabled={loading} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
