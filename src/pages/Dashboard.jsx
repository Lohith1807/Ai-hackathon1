import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  myAppointments, getPendingDoctors, updateDoctorStatus, addDoctor, 
  getHospitalDoctors, generateSlots, getAppointments, updateAppointment, 
  addHospital, getHospitals, getAllApprovedDoctors, getHospitalDetailedDocs, 
  getHospitalDetailedStaff, adminCreateUser, addTeamMember, getHospitalTeam,
  deleteDoctor, updateHospital, updateProfile, editDoctor
} from '../api';
import { 
  User as UserIcon, Calendar, CheckSquare, PlusCircle, LayoutDashboard, 
  Clock, LogOut, Activity, Star, MapPin, Search, ChevronRight, ArrowLeft, Users,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard({ user }) {
  const [adminTab, setAdminTab] = useState('Profile');
  const navigate = useNavigate();

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
      <div className="sidebar">
        <h3>{user.role} Portal</h3>
        <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={16} /> {user?.name || 'User'}
        </p>
        <hr />
        <ul>
          {user.role === 'Admin' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => setAdminTab('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'Overview' ? 'active' : ''} onClick={() => setAdminTab('Overview')}><LayoutDashboard size={18} /> Overview</li>
              <li className={adminTab === 'Hospitals' ? 'active' : ''} onClick={() => setAdminTab('Hospitals')}><Activity size={18} /> Hospitals</li>
              <li className={adminTab === 'ManageDoctors' ? 'active' : ''} onClick={() => setAdminTab('ManageDoctors')}><CheckSquare size={18} /> Manage Doctors</li>
              <li className={adminTab === 'Users' ? 'active' : ''} onClick={() => setAdminTab('Users')}><PlusCircle size={18} /> User Management</li>
            </>
          )}
          {user.role === 'User' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => setAdminTab('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'MyBookings' ? 'active' : ''} onClick={() => setAdminTab('MyBookings')}><Calendar size={18} /> My Bookings</li>
            </>
          )}
          {user.role === 'HospitalManager' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => setAdminTab('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'ManagerDocs' ? 'active' : ''} onClick={() => setAdminTab('ManagerDocs')}><PlusCircle size={18} /> Hospital Doctors</li>
            </>
          )}
          {user.role === 'Staff' && (
            <>
              <li className={adminTab === 'Profile' ? 'active' : ''} onClick={() => setAdminTab('Profile')}><UserIcon size={18} /> Profile</li>
              <li className={adminTab === 'StaffAppts' ? 'active' : ''} onClick={() => setAdminTab('StaffAppts')}><Calendar size={18} /> Manage Appointments</li>
            </>
          )}
        </ul>
      </div>
      <div className="main-content">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Welcome back, {user?.name ? (user.name.startsWith('Dr.') ? user.name.split(' ').slice(0, 2).join(' ') : user.name.split(' ')[0]) : 'User'}!
        </h2>
        
        {adminTab === 'Profile' && <ProfileView user={user} />}
        {adminTab !== 'Profile' && (
          <>
            {user.role === 'User' && <UserDashboard />}
            {user.role === 'Admin' && <AdminDashboard activeTab={adminTab} />}
            {user.role === 'HospitalManager' && <ManagerDashboard />}
            {user.role === 'Staff' && <StaffDashboard />}
          </>
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
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--brand-primary)', padding: '2rem' }}>
            <h4 className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>TOTAL HOSPITALS</h4>
            <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{hospitals.length}</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--success)', padding: '2rem' }}>
            <h4 className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>ACTIVE DOCTORS</h4>
            <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{approvedDocs.length}</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--warning)', padding: '2rem' }}>
            <h4 className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>PENDING VERIFICATIONS</h4>
            <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{pendingDocs.length}</p>
          </div>
        </div>
      )}

      {activeTab === 'Hospitals' && (
        <div className="table-wrapper">
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
            <div className="table-wrapper">
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
            <div className="table-wrapper">
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

      <div className="grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)', gap: '2rem' }}>
        <div className="card" style={{ background: 'white', borderLeft: '6px solid var(--brand-primary)', padding: '2.5rem' }}>
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Hospital Doctors</h3>
          </div>
          {loading ? <p>Fetching doctors...</p> : (
            <div className="table-wrapper" style={{ border: 'none', padding: 0 }}>
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
            <div className="table-wrapper" style={{ border: 'none', padding: 0 }}>
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

      <div className="table-wrapper">
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
              <div className="table-wrapper" style={{ border: 'none', padding: 0 }}>
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
          <div className="table-wrapper">
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
