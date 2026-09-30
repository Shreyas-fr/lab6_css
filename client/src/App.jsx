import React, { useState } from 'react';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setMessage({ type: 'error', text: 'Please enter both username and password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage({ type: 'success', text: 'Registration Successful!' });
        setUsername('');
        setPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed.' });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Server connection error: ' + err.message });
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setMessage({ type: 'error', text: 'Please enter both username and password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage({ type: 'success', text: 'Login Successful' });
      } else {
        setMessage({ type: 'error', text: 'Login Unsuccessful' });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Server connection error: ' + err.message });
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Salt & Pepper Authentication</h1>
        <p>Implementation of Salt and Pepper Password Protection Technique</p>
      </header>

      <div className="auth-card-wrapper">
        <div className="card">
          <form>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Register'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Success / Error Message */}
          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{message.type === 'success' ? '✅' : '❌'}</span>
              <div>
                <strong>{message.text}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

