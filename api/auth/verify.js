import { redis, normalizeEmail } from '../_lib/store.js';
import { checkOtp } from '../_lib/otp.js';
import { signSession } from '../_lib/crypto.js';
import { handler, fail } from '../_lib/http.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export default handler(async ({ email, purpose, otp }) => {
  email = normalizeEmail(email);
  if (!['signup', 'login'].includes(purpose) || !/^\d{6}$/.test(String(otp || '').trim()))
    throw fail(400, 'Enter the 6-digit code.');

  await checkOtp(email, purpose, otp);

  let user;
  if (purpose === 'signup') {
    const pending = await redis.get(`pending:${email}`);
    if (!pending) throw fail(400, 'Session expired. Please sign up again.');
    user = { fullName: pending.fullName, email, passwordHash: pending.passwordHash, createdAt: Date.now() };
    await redis.set(`user:${email}`, user);
    await redis.del(`pending:${email}`);
  } else {
    user = await redis.get(`user:${email}`);
    if (!user) throw fail(400, 'Account not found.');
  }
  const token = signSession({ email, fullName: user.fullName }, SESSION_TTL_MS);
  return { ok: true, token, expiresAt: Date.now() + SESSION_TTL_MS, user: { fullName: user.fullName, email } };
});
