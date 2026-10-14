import { redis, normalizeEmail, EMAIL_RE } from '../_lib/store.js';
import { hashPassword } from '../_lib/crypto.js';
import { issueOtp } from '../_lib/otp.js';
import { handler, fail } from '../_lib/http.js';

export default handler(async ({ fullName, email, password }) => {
  email = normalizeEmail(email);
  if (!String(fullName || '').trim()) throw fail(400, 'Please enter your full name.');
  if (!EMAIL_RE.test(email)) throw fail(400, 'Enter a valid email address.');
  if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    throw fail(400, 'Password needs 8+ characters with a letter and a number.');
  if (await redis.get(`user:${email}`)) throw fail(409, 'An account with this email already exists. Try signing in.');

  await redis.set(`pending:${email}`, { fullName: fullName.trim(), passwordHash: hashPassword(password) }, { ex: 600 });
  await issueOtp(email, 'signup');
  return { ok: true };
});
