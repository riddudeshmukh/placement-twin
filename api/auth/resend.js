import { getDb, normalizeEmail } from '../_lib/store.js';
import { issueOtp } from '../_lib/otp.js';
import { handler, fail } from '../_lib/http.js';

export default handler(async ({ email, purpose }) => {
  email = normalizeEmail(email);
  if (!['signup', 'login'].includes(purpose)) throw fail(400, 'Bad request.');
  const db = await getDb();
  const ok = await db.collection(purpose === 'signup' ? 'pending' : 'users').findOne({ _id: email });
  if (!ok) throw fail(400, 'Session expired. Please start again.');
  await issueOtp(db, email, purpose);
  return { ok: true };
});
