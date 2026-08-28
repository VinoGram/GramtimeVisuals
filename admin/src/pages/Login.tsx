import { useState } from 'react';
import { api, saveToken } from '../services/api';
import { Lock, User, LogIn } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(username, password);
      saveToken(token);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 380,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 6 }}>
            GRAMTIME VISUALS
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Admin Panel</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Sign in to continue</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ paddingLeft: 36 }}
                placeholder="admin"
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 36 }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)', color: 'var(--red)',
              border: '1px solid rgba(248,113,113,0.2)',
              padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }}
          >
            <LogIn size={15} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
