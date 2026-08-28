import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { RefreshCw, TrendingUp, Calendar, Package, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isLastDayOfMonth() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getMonth() !== now.getMonth();
}

function StatCard({ icon: Icon, label, value, color = 'var(--accent)' }: { icon: any; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  );
}

export default function MonthlyReview() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showBanner, setShowBanner] = useState(isLastDayOfMonth());

  const load = useCallback(async () => {
    try {
      const { bookings } = await api.getBookings();
      setBookings(bookings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  // Filter bookings for selected month/year
  const monthBookings = bookings.filter(b => {
    const d = new Date(b.createdAt || b.eventDate);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const confirmed  = monthBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const pending    = monthBookings.filter(b => b.status === 'pending');
  const cancelled  = monthBookings.filter(b => b.status === 'cancelled');

  // Group by niche/package
  const byNiche: Record<string, number> = {};
  monthBookings.forEach(b => {
    const key = b.niche || b.eventType || 'Other';
    byNiche[key] = (byNiche[key] || 0) + 1;
  });

  // Available months from booking data
  const years = Array.from(new Set(bookings.map(b => new Date(b.createdAt || b.eventDate).getFullYear()))).sort((a, b) => b - a);
  if (!years.includes(selectedYear)) years.unshift(selectedYear);

  return (
    <div>
      {/* Last-day-of-month banner */}
      {showBanner && (
        <div style={{ background: 'var(--accent)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={16} color="#000" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
              It's the last day of {MONTHS[new Date().getMonth()]} — here's your monthly review!
            </span>
          </div>
          <button onClick={() => setShowBanner(false)} style={{ background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#000', cursor: 'pointer' }}>Dismiss</button>
        </div>
      )}

      {/* Month selector */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Calendar size={15} color="var(--accent)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Reviewing:</span>
        <select className="input" style={{ width: 'auto' }} value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: 'auto' }}><RefreshCw size={12} /></button>
      </div>

      {loading ? (
        <div className="empty">Loading…</div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard icon={Users}        label="Total Bookings"  value={monthBookings.length} />
            <StatCard icon={CheckCircle}  label="Confirmed"       value={confirmed.length}  color="var(--accent)" />
            <StatCard icon={Clock}        label="Pending"         value={pending.length}    color="var(--yellow)" />
            <StatCard icon={XCircle}      label="Cancelled"       value={cancelled.length}  color="var(--red)" />
          </div>

          {/* Breakdown by niche */}
          {Object.keys(byNiche).length > 0 && (
            <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Bookings by Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(byNiche).sort((a, b) => b[1] - a[1]).map(([niche, count]) => (
                  <div key={niche} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', minWidth: 140 }}>{niche}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / monthBookings.length) * 100}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 24, textAlign: 'right' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={14} color="var(--accent)" />
              <span className="section-title" style={{ fontSize: 13 }}>
                {MONTHS[selectedMonth]} {selectedYear} — All Bookings ({monthBookings.length})
              </span>
            </div>
            {monthBookings.length === 0 ? (
              <div className="empty">No bookings for this month</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Client</th><th>Package</th><th>Type</th><th>Event Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {monthBookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{b.fullName || b.name || '—'}</td>
                        <td style={{ color: 'var(--text2)' }}>{b.packageName || '—'}</td>
                        <td><span className="badge badge-blue">{b.niche || b.eventType || '—'}</span></td>
                        <td style={{ color: 'var(--text3)', fontSize: 12 }}>{b.eventDate || '—'}</td>
                        <td>
                          <span className={`badge ${b.status === 'confirmed' || b.status === 'completed' ? 'badge-green' : b.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                            {b.status || 'pending'}
                          </span>
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
    </div>
  );
}
