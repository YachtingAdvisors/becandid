/**
 * Be Candid Extension Popup — Vanilla JS (no React, lightweight)
 */

const app = document.getElementById('app');

async function init() {
  try {
    const status = await sendMessage({ type: 'getStatus' });

    if (status.authenticated) {
      const statsRes = await sendMessage({ type: 'getStats' });
      renderDashboard(status, statsRes.stats || {});
    } else {
      renderLogin();
    }
  } catch (e) {
    renderLogin();
  }
}

function renderLogin(errorMsg = '') {
  app.innerHTML = `
    <div class="header">
      <div class="header-left">
        <div class="header-logo">C</div>
        <h1>Be Candid</h1>
      </div>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #78716c; margin-bottom: 16px; line-height: 1.6;">
        Sign in to start awareness monitoring across your browsing.
      </p>
      ${errorMsg ? `<div class="error">${errorMsg}</div>` : ''}
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" placeholder="you@example.com" />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" placeholder="Enter your password" />
      </div>
      <button class="btn-primary" id="login-btn">Sign In</button>
      <p class="signup-link">
        Don't have an account? <a href="https://becandid.io/auth/signup" target="_blank">Sign up free</a>
      </p>
    </div>
    <div class="footer">
      <span class="material-symbols-outlined">lock</span>
      End-to-end encrypted · Privacy-first
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('login-btn');

  if (!email || !password) return;

  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    await sendMessage({ type: 'signIn', email, password });
    init();
  } catch (e) {
    renderLogin(e.message || 'Sign in failed. Check your credentials.');
  }
}

function renderDashboard(status, stats) {
  const domains = Object.entries(stats);
  const totalEvents = domains.reduce((sum, [, s]) => sum + (s.eventCount || 0), 0);
  const totalMinutes = Math.round(domains.reduce((sum, [, s]) => sum + (s.totalSeconds || 0), 0) / 60);
  const blockedCount = domains.filter(([, s]) => s.blocked).length;

  // Sort by total time, descending
  domains.sort((a, b) => (b[1].totalSeconds || 0) - (a[1].totalSeconds || 0));

  const statCards = [
    { value: totalEvents, label: 'Sites Tracked', icon: 'monitoring' },
    { value: totalMinutes, label: 'Minutes Today', icon: 'schedule' },
    { value: blockedCount, label: 'Blocked', icon: 'block' },
    { value: domains.length, label: 'Domains', icon: 'language' },
  ];

  app.innerHTML = `
    <div class="header">
      <div class="header-left">
        <div class="header-logo">C</div>
        <h1>Be Candid</h1>
      </div>
      <div class="status-badge ${status.monitoring ? 'active' : 'inactive'}">
        <span class="status-dot"></span>
        ${status.monitoring ? 'Active' : 'Paused'}
      </div>
    </div>
    <div class="content">
      <div class="toggle-row">
        <div>
          <div class="text">Awareness Monitoring</div>
          <div class="subtext">${status.monitoring ? 'Tracking browsing patterns' : 'Monitoring paused'}</div>
        </div>
        <div class="toggle ${status.monitoring ? 'on' : ''}" id="monitoring-toggle">
          <div class="knob"></div>
        </div>
      </div>

      <div class="stat-grid">
        ${statCards.map(s => `
          <div class="stat-card">
            <span class="material-symbols-outlined icon">${s.icon}</span>
            <div class="value">${s.value}</div>
            <div class="label">${s.label}</div>
          </div>
        `).join('')}
      </div>

      ${domains.length > 0 ? `
        <div class="section-label">Top Sites Today</div>
        <div class="domain-list">
          ${domains.slice(0, 5).map(([domain, s]) => `
            <div class="domain-row">
              <span class="name">
                <span class="favicon">${domain.charAt(0).toUpperCase()}</span>
                ${domain.length > 24 ? domain.slice(0, 22) + '...' : domain}
              </span>
              <span class="time">${Math.round(s.totalSeconds / 60)}m</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <span class="material-symbols-outlined icon">explore</span>
          <p>No browsing tracked yet.<br>Activity will appear as you browse.</p>
        </div>
      `}

      <a href="https://becandid.io/dashboard" target="_blank" class="btn-open-dashboard" style="text-decoration: none;">
        <span class="material-symbols-outlined">open_in_new</span>
        Open Dashboard
      </a>
      <button class="btn-secondary" id="signout-btn">Sign Out</button>
    </div>
    <div class="privacy-badge">
      <span class="material-symbols-outlined">verified_user</span>
      Privacy-first · Only domain names are tracked
    </div>
    <div class="footer">
      <span class="material-symbols-outlined">lock</span>
      256-bit encrypted · Zero-knowledge
    </div>
  `;

  // Toggle monitoring
  document.getElementById('monitoring-toggle').addEventListener('click', async () => {
    const newState = !status.monitoring;
    await sendMessage({ type: 'toggleMonitoring', enabled: newState });
    status.monitoring = newState;
    renderDashboard(status, stats);
  });

  // Sign out
  document.getElementById('signout-btn').addEventListener('click', async () => {
    await sendMessage({ type: 'signOut' });
    renderLogin();
  });
}

function sendMessage(msg) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

// Initialize
init();
