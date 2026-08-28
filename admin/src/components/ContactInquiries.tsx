import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { RefreshCw, Send, Mail, Phone, Calendar } from 'lucide-react';

export default function ContactInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);

  const load = useCallback(async () => {
    try {
      const { inquiries } = await api.getInquiries();
      setInquiries(inquiries);
      if (selected) {
        const updated = inquiries.find((i: any) => i.id === selected.id);
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

  const reply = async (inquiry: any) => {
    setReplying(true);
    try {
      await api.sendEmail({
        to: inquiry.email,
        subject: `Re: Your inquiry — Gramtime Visuals`,
        body: `Hi ${inquiry.name},\n\nThank you for reaching out. We'll be in touch shortly.\n\nGramtime Visuals`,
      });
      alert(`Reply sent to ${inquiry.email}`);
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <div className="empty">Loading inquiries…</div>;

  return (
    <div className="split-panel" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title" style={{ fontSize: 14 }}>Inquiries <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({inquiries.length})</span></span>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {inquiries.length === 0 && <div className="empty">No inquiries yet</div>}
          {inquiries.map(i => (
            <div
              key={i.id}
              className={`list-item ${selected?.id === i.id ? 'active' : ''}`}
              onClick={() => setSelected(i)}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{i.name || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>{i.sessionType || 'General'}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(i.createdAt).toLocaleDateString()}</div>
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
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{selected.name}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{selected.email}</span>
                  {selected.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{selected.phone}</span>}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => reply(selected)} disabled={replying}>
                <Send size={13} />{replying ? 'Sending…' : 'Reply'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: Mail, label: 'Session Type', val: selected.sessionType },
                { icon: Calendar, label: 'Submitted', val: new Date(selected.createdAt).toLocaleString() },
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

            {selected.message && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Message</div>
                <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 16, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                  {selected.message}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty" style={{ paddingTop: 80 }}>Select an inquiry to view details</div>
        )}
      </div>
    </div>
  );
}
