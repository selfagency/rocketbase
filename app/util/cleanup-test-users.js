#!/usr/bin/env node
// Cleanup test users created during e2e runs
// Usage: API_KEY=... POCKETBASE_URL=http://127.0.0.1:8090 node scripts/cleanup-test-users.js

const PB_URL = process.env.POCKETBASE_URL || process.env.PB_URL || 'http://127.0.0.1:8090';
const MAILPIT_API = process.env.MAILPIT_API || process.env.MAILPIT || 'http://localhost:8025/api/v1/messages';
const API_KEY = process.env.API_KEY || '';
const API_USER = process.env.API_USER || '';
const API_PASS = process.env.API_PASS || '';

const fetch = global.fetch || (await import('node-fetch')).default;

function log(...args) {
  console.log('[cleanup]', ...args);
}

async function adminAuth(email, password) {
  try {
    const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });
    if (!res.ok) {
      log('admin auth failed', res.status);
      return null;
    }
    const data = await res.json();
    return data?.token || data?.admin?.token || null;
  } catch (err) {
    log('adminAuth error', err.message || err);
    return null;
  }
}

async function fetchUsers(headers) {
  const url = `${PB_URL}/api/collections/users/records?perPage=1000`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`);
  const data = await res.json();
  return data?.items || data || [];
}

function isTestUser(email) {
  if (!email) return false;
  const e = email.toLowerCase();
  // adjust patterns as needed
  return (
    e.endsWith('@example.com') ||
    e.includes('test-') ||
    e.startsWith('2fa-') ||
    e.startsWith('verify-email') ||
    e.startsWith('register-') ||
    e.includes('login-test') ||
    e.includes('profile-test')
  );
}

async function deleteUser(id, headers) {
  const url = `${PB_URL}/api/collections/users/records/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers });
  return res.ok;
}

async function clearMailpit() {
  try {
    // Delete all messages (dangerous) - user must opt-in by setting CLEAR_MAILPIT=1
    if (process.env.CLEAR_MAILPIT !== '1') {
      log('Skipping Mailpit cleanup (set CLEAR_MAILPIT=1 to enable)');
      return;
    }
    log('Fetching Mailpit messages...');
    const res = await fetch(MAILPIT_API);
    if (!res.ok) {
      log('Mailpit fetch failed', res.status);
      return;
    }
    const data = await res.json();
    const messages = data.messages || [];
    log('Found', messages.length, 'messages in Mailpit');
    for (const m of messages) {
      const id = m.ID || m.id || m.Id;
      if (!id) continue;
      // mailpit single delete endpoint: /api/v1/messages/{id}
      const del = await fetch(`${MAILPIT_API.replace(/\/messages$/, '')}/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      log('Deleted mailpit id', id, 'ok=', del.ok);
    }
  } catch (err) {
    log('Mailpit cleanup error', err.message || err);
  }
}

void (async function main() {
  log('Starting cleanup (POCKETBASE_URL=', PB_URL, ')');

  let headers = { 'Content-Type': 'application/json' };
  let token = null;

  if (!API_KEY && API_USER && API_PASS) {
    token = await adminAuth('admin@example.com', 'test1234567890');
    if (token) {
      // oxlint-disable-next-line typescript/restrict-template-expressions
      headers.Authorization = `Bearer ${token}`;
      log('Authenticated as admin via API_USER');
    }
  }

  try {
    const users = await fetchUsers(headers);
    log('Fetched', users.length, 'users');
    const toDelete = users.filter(u => {
      const email = (u?.email || u?.Email || u?.emailAddress || '').toString();
      return isTestUser(email);
    });

    if (toDelete.length === 0) {
      log('No matching test users found');
    }

    for (const u of toDelete) {
      const id = u?.id || u?.ID || u?._id;
      const email = (u?.email || u?.Email || u?.emailAddress || '').toString();
      if (!id) continue;
      const ok = await deleteUser(id, headers).catch(err => {
        log('delete error', id, err.message || err);
        return false;
      });
      log('Deleted user', id, email, 'ok=', ok);
    }

    // Optionally clear Mailpit
    await clearMailpit();

    log('Cleanup complete');
  } catch (err) {
    log('Cleanup failed', err.message || err);
    process.exitCode = 2;
  }
})();
