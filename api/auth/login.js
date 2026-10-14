import { redis, normalizeEmail } from '../_lib/store.js';
import { verifyPassword } from '../_lib/crypto.js';
import { issueOtp } from '../_lib/otp.js';
import { handler, fail } from '../_lib/http.js';

const MAX_FAILS = 5, LOCK_SECONDS = 60;

export default handler(async ({ email, password }) => {
  email = normalizeEmail(email);
  const failKey = `loginfail:${email}`;
  if ((Number(await redis.get(failKey)) || 0) >= MAX_FAILS)
    throw fail(429, 'Too many failed attempts. Try again in a minute.');

  const user = await redis.get(`user:${email}`);
  if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
    await redis.incr(failKey); await redis.expire(failKey, LOCK_SECONDS);
    throw fail(401, 'Invalid email or password.');
  }
  await redis.del(failKey);
  await issueOtp(email, 'login');
  return { ok: true };
});
