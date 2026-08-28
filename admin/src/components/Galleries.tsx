import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, RefreshCw, Images, Download, Heart, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';

interface GalleryImage { id: string; url: string; thumbnail: string; filename: string; }
interface Gallery { id: string; clientName: string; eventType: string; description: string; allowDownloads: boolean; allowFavorites: boolean; images: GalleryImage[]; }

// ── ImageGrid ────────────────────────────────────────────────────────────────
function ImageGrid({ galleryId, images, onRemove, onUpload, uploading }: {
  galleryId: string; images: GalleryImage[];
  onRemove: (gid: string, iid: string) => void;
  onUpload: (gid: string, files: FileList | null) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
      <div
        style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 16, cursor: 'pointer' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
        onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; onUpload(galleryId, e.dataTransfer.files); }}
      >
        <Upload size={20} style={{ color: 'var(--text3)', marginBottom: 8 }} />
        <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{uploading ? 'Uploading…' : 'Click or drag & drop images here'}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>JPG, PNG, WEBP — multiple files supported</div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => onUpload(galleryId, e.target.files)} />
      </div>
      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {images.map(img => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', background: 'var(--surface)' }}>
              <img src={img.thumbnail || img.url} alt={img.filename} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => onRemove(galleryId, img.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <X size={11} />
              </button>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '12px 4px 4px', fontSize: 9, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.filename}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '12px 0' }}>No images yet — upload some above</div>
      )}
    </div>
  );
}

// ── GalleryRow ───────────────────────────────────────────────────────────────
function GalleryRow({ gallery, expanded, onToggle, onDelete, onRemoveImage, onUpload, uploading }: {
  gallery: Gallery; expanded: boolean; onToggle: () => void; onDelete: () => void;
  onRemoveImage: (gid: string, iid: string) => void;
  onUpload: (gid: string, files: FileList | null) => void;
  uploading: boolean;
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '2px 7px', borderRadius: 5, color: 'var(--text2)' }}>{gallery.id}</code>
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>{gallery.clientName}</span>
            <span style={{ color: 'var(--text3)', fontSize: 12 }}>{gallery.eventType}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text3)' }}><Images size={12} />{gallery.images?.length ?? 0} images</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={12} color={gallery.allowDownloads ? 'var(--accent)' : 'var(--text3)'} />
              <span className={`badge ${gallery.allowDownloads ? 'badge-green' : 'badge-gray'}`}>{gallery.allowDownloads ? 'Downloads On' : 'Downloads Off'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Heart size={12} color={gallery.allowFavorites ? 'var(--red)' : 'var(--text3)'} />
              <span className={`badge ${gallery.allowFavorites ? 'badge-green' : 'badge-gray'}`}>{gallery.allowFavorites ? 'Favorites On' : 'Favorites Off'}</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={onToggle}><Images size={13} />{expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={12} /></button>
        </div>
      </div>
      {expanded && <ImageGrid galleryId={gallery.id} images={gallery.images || []} onRemove={onRemoveImage} onUpload={onUpload} uploading={uploading} />}
    </div>
  );
}

// ── CreateModal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => Promise<void>; }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [password, setPassword] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowFavorites, setAllowFavorites] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    api.getBookings()
      .then(({ bookings }: any) => {
        setBookings((bookings || []).filter((b: any) =>
          b.status === 'confirmed' || b.status === 'completed'
        ));
      })
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, []);

  const selected = bookings.find((b: any) => b.id === selectedBookingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await onCreate({
        bookingId: selected.id,
        clientName: selected.fullName || selected.name,
        clientEmail: selected.email,
        eventType: selected.niche || selected.eventType || 'Photography',
        password,
        description: `${selected.packageName || ''} — ${selected.eventDate || ''}`.trim(),
        allowDownloads,
        allowFavorites,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Create Gallery from Booking</div>

        {loadingBookings ? (
          <div style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0', textAlign: 'center' }}>Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0', textAlign: 'center', lineHeight: 1.7 }}>
            No eligible bookings found.<br />
            <span style={{ fontSize: 12 }}>Bookings must be <strong>Confirmed</strong> or <strong>Completed</strong> and not already have a gallery.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Select Booking *</label>
              <select className="input" value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)} required>
                <option value="">— choose a booking —</option>
                {bookings.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.fullName || b.name} · {b.niche || b.eventType} · {b.eventDate || 'No date'}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 14, fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
                <div><strong>Client:</strong> {selected.fullName || selected.name}</div>
                <div><strong>Email:</strong> {selected.email}</div>
                <div><strong>Package:</strong> {selected.packageName} · {selected.niche}</div>
                <div><strong>Event Date:</strong> {selected.eventDate || '—'}</div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label className="label">Gallery Password *</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={allowDownloads} onChange={e => setAllowDownloads(e.target.checked)} /> Allow Downloads
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={allowFavorites} onChange={e => setAllowFavorites(e.target.checked)} /> Allow Favorites
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving || !selectedBookingId} style={{ flex: 1, justifyContent: 'center' }}>
                {saving ? 'Creating…' : 'Create Gallery'}
              </button>
              <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Galleries (main) ─────────────────────────────────────────────────────────
export default function Galleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { galleries } = await api.getGalleries();
      setGalleries(galleries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const handleCreate = async (data: any) => {
    await api.createGallery(data);
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery?')) return;
    await api.deleteGallery(id);
    load();
  };

  const handleUpload = async (galleryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try { await api.uploadGalleryImages(galleryId, files); await load(); }
    finally { setUploading(false); }
  };

  const handleRemoveImage = async (galleryId: string, imageId: string) => {
    if (!confirm('Remove this image?')) return;
    await api.deleteGalleryImage(galleryId, imageId);
    load();
  };

  if (loading) return <div className="empty">Loading galleries…</div>;

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title">Client Galleries <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({galleries.length})</span></span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={13} /> New Gallery</button>
          </div>
        </div>
        {galleries.length === 0 ? (
          <div className="empty">No galleries yet</div>
        ) : (
          galleries.map(g => (
            <GalleryRow
              key={g.id} gallery={g}
              expanded={expandedId === g.id}
              onToggle={() => setExpandedId(prev => prev === g.id ? null : g.id)}
              onDelete={() => handleDelete(g.id)}
              onRemoveImage={handleRemoveImage}
              onUpload={handleUpload}
              uploading={uploading}
            />
          ))
        )}
      </div>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </>
  );
}
