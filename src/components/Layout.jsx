import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, Hospital, Calendar, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

export function Layout({ children, user, onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Hospitals', path: '/dashboard', icon: Hospital });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ width: isOpen ? '280px' : '80px', background: 'white', borderRight: '1px solid var(--border-light)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ background: 'var(--brand-primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 900 }}>M</span>
          </div>
          {isOpen && <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-bold)' }}>Medy.</span>}
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '12px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s' }}>
              <item.icon size={20} />
              {isOpen && <span style={{ fontWeight: 600 }}>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1.5rem 0.75rem', borderTop: '1px solid var(--border-light)' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '12px', color: 'var(--danger)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>
            <LogOut size={20} />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ height: '80px', background: 'white', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <button onClick={() => setIsOpen(!isOpen)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-bold)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>{user?.role}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
