import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, RefreshCw, Phone, Mail, Calendar, Tag } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  lead: 'badge-blue', 'consultation-scheduled': 'badge-purple',
  'proposal-sent': 'badge-yellow', booked: 'badge-green', completed: 'badge-gray',
};

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventType: '', status: 'lead' });

  const load = useCallback(async () => {
    try {
      const { clients } = await api.getClients();
      setClients(clients);
      if (selected) {
        const updated = clients.find((c: any) => c.id === selected.id);
        if (updated) setSelected(updated);
      }
    } finally {
      setLoading(false);
    }
  }, [selected?.id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    await api.addClientNote(selected.id, note.trim());
    setNote('');
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.updateClientStatus(id, status);
    load();
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await api.deleteClient(id);
    setSelected(null);
    load();
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addClient(form);
    setShowAdd(false);
    setForm({ name: '', email: '', phone: '', eventType: '', status: 'lead' });
    load();
  };

  if (loading) return <div className="empty">Loading clients…</div>;

  return (
    <>
      <div className="split-panel" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-title" style={{ fontSize: 14 }}>Clients <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({clients.length})</span></span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={13} /> Add</button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {clients.length === 0 && <div className="empty">No clients yet</div>}
            {clients.map(c => (
              <div
                key={c.id}
                className={`list-item ${selected?.id === c.id ? 'active' : ''}`}
                onClick={() => setSelected(c)}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 5 }}>{c.eventType} · {c.email}</div>
                <span className={`badge ${STATUS_BADGE[c.status] || 'badge-gray'}`}>{c.status?.replace(/-/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="card" style={{ overflowY: 'auto' }}>
          {selected ? (
            <>
              <div className="section-header">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{selected.name}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{selected.email}</span>
                    {selected.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{selected.phone}</span>}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteClient(selected.id)}>
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: Tag, label: 'Event Type', val: selected.eventType },
                  { icon: Calendar, label: 'Event Date', val: selected.eventDate },
                  { icon: Tag, label: 'Budget', val: selected.budget },
                  { icon: Calendar, label: 'Last Contact', val: selected.lastContact },
                ].filter(f => f.val).map(({ icon: Icon, label, val }) => (
                  <div key={label} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Icon size={11} color="var(--text3)" />
                      <span className="label" style={{ margin: 0 }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)' }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="label" style={{ marginBottom: 8 }}>Status</div>
                <select
                  className="input"
                  style={{ width: 'auto' }}
                  value={selected.status}
                  onChange={e => updateStatus(selected.id, e.target.value)}
                >
                  <option value="lead">Lead</option>
                  <option value="consultation-scheduled">Consultation Scheduled</option>
                  <option value="proposal-sent">Proposal Sent</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {selected.notes?.length > 0 && (
                <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 16 }}>
                  <div className="label" style={{ marginBottom: 8 }}>Notes</div>
                  {(Array.isArray(selected.notes) ? selected.notes : [selected.notes]).map((n: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text2)', paddingBottom: 6, borderBottom: i < selected.notes.length - 1 ? '1px solid var(--border)' : 'none', marginBottom: 6 }}>
                      {n}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note…"
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                />
                <button className="btn btn-primary" onClick={addNote}>Save</button>
              </div>
            </>
          ) : (
            <div className="empty" style={{ paddingTop: 80 }}>Select a client to view details</div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Add New Client</div>
            <form onSubmit={addClient}>
              {(['name', 'email', 'phone', 'eventType'] as const).map(field => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label className="label">{field === 'eventType' ? 'Event Type' : field}</label>
                  <input
                    className="input"
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    required={field === 'name' || field === 'email'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add Client</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
