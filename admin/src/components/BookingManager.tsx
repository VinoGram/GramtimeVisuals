import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Download, Trash2, RefreshCw, FileText, MapPin, Phone, Calendar, Package, CheckCircle, Copy } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-yellow', confirmed: 'badge-green',
  completed: 'badge-gray', cancelled: 'badge-red',
};

const TERMS = [
  ['1. BOOKING AND PAYMENT', 'A 50% non-refundable deposit is required to secure your booking date. The remaining balance is due 7 days before the event date.'],
  ['2. CANCELLATION POLICY', 'Cancellations made more than 60 days before the event will receive a 50% refund of the deposit. Cancellations within 60 days are non-refundable.'],
  ['3. IMAGE DELIVERY', 'All edited images will be delivered within 4–6 weeks after the event via an online gallery.'],
  ['4. COPYRIGHT AND USAGE', 'The Photographer retains copyright to all images. The Client receives a personal usage license.'],
];

export default function BookingManager() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [pinResult, setPinResult] = useState<{ pin: string; galleryId: string; email: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { bookings } = await api.getBookings();
      setBookings(bookings);
      if (selected) {
        const updated = bookings.find((b: any) => b.id === selected.id);
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

  const updateStatus = async (id: string, status: string) => {
    await api.updateBookingStatus(id, status);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    await api.deleteBooking(id);
    setSelected(null);
    load();
  };

  const approvePayment = async (id: string) => {
    if (!confirm('Approve payment and send download PIN to client?')) return;
    setApproving(true);
    try {
      const result = await api.approveBooking(id) as { pin: string; galleryId: string; email: string };
      setPinResult(result);
      load();
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  const downloadAgreement = (b: any) => {
    const lines = [
      'PHOTOGRAPHY SERVICE AGREEMENT', '',
      `Client: ${b.fullName || '—'}`, `Email: ${b.email || '—'}`,
      `Phone: ${b.phone || '—'}`, `Package: ${b.packageName || '—'} (${b.niche || '—'})`,
      `Event Date: ${b.eventDate || '—'}`, `Location: ${b.eventLocation || '—'}`,
      `Date Signed: ${new Date(b.createdAt).toLocaleDateString()}`, '',
      ...TERMS.flatMap(([t, body]) => [t, body, '']),
      `Client Signature: ${b.fullName || '—'}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agreement_${(b.fullName || 'client').replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="empty">Loading bookings…</div>;

  return (
    <>
      <div className="split-panel" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-title" style={{ fontSize: 14 }}>Bookings <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({bookings.length})</span></span>
            <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {bookings.length === 0 && <div className="empty">No bookings yet</div>}
            {bookings.map(b => (
              <div
                key={b.id}
                className={`list-item ${selected?.id === b.id ? 'active' : ''}`}
                onClick={() => { setSelected(b); setPinResult(null); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{b.fullName || '—'}</span>
                  <span className={`badge ${STATUS_BADGE[b.status] || 'badge-yellow'}`}>{b.status || 'pending'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{b.packageName || '—'} · {b.niche || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{b.eventDate || new Date(b.createdAt).toLocaleDateString()}</div>
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
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{selected.fullName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selected.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadAgreement(selected)}>
                    <Download size={13} /> Agreement
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(selected.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {[
                  { icon: Package, label: 'Package', val: selected.packageName },
                  { icon: FileText, label: 'Niche', val: selected.niche },
                  { icon: Phone, label: 'Phone', val: selected.phone },
                  { icon: Calendar, label: 'Event Date', val: selected.eventDate },
                  { icon: MapPin, label: 'Location', val: selected.eventLocation },
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

              {selected.additionalNotes && (
                <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 20 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{selected.additionalNotes}</div>
                </div>
              )}

              {/* PIN result banner */}
              {pinResult && (
                <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <CheckCircle size={16} color="var(--accent)" />
                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>Payment Approved — PIN Sent</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Client Email', val: pinResult.email },
                      { label: 'Gallery ID', val: pinResult.galleryId },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="label" style={{ marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'monospace' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div className="label" style={{ marginBottom: 4 }}>Download PIN</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.2em', color: 'var(--accent)', fontFamily: 'monospace' }}>{pinResult.pin}</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(pinResult.pin)}>
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>This PIN has been logged. Share it with the client to unlock downloads.</div>
                  </div>
                </div>
              )}

              {/* Existing PIN info */}
              {selected.downloadPin && !pinResult && (
                <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 20 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Download PIN (already issued)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.2em', color: 'var(--accent)', fontFamily: 'monospace' }}>{selected.downloadPin}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(selected.downloadPin)}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Gallery ID: {selected.galleryId}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <div className="label" style={{ marginBottom: 8 }}>Update Status</div>
                  <select
                    className="input"
                    style={{ width: 'auto' }}
                    value={selected.status || 'pending'}
                    onChange={e => updateStatus(selected.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {selected.status !== 'confirmed' && selected.status !== 'completed' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => approvePayment(selected.id)}
                    disabled={approving}
                    style={{ marginBottom: 1 }}
                  >
                    <CheckCircle size={14} />
                    {approving ? 'Approving…' : 'Approve Payment & Send PIN'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="empty" style={{ paddingTop: 80 }}>Select a booking to view details</div>
          )}
        </div>
      </div>
    </>
  );
}
