import { useState, useEffect, useRef } from 'react';
import { clearToken } from '../services/api';
import BookingManager from '../components/BookingManager';
import Consultations from '../components/Consultations';
import Clients from '../components/Clients';
import Galleries from '../components/Galleries';
import ContactInquiries from '../components/ContactInquiries';
import Campaigns from '../components/Campaigns';
import PressManager from '../components/PressManager';
import PortfolioManager from '../components/PortfolioManager';
import BlogManager from '../components/BlogManager';
import MonthlyReview from '../components/MonthlyReview';
import {
  CalendarCheck, MessageSquare, Users, Image, Mail, Megaphone, Trophy,
  LayoutGrid, BookOpen, LogOut, Activity, ChevronRight, Menu, X, TrendingUp,
} from 'lucide-react';

const TABS = [
  { id: 'bookings',      label: 'Bookings',        icon: CalendarCheck },
  { id: 'monthly',       label: 'Monthly Review',  icon: TrendingUp },
  { id: 'consultations', label: 'Consultations',   icon: MessageSquare },
  { id: 'clients',       label: 'CRM',             icon: Users },
  { id: 'galleries',     label: 'Galleries',       icon: Image },
  { id: 'portfolio',     label: 'Portfolio',       icon: LayoutGrid },
  { id: 'blog',          label: 'Journal',         icon: BookOpen },
  { id: 'contact',       label: 'Contact',         icon: Mail },
  { id: 'campaigns',     label: 'Campaigns',       icon: Megaphone },
  { id: 'press',         label: 'Press',           icon: Trophy },
];

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState('bookings');
  const [online, setOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const check = () => setOnline(navigator.onLine);
    window.addEventListener('online', check);
    window.addEventListener('offline', check);
    return () => { window.removeEventListener('online', check); window.removeEventListener('offline', check); };
  }, []);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarOpen]);

  const logout = () => { clearToken(); onLogout(); };
  const activeTab = TABS.find(t => t.id === tab)!;

  const handleTabClick = (id: string) => {
    setTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-root">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 3 }}>
            GRAMTIME VISUALS
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Admin Panel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div className="pulse" style={{ background: online ? 'var(--accent)' : 'var(--red)' }} />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{online ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`nav-btn ${active ? 'nav-btn-active' : ''}`}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                {active && <ChevronRight size={13} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard-main">
        {/* Top bar */}
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <activeTab.icon size={16} color="var(--accent)" strokeWidth={2.5} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{activeTab.label}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} color="var(--text3)" />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Real-time</span>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          {tab === 'bookings'      && <BookingManager />}
          {tab === 'monthly'       && <MonthlyReview />}
          {tab === 'consultations' && <Consultations />}
          {tab === 'clients'       && <Clients />}
          {tab === 'galleries'     && <Galleries />}
          {tab === 'portfolio'     && <PortfolioManager />}
          {tab === 'blog'          && <BlogManager />}
          {tab === 'contact'       && <ContactInquiries />}
          {tab === 'campaigns'     && <Campaigns />}
          {tab === 'press'         && <PressManager />}
        </div>
      </main>
    </div>
  );
}
