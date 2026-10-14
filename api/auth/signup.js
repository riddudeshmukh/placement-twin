import { getDb, normalizeEmail, EMAIL_RE } from '../_lib/store.js';
import { hashPassword } from '../_lib/crypto.js';
import { issueOtp } from '../_lib/otp.js';
import { handler, fail } from '../_lib/http.js';

export default handler(async ({ fullName, email, password }) => {
  email = normalizeEmail(email);
  if (!String(fullName || '').trim()) throw fail(400, 'Please enter your full name.');
  if (!EMAIL_RE.test(email)) throw fail(400, 'Enter a valid email address.');
  if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    throw fail(400, 'Password needs 8+ characters with a letter and a number.');

  const db = await getDb();
  if (await db.collection('users').findOne({ _id: email }))
    throw fail(409, 'An account with this email already exists. Try signing in.');

  await db.collection('pending').replaceOne(
    { _id: email },
    { _id: email, fullName: fullName.trim(), passwordHash: hashPassword(password), expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true },
  );
  await issueOtp(db, email, 'signup');
  return { ok: true };
});
