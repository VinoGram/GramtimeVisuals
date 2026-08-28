import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Zap, Sparkles, Image as ImageIcon, RefreshCw, Eye, EyeOff, Trash2, Upload, Mail, Users } from 'lucide-react';

type Mode = 'weekly' | 'festive' | 'flyer' | 'newsletter' | null;

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [flyerTitle, setFlyerTitle] = useState('');
  const [weekly, setWeekly] = useState({ offerTitle: '', offerDescription: '', validUntil: '', clientFilter: { status: 'all' } });
  const [festive, setFestive] = useState({ festivalName: '', packageTitle: '', packageDescription: '', discount: '', deadline: '', clientFilter: { status: 'all' } });
  const [newsletter, setNewsletter] = useState({ subject: '', body: '', frequency: 'weekly' });

  const load = useCallback(async () => {
    try {
      const [{ campaigns }, { subscribers }] = await Promise.all([api.getCampaigns(), api.getNewsletterSubscribers()]);
      setCampaigns(campaigns);
      setSubscribers(subscribers);
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const sendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await api.sendNewsletter(newsletter); setMode(null); load(); }
    catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const removeSubscriber = async (id: string) => {
    await api.deleteNewsletterSubscriber(id);
    load();
  };

  const sendWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await api.sendWeeklyOffer(weekly); setMode(null); load(); }
    catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const sendFestive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await api.sendFestiveCampaign(festive); setMode(null); load(); }
    catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const uploadFlyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return alert('Please select a flyer image');
    setLoading(true);
    try {
      await api.uploadCampaignFlyer(flyerTitle, file);
      setMode(null);
      setFlyerTitle('');
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await api.deleteCampaign(id);
    load();
  };

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title">Campaigns</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent)', borderColor: 'rgba(74,222,128,0.3)' }} onClick={() => setMode('newsletter')}>
              <Mail size={13} /> Newsletter ({subscribers.length})
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--blue)', borderColor: 'rgba(96,165,250,0.3)' }} onClick={() => setMode('weekly')}>
              <Zap size={13} /> Weekly Offer
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--purple)', borderColor: 'rgba(167,139,250,0.3)' }} onClick={() => setMode('festive')}>
              <Sparkles size={13} /> Festive
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setMode('flyer')}>
              <ImageIcon size={13} /> Upload Flyer
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="empty">No campaigns yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Subject / Flyer</th><th>Status</th><th>Show on Site</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td>{new Date(c.sent_at || c.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-blue">{(c.campaign_type || '').replace('_', ' ')}</span></td>
                    <td style={{ color: 'var(--text)' }}>
                      {c.flyerUrl
                        ? <img src={c.flyerUrl} alt={c.title} style={{ height: 48, borderRadius: 6, objectFit: 'cover' }} />
                        : (c.subject || c.offerTitle || '—')}
                    </td>
                    <td><span className={`badge ${c.status === 'sent' ? 'badge-green' : 'badge-red'}`}>{c.status || 'sent'}</span></td>
                    <td>
                      <button
                        className={`btn btn-sm ${c.active ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={async () => { await api.toggleCampaignActive(c.id, !c.active); load(); }}
                        title={c.active ? 'Visible on Experience page' : 'Hidden from site'}
                      >
                        {c.active ? <Eye size={13} /> : <EyeOff size={13} />}
                        {c.active ? 'Live' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mode && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMode(null)}>
          <div className="modal">

            {/* ── Newsletter ── */}
            {mode === 'newsletter' && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} color="var(--accent)" /> Newsletter Subscribers
                </div>

                {/* Subscriber list */}
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 20, border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  {subscribers.length === 0 ? (
                    <div style={{ padding: 16, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No subscribers yet</div>
                  ) : subscribers.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{s.email}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => removeSubscriber(s.id)}><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>

                {/* Compose */}
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={13} /> Compose Mail to {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
                </div>
                <form onSubmit={sendNewsletter}>
                  <div style={{ marginBottom: 14 }}>
                    <label className="label">Frequency</label>
                    <select className="input" value={newsletter.frequency} onChange={e => setNewsletter({ ...newsletter, frequency: e.target.value })}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label className="label">Subject</label>
                    <input className="input" value={newsletter.subject} onChange={e => setNewsletter({ ...newsletter, subject: e.target.value })} placeholder="e.g. This week from Gramtime Visuals" required />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Body</label>
                    <textarea className="input" rows={5} style={{ resize: 'vertical' }} value={newsletter.body} onChange={e => setNewsletter({ ...newsletter, body: e.target.value })} placeholder="Write your newsletter content here…" required />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading || subscribers.length === 0}>
                      {loading ? 'Sending…' : `Send to ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}`}
                    </button>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode(null)}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Flyer upload ── */}
            {mode === 'flyer' && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Upload size={16} color="var(--accent)" /> Upload Flyer Campaign
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
                  The flyer will scroll across the Experience section on the main site when set to Live.
                </p>
                <form onSubmit={uploadFlyer}>
                  <div style={{ marginBottom: 14 }}>
                    <label className="label">Campaign Title</label>
                    <input className="input" value={flyerTitle} onChange={e => setFlyerTitle(e.target.value)} placeholder="e.g. Christmas Special 2024" required />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Flyer Image *</label>
                    <input ref={fileRef} type="file" accept="image/*" required
                      style={{ width: '100%', padding: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>{loading ? 'Uploading…' : 'Upload & Go Live'}</button>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode(null)}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Weekly offer ── */}
            {mode === 'weekly' && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color="var(--blue)" /> Weekly Offer
                </div>
                <form onSubmit={sendWeekly}>
                  {[
                    { key: 'offerTitle', label: 'Offer Title' },
                    { key: 'offerDescription', label: 'Description', textarea: true },
                    { key: 'validUntil', label: 'Valid Until' },
                  ].map(({ key, label, textarea }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label className="label">{label}</label>
                      {textarea
                        ? <textarea className="input" rows={3} style={{ resize: 'none' }} value={(weekly as any)[key]} onChange={e => setWeekly({ ...weekly, [key]: e.target.value })} required />
                        : <input className="input" value={(weekly as any)[key]} onChange={e => setWeekly({ ...weekly, [key]: e.target.value })} required />
                      }
                    </div>
                  ))}
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Send To</label>
                    <select className="input" value={weekly.clientFilter.status} onChange={e => setWeekly({ ...weekly, clientFilter: { status: e.target.value } })}>
                      <option value="all">All Clients</option>
                      <option value="lead">Leads</option>
                      <option value="booked">Booked</option>
                      <option value="completed">Past Clients</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode(null)}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Festive campaign ── */}
            {mode === 'festive' && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="var(--purple)" /> Festive Campaign
                </div>
                <form onSubmit={sendFestive}>
                  {[
                    { key: 'festivalName', label: 'Festival Name' },
                    { key: 'packageTitle', label: 'Package Title' },
                    { key: 'discount', label: 'Discount' },
                    { key: 'deadline', label: 'Deadline' },
                    { key: 'packageDescription', label: 'Description', textarea: true },
                  ].map(({ key, label, textarea }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label className="label">{label}</label>
                      {textarea
                        ? <textarea className="input" rows={3} style={{ resize: 'none' }} value={(festive as any)[key]} onChange={e => setFestive({ ...festive, [key]: e.target.value })} required />
                        : <input className="input" value={(festive as any)[key]} onChange={e => setFestive({ ...festive, [key]: e.target.value })} required />
                      }
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode(null)}>Cancel</button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
