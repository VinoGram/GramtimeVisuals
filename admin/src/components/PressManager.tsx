import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, RefreshCw, Newspaper, Award, Handshake, Pencil, Check, X } from 'lucide-react';

const TYPE_BADGE: Record<string, string> = {
  feature: 'badge-blue', award: 'badge-yellow', partner: 'badge-green',
};
const TYPE_ICON: Record<string, any> = {
  feature: Newspaper, award: Award, partner: Handshake,
};

export default function PressManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'feature' | 'award' | 'partner'>('all');
  const [form, setForm] = useState({ type: 'feature', name: '', year: '', note: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const load = useCallback(async () => {
    try {
      const { pressItems } = await api.getPress();
      setItems(pressItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addPress(form);
    setShowAdd(false);
    setForm({ type: 'feature', name: '', year: '', note: '' });
    load();
  };

  const startEdit = (item: any) => {
    setEditing(item.id);
    setEditForm({ type: item.type, name: item.name, year: item.year || '', note: item.note || '' });
  };

  const saveEdit = async (id: string) => {
    await api.updatePress(id, editForm);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this item?')) return;
    await api.deletePress(id);
    load();
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  if (loading) return <div className="empty">Loading press items…</div>;

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title">Press & Recognition</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={13} /> Add Item</button>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
          {(['all', 'feature', 'award', 'partner'] as const).map(t => (
            <button
              key={t} onClick={() => setFilter(t)} className="btn btn-sm"
              style={{
                background: filter === t ? 'var(--accent-dim)' : 'var(--surface2)',
                color: filter === t ? 'var(--accent)' : 'var(--text3)',
                border: filter === t ? '1px solid var(--accent-border)' : '1px solid var(--border2)',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span style={{ marginLeft: 4, opacity: 0.6 }}>
                ({t === 'all' ? items.length : items.filter(i => i.type === t).length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty">No items in this category</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Type</th><th>Name</th><th>Year</th><th>Note</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const Icon = TYPE_ICON[item.type] || Newspaper;
                  const isEditing = editing === item.id;
                  return (
                    <tr key={item.id}>
                      <td>
                        {isEditing ? (
                          <select className="input" style={{ padding: '4px 8px', fontSize: 12 }} value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                            <option value="feature">Feature</option>
                            <option value="award">Award</option>
                            <option value="partner">Partner</option>
                          </select>
                        ) : (
                          <span className={`badge ${TYPE_BADGE[item.type] || 'badge-gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Icon size={10} />{item.type}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                        {isEditing
                          ? <input className="input" style={{ padding: '4px 8px', fontSize: 13 }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                          : item.name}
                      </td>
                      <td>
                        {isEditing
                          ? <input className="input" style={{ padding: '4px 8px', fontSize: 13, width: 80 }} value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} placeholder="2024" />
                          : (item.year || '—')}
                      </td>
                      <td style={{ color: 'var(--text3)' }}>
                        {isEditing
                          ? <input className="input" style={{ padding: '4px 8px', fontSize: 13 }} value={editForm.note} onChange={e => setEditForm({ ...editForm, note: e.target.value })} />
                          : (item.note || '—')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item.id)}><Check size={12} /></button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={12} /></button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(item)}><Pencil size={12} /></button>
                              <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}><Trash2 size={12} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Add Press Item</div>
            <form onSubmit={add}>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="feature">Press Feature</option>
                  <option value="award">Award</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Publication / Award / Partner name" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Year</label>
                <input className="input" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2024" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Note</label>
                <input className="input" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Brief description" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
