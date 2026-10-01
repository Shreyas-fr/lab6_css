import React, { useState, useEffect } from 'react';
import {
  IconShield,
  IconLock,
  IconUser,
  IconKey,
  IconDatabase,
  IconCpu,
  IconRefresh,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconSparkles,
  IconCheck,
  IconAlert,
  IconCopy,
  IconZap,
  IconTerminal
} from './Icons';

const ALL_PEPPERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function App() {
  // Mode: 'register' | 'login'
  const [activeTab, setActiveTab] = useState('register');
  
  // Form Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Inspector Sub-tab: 'trace' | 'pepper' | 'db'
  const [inspectorTab, setInspectorTab] = useState('trace');

  // Network State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  // Practical Demo Payload from Server
  const [lastTrace, setLastTrace] = useState(null); // Stores registration or login trace details
  const [loginPepperLog, setLoginPepperLog] = useState(null); // Details of pepper search during login
  const [dbUsers, setDbUsers] = useState([]);
  const [copiedField, setCopiedField] = useState(null);

  // Fetch DB Users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setDbUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch DB users:', err);
    }
  };

  const clearDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database?')) return;
    try {
      const res = await fetch('/api/users', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDbUsers([]);
        setMessage({ type: 'success', text: 'Database cleared successfully.' });
        setLastTrace(null);
        setLoginPepperLog(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset database: ' + err.message });
    }
  };

  // Preset Credentials Helper
  const applyPreset = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setMessage(null);
  };

  // Copy to Clipboard Helper
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle User Registration
  const handleRegister = async (e) => {
    e?.preventDefault();
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
        setMessage({ type: 'success', text: 'Registration Successful! User stored in MongoDB without Pepper.' });
        setLastTrace({
          action: 'REGISTER',
          username: data.storedDataInDB.username,
          rawPassword: data.practicalDemoDetails.rawPassword,
          salt: data.practicalDemoDetails.generatedSalt,
          pepper: data.practicalDemoDetails.secretPepperUsed,
          combined: data.practicalDemoDetails.combinedString,
          hash: data.practicalDemoDetails.computedSha256Hash
        });
        setLoginPepperLog(null);
        setInspectorTab('trace');
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed.' });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Server connection error: ' + err.message });
    }
  };

  // Handle User Login
  const handleLogin = async (e) => {
    e?.preventDefault();
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
        setMessage({
          type: 'success',
          text: `Login Successful! Server tested peppers A-Z and matched secret Pepper '${data.details.matchedPepper}' in ${data.details.attemptsTaken} attempt(s).`
        });
        setLastTrace({
          action: 'LOGIN',
          username: data.details.username,
          salt: data.details.storedSalt,
          pepper: data.details.matchedPepper,
          hash: data.details.storedHash,
          attempts: data.details.attemptsTaken
        });
        setLoginPepperLog(data.details);
        setInspectorTab('pepper');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Login Unsuccessful: Password mismatch across all candidate peppers!'
        });
        if (data.details) {
          setLoginPepperLog(data.details);
          setInspectorTab('pepper');
        }
      }
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Server connection error: ' + err.message });
    }
  };

  return (
    <div className="app-wrapper">
      {/* Hero Header */}
      <header className="hero-banner">
        <div className="hero-badge-top">
          <IconShield size={16} /> Cryptography Practical Lab 6
        </div>
        <h1 className="hero-title">Salt & Pepper Password Security</h1>
        <p className="hero-subtitle">
          Interactive practical demonstration of SHA-256 cryptographic hashing enhanced with per-user random Salt and server-side secret Pepper.
        </p>

        {/* Concept Badges */}
        <div className="concept-grid">
          <div className="concept-card salt">
            <div className="concept-icon-box">
              <IconSparkles size={22} />
            </div>
            <div className="concept-info">
              <h3>1. Random Salt <span className="tag-badge public">Public in DB</span></h3>
              <p>16-byte random seed per user. Defeats Rainbow Table pre-computed hash lookup attacks.</p>
            </div>
          </div>

          <div className="concept-card pepper">
            <div className="concept-icon-box">
              <IconKey size={22} />
            </div>
            <div className="concept-info">
              <h3>2. Secret Pepper <span className="tag-badge secret">NOT IN DB</span></h3>
              <p>Server-side secret key ('A'-'Z'). Protects passwords even if MongoDB is breached!</p>
            </div>
          </div>

          <div className="concept-card hash">
            <div className="concept-icon-box">
              <IconCpu size={22} />
            </div>
            <div className="concept-info">
              <h3>3. SHA-256 Digest <span className="tag-badge one-way">One-Way</span></h3>
              <p>Calculates <code>SHA256(password + salt + pepper)</code>. Irreversible one-way transform.</p>
            </div>
          </div>

          <div className="concept-card db">
            <div className="concept-icon-box">
              <IconDatabase size={22} />
            </div>
            <div className="concept-info">
              <h3>4. Mongo Storage <span className="tag-badge stored">{dbUsers.length} Records</span></h3>
              <p>Stores username, salt, and hash. Explicitly excludes pepper to maintain zero-trust security.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="main-grid">
        {/* Left Column: Auth Console */}
        <section className="card-panel">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon">
                <IconTerminal size={20} />
              </div>
              <div>
                <h2 className="card-title">Authentication Console</h2>
                <p className="card-subtitle">Register or verify cryptographic credentials</p>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="auth-tab-bar">
            <button
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setMessage(null); }}
            >
              <IconUser size={18} /> Register User
            </button>
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setMessage(null); }}
            >
              <IconLock size={18} /> Verify Login
            </button>
          </div>

          {/* Quick Presets */}
          <div className="preset-section">
            <div className="preset-label">
              <IconZap size={14} /> Quick Demo Credentials
            </div>
            <div className="preset-chips">
              <button className="chip-btn" onClick={() => applyPreset('alice', 'CryptoPass123!')}>
                👤 alice
              </button>
              <button className="chip-btn" onClick={() => applyPreset('bob', 'SecurePepper99#')}>
                👤 bob
              </button>
              <button className="chip-btn" onClick={() => applyPreset('charlie', 'Lab6Password$')}>
                👤 charlie
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={activeTab === 'register' ? handleRegister : handleLogin}>
            <div className="input-group">
              <div className="input-label">
                <span>Username</span>
              </div>
              <div className="input-wrapper">
                <IconUser size={18} className="input-icon" />
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. alice"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-label">
                <span>Password</span>
              </div>
              <div className="input-wrapper">
                <IconLock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="custom-input"
                  placeholder="Enter raw password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {activeTab === 'register' ? (
              <button
                type="submit"
                className="submit-btn register"
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : <><IconSparkles size={18} /> Register User with Salt & Pepper</>}
              </button>
            ) : (
              <button
                type="submit"
                className="submit-btn login"
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : <><IconKey size={18} /> Verify Login & Test Pepper Match</>}
              </button>
            )}
          </form>

          {/* Notification Alert */}
          {message && (
            <div className={`alert-box ${message.type}`}>
              <div className="alert-icon">
                {message.type === 'success' ? <IconCheck size={20} /> : <IconAlert size={20} />}
              </div>
              <div>
                <strong>{message.type === 'success' ? 'Success' : 'Authentication Error'}</strong>
                <p style={{ marginTop: '0.2rem', fontSize: '0.85rem' }}>{message.text}</p>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Cryptographic Inspector & Database Vault */}
        <section className="card-panel">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon">
                <IconCpu size={20} />
              </div>
              <div>
                <h2 className="card-title">Cryptographic Inspector</h2>
                <p className="card-subtitle">Live inspection of Salt, Pepper & MongoDB Vault</p>
              </div>
            </div>
          </div>

          {/* Inspector Sub-Tabs */}
          <div className="inspector-tab-row">
            <button
              className={`subtab-btn ${inspectorTab === 'trace' ? 'active' : ''}`}
              onClick={() => setInspectorTab('trace')}
            >
              <IconTerminal size={16} /> Live SHA-256 Trace
            </button>
            <button
              className={`subtab-btn ${inspectorTab === 'pepper' ? 'active' : ''}`}
              onClick={() => setInspectorTab('pepper')}
            >
              <IconKey size={16} /> Pepper Brute-Force Visualizer
            </button>
            <button
              className={`subtab-btn ${inspectorTab === 'db' ? 'active' : ''}`}
              onClick={() => { setInspectorTab('db'); fetchUsers(); }}
            >
              <IconDatabase size={16} /> MongoDB Vault ({dbUsers.length})
            </button>
          </div>

          {/* Sub-Tab 1: Live SHA-256 Trace */}
          {inspectorTab === 'trace' && (
            <div>
              <div className="flow-diagram">
                <div className="flow-title">
                  <IconSparkles size={14} /> Cryptographic Flow Equation
                </div>
                <div className="flow-step-bar">
                  <div className="flow-pill pass">Password</div>
                  <span className="flow-operator">+</span>
                  <div className="flow-pill salt">Salt (16B Hex)</div>
                  <span className="flow-operator">+</span>
                  <div className="flow-pill pepper">Pepper ('A'-'Z')</div>
                  <span className="flow-operator">=&gt;</span>
                  <div className="flow-pill hash">SHA-256 Digest</div>
                </div>
              </div>

              {lastTrace ? (
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-label-row">
                      <span className="detail-label"><IconUser size={14} /> User & Event</span>
                      <span className="tag-badge public">{lastTrace.action}</span>
                    </div>
                    <div className="detail-value-box" style={{ color: '#fff' }}>
                      {lastTrace.username}
                    </div>
                  </div>

                  {lastTrace.rawPassword && (
                    <div className="detail-card">
                      <div className="detail-label-row">
                        <span className="detail-label"><IconLock size={14} /> Raw Input Password</span>
                      </div>
                      <div className="detail-value-box" style={{ color: '#94a3b8' }}>
                        {lastTrace.rawPassword}
                      </div>
                    </div>
                  )}

                  <div className="detail-card">
                    <div className="detail-label-row">
                      <span className="detail-label" style={{ color: 'var(--accent-cyan)' }}>
                        <IconSparkles size={14} /> Generated Salt (Stored in DB)
                      </span>
                      <button
                        className="copy-icon-btn"
                        onClick={() => copyToClipboard(lastTrace.salt, 'salt')}
                        title="Copy Salt"
                      >
                        {copiedField === 'salt' ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </button>
                    </div>
                    <div className="detail-value-box" style={{ color: 'var(--accent-cyan)' }}>
                      {lastTrace.salt}
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label-row">
                      <span className="detail-label" style={{ color: 'var(--accent-purple)' }}>
                        <IconKey size={14} /> Secret Pepper (Server Only)
                      </span>
                    </div>
                    <div className="detail-value-box" style={{ color: 'var(--accent-purple)' }}>
                      '{lastTrace.pepper}' <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Candidate Pepper)</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-label-row">
                      <span className="detail-label" style={{ color: 'var(--accent-amber)' }}>
                        <IconCpu size={14} /> Calculated SHA-256 Digest
                      </span>
                      <button
                        className="copy-icon-btn"
                        onClick={() => copyToClipboard(lastTrace.hash, 'hash')}
                        title="Copy Hash"
                      >
                        {copiedField === 'hash' ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </button>
                    </div>
                    <div className="detail-value-box" style={{ color: 'var(--accent-amber)', fontSize: '0.78rem' }}>
                      {lastTrace.hash}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-db-state">
                  <IconTerminal size={36} style={{ color: 'var(--text-muted)' }} />
                  <p>Register or verify a user to view the live SHA-256 execution trace.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Pepper Brute-Force Visualizer */}
          {inspectorTab === 'pepper' && (
            <div className="pepper-matrix-wrapper">
              <div className="pepper-matrix-header">
                <div>
                  <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                    Server Pepper Search Matrix
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Server iterates through candidates ('A'-'Z') to verify stored hash
                  </p>
                </div>

                {loginPepperLog && loginPepperLog.matchedPepper && (
                  <div className="pepper-stat-badge">
                    <IconCheck size={14} /> Found '{loginPepperLog.matchedPepper}' in {loginPepperLog.attemptsTaken} attempt(s)
                  </div>
                )}
              </div>

              <div className="pepper-grid">
                {ALL_PEPPERS.map((char, idx) => {
                  const isMatch = loginPepperLog?.matchedPepper === char;
                  const isTested = loginPepperLog?.attemptsTaken ? (idx + 1 <= loginPepperLog.attemptsTaken) : false;

                  return (
                    <div
                      key={char}
                      className={`pepper-cell-box ${isMatch ? 'matched' : isTested ? 'tested' : ''}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                💡 <strong>Why does this matter?</strong> Even if an attacker steals the MongoDB database (Username, Salt, Hash), they cannot verify passwords without brute-forcing the server's Pepper key.
              </div>
            </div>
          )}

          {/* Sub-Tab 3: MongoDB Live Vault */}
          {inspectorTab === 'db' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {dbUsers.length} user record(s) in MongoDB
                </span>
                <div className="db-header-actions">
                  <button className="db-action-btn" onClick={fetchUsers}>
                    <IconRefresh size={14} /> Refresh
                  </button>
                  <button className="db-action-btn danger" onClick={clearDatabase}>
                    <IconTrash size={14} /> Reset DB
                  </button>
                </div>
              </div>

              {dbUsers.length > 0 ? (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Stored Salt</th>
                        <th>Stored Hash</th>
                        <th>Pepper Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbUsers.map((u) => (
                        <tr key={u._id || u.username}>
                          <td>
                            <div className="user-badge">
                              <IconUser size={14} style={{ color: 'var(--accent-cyan)' }} />
                              {u.username}
                            </div>
                          </td>
                          <td>
                            <span className="salt-badge">{u.salt}</span>
                          </td>
                          <td>
                            <span className="hash-badge" title={u.hash}>{u.hash}</span>
                          </td>
                          <td>
                            <span className="not-stored-tag">
                              🛡️ Excluded from DB
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-db-state">
                  <IconDatabase size={36} style={{ color: 'var(--text-muted)' }} />
                  <p>No user records found in MongoDB. Use the console to register a new user.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-bar">
        <div>
          🔐 <strong>Salt & Pepper Cryptographic Security Lab</strong> &bull; Built with React, Express, MongoDB & SHA-256
        </div>
      </footer>
    </div>
  );
}
