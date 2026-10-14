// Client-side auth helper. Accounts, password hashing and OTP codes live on the
// server (Vercel /api routes + Redis). The browser only keeps a signed session token.
const SESSION_KEY = 'placementtwin_session_v2';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailFormat(email) {
  return EMAIL_RE.test((email || '').trim());
}

/** Password policy: 8+ chars, at least one letter and one number. Returns
 *  { valid, issues[] } so the UI can show exactly what's missing. */
export function evaluatePasswordStrength(password) {
  const issues = [];
  const pw = password || '';
  if (pw.length < 8) issues.push('at least 8 characters');
  if (!/[a-zA-Z]/.test(pw)) issues.push('a letter');
  if (!/[0-9]/.test(pw)) issues.push('a number');

  let strength = 0;
  if (pw.length >= 8) strength += 1;
  if (pw.length >= 12) strength += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) strength += 1;
  if (/[0-9]/.test(pw)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) strength += 1;

  return {
    valid: issues.length === 0,
    issues,
    score: Math.min(4, strength), // 0-4 for a strength meter
  };
}


async function post(path, body) {
  let res;
  try {
    res = await fetch(`/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON error page */ }
  if (!res.ok) throw new Error(data.error || 'Request failed. Please try again.');
  return data;
}

/** Step 1 of signup: validates, then emails a 6-digit code. */
export const startSignup = ({ fullName, email, password }) => post('signup', { fullName, email, password });
/** Step 1 of login: checks password, then emails a 6-digit code. */
export const startLogin = ({ email, password }) => post('login', { email, password });
export const resendOtp = ({ email, purpose }) => post('resend', { email, purpose });
/** Step 2: verify the code. Returns { token, expiresAt, user }. */
export const verifyOtp = ({ email, purpose, otp }) => post('verify', { email, purpose, otp });

/** Store the server-issued session. `remember` -> localStorage, else sessionStorage. */
export function createSession({ token, expiresAt, user }, remember) {
  const session = { token, expiresAt, fullName: user.fullName, email: user.email };
  const store = remember ? window.localStorage : window.sessionStorage;
  try { store.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  return session;
}

export function getActiveSession() {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = store.getItem(SESSION_KEY);
      if (!raw) continue;
      const session = JSON.parse(raw);
      if (session.expiresAt > Date.now()) return session;
      store.removeItem(SESSION_KEY);
    } catch { /* ignore */ }
  }
  return null;
}

export function clearSession() {
  try { window.localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}
