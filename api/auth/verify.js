import { getDb, normalizeEmail } from '../_lib/store.js';
import { checkOtp } from '../_lib/otp.js';
import { signSession } from '../_lib/crypto.js';
import { handler, fail } from '../_lib/http.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export default handler(async ({ email, purpose, otp }) => {
  email = normalizeEmail(email);
  if (!['signup', 'login'].includes(purpose) || !/^\d{6}$/.test(String(otp || '').trim()))
    throw fail(400, 'Enter the 6-digit code.');

  const db = await getDb();
  await checkOtp(db, email, purpose, otp);

  let user;
  if (purpose === 'signup') {
    const pending = await db.collection('pending').findOne({ _id: email });
    if (!pending) throw fail(400, 'Session expired. Please sign up again.');
    user = { _id: email, fullName: pending.fullName, passwordHash: pending.passwordHash, createdAt: new Date() };
    try {
      await db.collection('users').insertOne(user);
    } catch (e) {
      if (e.code === 11000) throw fail(409, 'An account with this email already exists. Try signing in.');
      throw e;
    }
    await db.collection('pending').deleteOne({ _id: email });
  } else {
    user = await db.collection('users').findOne({ _id: email });
    if (!user) throw fail(400, 'Account not found.');
  }
  const token = signSession({ email, fullName: user.fullName }, SESSION_TTL_MS);
  return { ok: true, token, expiresAt: Date.now() + SESSION_TTL_MS, user: { fullName: user.fullName, email } };
});
