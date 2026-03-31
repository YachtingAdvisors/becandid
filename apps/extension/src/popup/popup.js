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
      <h1>Be Candid</h1>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #5e5f5f; margin-bottom: 16px; line-height: 1.5;">
        Sign in to start monitoring your browsing activity.
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
      <p style="font-size: 11px; color: #5e5f5f; text-align: center; margin-top: 12px;">
        Don't have an account? <a href="https://becandid.io/auth/signup" target="_blank" style="color: #226779; font-weight: 600;">Sign up</a>
      </p>
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
    init(); // Reload to show dashboard
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

  app.innerHTML = `
    <div class="header">
      <h1>Be Candid</h1>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span class="status-dot ${status.monitoring ? 'active' : 'inactive'}"></span>
        <span style="font-size: 11px; opacity: 0.8;">${status.monitoring ? 'Active' : 'Paused'}</span>
      </div>
    </div>
    <div class="content">
      <div class="toggle-row">
        <span class="text">Awareness Monitoring</span>
        <div class="toggle ${status.monitoring ? 'on' : ''}" id="monitoring-toggle">
          <div class="knob"></div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="value">${totalEvents}</div>
          <div class="label">Sites Tracked</div>
        </div>
        <div class="stat-card">
          <div class="value">${totalMinutes}</div>
          <div class="label">Minutes Today</div>
        </div>
        <div class="stat-card">
          <div class="value">${blockedCount}</div>
          <div class="label">Blocked Visits</div>
        </div>
        <div class="stat-card">
          <div class="value">${domains.length}</div>
          <div class="label">Unique Domains</div>
        </div>
      </div>

      ${domains.length > 0 ? `
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #5e5f5f; margin-bottom: 6px;">Top Sites</div>
        <div class="domain-list">
          ${domains.slice(0, 5).map(([domain, s]) => `
            <div class="domain-row">
              <span class="name">${domain}</span>
              <span class="time">${Math.round(s.totalSeconds / 60)} min</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <p style="font-size: 12px; color: #5e5f5f; text-align: center; padding: 16px 0;">
          No browsing tracked yet. Activity will appear as you browse.
        </p>
      `}

      <button class="btn-secondary" id="signout-btn">Sign Out</button>
    </div>
    <div class="footer">Privacy-first · Only domain names are tracked</div>
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
