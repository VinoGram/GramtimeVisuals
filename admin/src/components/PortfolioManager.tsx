import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, RefreshCw, Upload, ArrowLeft, FolderOpen, X } from 'lucide-react';

const CATEGORIES = ['wedding', 'portrait', 'fashion', 'engagement', 'event', 'commercial'];

// ── Folder Grid ──────────────────────────────────────────────────────────────
function FolderGrid({ folders, onOpen, onDelete, onCreateClick, onRefresh }: {
  folders: any[];
  onOpen: (f: any) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="section-title">Portfolio Folders <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({folders.length})</span></span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}><RefreshCw size={12} /></button>
          <button className="btn btn-primary btn-sm" onClick={onCreateClick}><Plus size={13} /> New Folder</button>
        </div>
      </div>
      {folders.length === 0 ? (
        <div className="empty">No folders yet — create one to start organising your portfolio</div>
      ) : (
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {folders.map(f => (
            <div key={f.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => onOpen(f)}>
              <div style={{ position: 'relative', aspectRatio: '4/3', background: '#111' }}>
                {f.coverUrl ? (
                  <img src={f.coverUrl} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderOpen size={40} color="var(--text3)" />
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onDelete(f.id); }}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                  <Trash2 size={12} />
                </button>
                <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
                  <span className="badge badge-gray" style={{ fontSize: 10 }}>{f.category}</span>
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.imageCount} image{f.imageCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Folder Images View ───────────────────────────────────────────────────────
function FolderView({ folder, onBack, onRefreshFolders }: {
  folder: any;
  onBack: () => void;
  onRefreshFolders: () => void;
}) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const { images } = await api.getPortfolio(folder.id);
      setImages(images);
    } finally { setLoading(false); }
  }, [folder.id]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      fd.append('folderId', folder.id);
      fd.append('category', folder.category);
      await api.addPortfolioImage(fd);
      await load();
      onRefreshFolders();
    } finally { setUploading(false); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this image?')) return;
    await api.deletePortfolioImage(id);
    await load();
    onRefreshFolders();
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><ArrowLeft size={13} /> Back</button>
        <span className="section-title" style={{ flex: 1 }}>{folder.name} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({images.length} images)</span></span>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
        <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        style={{ margin: 20, border: '2px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
        onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; handleUpload(e.dataTransfer.files); }}
      >
        <Upload size={20} style={{ color: 'var(--text3)', marginBottom: 8 }} />
        <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{uploading ? 'Uploading…' : 'Click or drag & drop images here'}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>JPG, PNG, WEBP — multiple files supported</div>
      </div>

      {loading ? (
        <div className="empty">Loading…</div>
      ) : images.length === 0 ? (
        <div className="empty">No images yet — upload some above</div>
      ) : (
        <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {images.map(img => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '4/5', background: 'var(--surface)' }}>
              <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => handleRemove(img.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <X size={12} />
              </button>
              {img.title && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '16px 6px 6px', fontSize: 10, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create Folder Modal ──────────────────────────────────────────────────────
function CreateFolderModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('portrait');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('category', category);
      await api.createPortfolioFolder(fd);
      onCreate();
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>New Portfolio Folder</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Folder Name *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah & James Wedding 2024" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Description <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(shown to visitors)</span></label>
            <textarea className="input" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. A beautiful summer wedding at The Grand Estate, Cape Town"
              rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>{saving ? 'Creating…' : 'Create Folder'}</button>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PortfolioManager() {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadFolders = useCallback(async () => {
    try {
      const { folders } = await api.getPortfolioFolders();
      setFolders(folders);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this folder and all its images?')) return;
    await api.deletePortfolioFolder(id);
    loadFolders();
  };

  if (loading) return <div className="empty">Loading portfolio…</div>;

  if (openFolder) {
    return (
      <FolderView
        folder={openFolder}
        onBack={() => { setOpenFolder(null); loadFolders(); }}
        onRefreshFolders={loadFolders}
      />
    );
  }

  return (
    <>
      <FolderGrid
        folders={folders}
        onOpen={setOpenFolder}
        onDelete={handleDelete}
        onCreateClick={() => setShowCreate(true)}
        onRefresh={loadFolders}
      />
      {showCreate && <CreateFolderModal onClose={() => setShowCreate(false)} onCreate={loadFolders} />}
    </>
  );
}
