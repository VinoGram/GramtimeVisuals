import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, RefreshCw, Upload, Link, FileText } from 'lucide-react';

const CATEGORIES = ['CRAFT', 'WEDDINGS', 'PORTRAITS', 'FILM', 'EDITING', 'BEHIND THE SCENES'];

const CATEGORY_COLORS: Record<string, string> = {
  CRAFT: '#4ade80', WEDDINGS: '#f9a8d4', PORTRAITS: '#fbbf24',
  FILM: '#818cf8', EDITING: '#fb923c', 'BEHIND THE SCENES': '#67e8f9',
};

export default function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'upload' | 'url' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const emptyForm = { title: '', excerpt: '', content: '', category: 'CRAFT', tags: '', featuredImageUrl: '' };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      const { posts } = await api.getBlogPosts();
      setPosts(posts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent, useFile: boolean) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (useFile && fileRef.current?.files?.[0]) {
        fd.append('image', fileRef.current.files[0]);
      }
      await api.addBlogPost(fd);
      setMode(null);
      setForm(emptyForm);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await api.deleteBlogPost(id);
    load();
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="empty">Loading posts…</div>;

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title">Journal Posts <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({posts.length})</span></span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMode('url')}><Link size={13} /> URL Image</button>
            <button className="btn btn-primary btn-sm" onClick={() => setMode('upload')}><Plus size={13} /> New Post</button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="empty">No posts yet. Create your first journal entry.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Image</th><th>Title</th><th>Category</th><th>Date</th><th>Read Time</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.featuredImageUrl
                        ? <img src={p.featuredImageUrl} alt={p.title} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                        : <div style={{ width: 56, height: 40, background: 'var(--surface2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color="var(--text3)" /></div>
                      }
                    </td>
                    <td style={{ color: 'var(--text)', fontWeight: 500, maxWidth: 260 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.excerpt?.slice(0, 60)}{p.excerpt?.length > 60 ? '…' : ''}</div>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: `${CATEGORY_COLORS[p.category] || '#4ade80'}22`,
                        color: CATEGORY_COLORS[p.category] || '#4ade80',
                        border: `1px solid ${CATEGORY_COLORS[p.category] || '#4ade80'}44`,
                      }}>{p.category}</span>
                    </td>
                    <td>{fmtDate(p.publishDate)}</td>
                    <td>{p.readTime}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared form fields */}
      {mode && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMode(null)}>
          <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              {mode === 'upload' ? <Upload size={16} color="var(--accent)" /> : <Link size={16} color="var(--accent)" />}
              New Journal Post
            </div>
            <form onSubmit={e => submit(e, mode === 'upload')}>
              {mode === 'upload' && (
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Cover Image (File)</label>
                  <input ref={fileRef} type="file" accept="image/*"
                    style={{ width: '100%', padding: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13 }} />
                </div>
              )}
              {mode === 'url' && (
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Cover Image URL</label>
                  <input className="input" value={form.featuredImageUrl} onChange={e => setForm({ ...form, featuredImageUrl: e.target.value })} placeholder="https://…" />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Excerpt</label>
                <textarea className="input" rows={2} style={{ resize: 'none' }} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary shown on the journal page…" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Full Content</label>
                <textarea className="input" rows={6} style={{ resize: 'vertical' }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write the full article here…" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="photography, weddings, tips" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? 'Publishing…' : 'Publish Post'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
