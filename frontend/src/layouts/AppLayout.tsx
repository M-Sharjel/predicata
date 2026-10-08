import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, LogOut, Menu, Moon, MoreHorizontal, Sun, User, X } from 'lucide-react';
import { bottomNav, mainNav, systemNav } from './nav';
import { Dropdown } from '../components/Overlays';
import { SearchInput } from '../components/Inputs';
import { useSession } from '../utils/session';
import { notifications } from '../data/mockNotifications';

function Brand({ light = true }: { light?: boolean }) {
  return (
    <Link to="/dashboard" className="brand" aria-label="PREDICTA home" style={{ color: light ? '#fff' : 'inherit' }}>
      <span className="brand-mark"><Activity size={20} color="#fff" aria-hidden /></span>
      <span>
        <span className="brand-name" style={{ display: 'block' }}>PREDICTA</span>
        <span className="brand-sub">AI Infrastructure Intelligence</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <nav className="nav" aria-label="Main">
        {mainNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="nav-link" onClick={onNavigate}>
            <Icon size={18} aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-section" id="nav-system">System</div>
      <nav className="nav" aria-labelledby="nav-system">
        {systemNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="nav-link" onClick={onNavigate}>
            <Icon size={18} aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function EnvBox() {
  return (
    <div className="env-box">
      <div className="env-title"><span className="dot pulse" aria-hidden /> DEMO ENVIRONMENT</div>
      <div className="env-sub">Kubernetes cluster connected</div>
      <div className="env-sub" style={{ fontSize: 11, opacity: 0.7 }}>Simulated data</div>
    </div>
  );
}

export default function AppLayout() {
  const [drawer, setDrawer] = useState(false);
  const { theme, setTheme, logout } = useSession();
  const nav = useNavigate();
  const loc = useLocation();
  const unread = notifications.filter((n) => !n.read).length;
  const [q, setQ] = useState('');

  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => {
    if (!drawer) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [drawer]);

  const dark = document.documentElement.dataset.theme === 'dark';

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className="sidebar" aria-label="Primary">
        <Brand />
        <NavLinks />
        <div className="sidebar-spacer" />
        <EnvBox />
      </aside>

      {/* Mobile/tablet navigation drawer */}
      {drawer && (
        <>
          <div className="drawer-scrim" onClick={() => setDrawer(false)} />
          <div className="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="row between" style={{ flexWrap: 'nowrap' }}>
              <Brand />
              <button className="btn btn-ghost btn-icon" style={{ color: '#fff' }} aria-label="Close menu" onClick={() => setDrawer(false)}><X size={20} /></button>
            </div>
            <NavLinks onNavigate={() => setDrawer(false)} />
            <div className="nav-section">Account</div>
            <nav className="nav" aria-label="Account">
              <NavLink to="/notifications" className="nav-link"><Bell size={18} aria-hidden /> Notifications {unread > 0 && <span className="badge-count">{unread}</span>}</NavLink>
              <NavLink to="/profile" className="nav-link"><User size={18} aria-hidden /> Profile</NavLink>
              <button className="nav-link" style={{ background: 'none', border: 0, textAlign: 'left' }} onClick={() => { logout(); nav('/login'); }}><LogOut size={18} aria-hidden /> Sign out</button>
            </nav>
            <div className="sidebar-spacer" />
            <EnvBox />
          </div>
        </>
      )}

      <div className="main">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon menu-btn" aria-label="Open menu" onClick={() => setDrawer(true)}><Menu size={20} /></button>
          <Link to="/dashboard" className="mobile-brand" style={{ color: 'var(--text)' }} aria-label="PREDICTA home">
            <span className="brand-mark" style={{ width: 28, height: 28 }}><Activity size={16} color="#fff" aria-hidden /></span>
            PREDICTA
          </Link>
          <div className="grow row" style={{ flexWrap: 'nowrap' }}>
            <div className="search-global">
              <form role="search" onSubmit={(e) => { e.preventDefault(); nav(`/incidents?q=${encodeURIComponent(q)}`); }}>
                <SearchInput value={q} onChange={setQ} placeholder="Search incidents… (press Enter)" label="Global search" />
              </form>
            </div>
          </div>
          <span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
            <button className="btn btn-ghost btn-icon" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setTheme(dark ? 'light' : 'dark')}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/notifications" className="btn btn-ghost btn-icon icon-btn" aria-label={`Notifications, ${unread} unread`}>
              <Bell size={18} />{unread > 0 && <span className="pip">{unread}</span>}
            </Link>
            <Dropdown
              trigger={({ toggle, open }) => (
                <button className="btn btn-ghost btn-icon" aria-label="Account menu" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
                  <span className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>SA</span>
                </button>
              )}
            >
              {(close) => (
                <div role="menu">
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 650 }}>Sharjeel A.</div>
                    <div className="muted" style={{ fontSize: 12 }}>Administrator (demo)</div>
                  </div>
                  <div className="menu-sep" />
                  <button role="menuitem" className="menu-item" onClick={() => { close(); nav('/profile'); }}><User size={16} /> Profile</button>
                  <button role="menuitem" className="menu-item" onClick={() => { close(); nav('/settings'); }}>Settings</button>
                  <div className="menu-sep" />
                  <button role="menuitem" className="menu-item danger" onClick={() => { close(); logout(); nav('/login'); }}><LogOut size={16} /> Sign out</button>
                </div>
              )}
            </Dropdown>
          </span>
        </header>

        <main id="main" className="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bottomnav" aria-label="Quick navigation">
        {bottomNav.map(({ to, label, short, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={20} aria-hidden /> <span className="truncate" style={{ maxWidth: '100%' }}>{short ?? label.replace(' Actions', '')}</span>
          </NavLink>
        ))}
        <button onClick={() => setDrawer(true)} aria-label="More navigation options"><MoreHorizontal size={20} aria-hidden /> More</button>
      </nav>
    </div>
  );
}
