import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '../models/StoreContext';

export default observer(function LoginPage() {
  const { auth }   = useStore();
  const navigate   = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Both fields are required');
      return;
    }
    console.log('[Login] submitting for user:', username);
    setLoading(true);
    try {
      await auth.login(username, password);
      console.log('[Login] success — navigating to /');
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status: number; data: unknown };
        message?: string;
        code?: string;
      };
      if (axiosErr.response) {
        console.error('[Login] server error', axiosErr.response.status, axiosErr.response.data);
        setError(`Server error ${axiosErr.response.status}: ${JSON.stringify(axiosErr.response.data)}`);
      } else if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message?.includes('Network')) {
        console.error('[Login] network error — cannot reach API', axiosErr.message);
        setError(`Network error: cannot reach API. ${axiosErr.message}`);
      } else {
        console.error('[Login] unknown error', err);
        setError(`Error: ${axiosErr.message ?? String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Movie Manager</h1>
        <p className="login-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Demo accounts:</strong><br />
          manager1 / manager123 &nbsp;|&nbsp;
          leader1 / leader123 &nbsp;|&nbsp;
          staff1 / staff123
        </div>
      </div>
    </div>
  );
});
