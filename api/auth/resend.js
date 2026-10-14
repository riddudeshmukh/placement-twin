import { redis, normalizeEmail } from '../_lib/store.js';
import { issueOtp } from '../_lib/otp.js';
import { handler, fail } from '../_lib/http.js';

export default handler(async ({ email, purpose }) => {
  email = normalizeEmail(email);
  if (!['signup', 'login'].includes(purpose)) throw fail(400, 'Bad request.');
  const ok = purpose === 'signup' ? await redis.get(`pending:${email}`) : await redis.get(`user:${email}`);
  if (!ok) throw fail(400, 'Session expired. Please start again.');
  await issueOtp(email, purpose);
  return { ok: true };
});
