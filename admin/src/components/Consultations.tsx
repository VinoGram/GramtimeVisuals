import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Trash2, RefreshCw } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-yellow', confirmed: 'badge-green',
  completed: 'badge-gray', cancelled: 'badge-red',
};

export default function Consultations() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { consultations } = await api.getConsultations();
      setItems(consultations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.updateConsultationStatus(id, status);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this consultation?')) return;
    await api.deleteConsultation(id);
    load();
  };

  if (loading) return <div className="empty">Loading consultations…</div>;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="section-title">Consultations <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({items.length})</span></span>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
      </div>
      {items.length === 0 ? (
        <div className="empty">No consultations yet</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Event</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{c.name || c.fullName || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.eventType || c.niche || '—'}</td>
                  <td>{c.eventDate || new Date(c.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${STATUS_BADGE[c.status] || 'badge-gray'}`}>{c.status || 'pending'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        className="input"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                        value={c.status || 'pending'}
                        onChange={e => updateStatus(c.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
