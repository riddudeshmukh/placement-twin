import { getDb, normalizeEmail } from '../_lib/store.js';
import { verifyPassword } from '../_lib/crypto.js';
import { issueOtp } from '../_lib/otp.js';
import { handler, fail } from '../_lib/http.js';

const MAX_FAILS = 5, LOCK_MS = 60 * 1000;

export default handler(async ({ email, password }) => {
  email = normalizeEmail(email);
  const db = await getDb();
  const fails = db.collection('loginfails');

  const f = await fails.findOne({ _id: email });
  if (f && f.expiresAt.getTime() > Date.now() && f.count >= MAX_FAILS)
    throw fail(429, 'Too many failed attempts. Try again in a minute.');

  const user = await db.collection('users').findOne({ _id: email });
  if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
    const count = f && f.expiresAt.getTime() > Date.now() ? f.count + 1 : 1;
    await fails.replaceOne({ _id: email }, { _id: email, count, expiresAt: new Date(Date.now() + LOCK_MS) }, { upsert: true });
    throw fail(401, 'Invalid email or password.');
  }
  await fails.deleteOne({ _id: email });
  await issueOtp(db, email, 'login');
  return { ok: true };
});
