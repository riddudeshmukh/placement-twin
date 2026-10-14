import { generateOtp, hashOtp, safeEqual } from './crypto.js';
import { sendOtpEmail } from './mail.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_TRIES = 5;

const err = (status, message) => Object.assign(new Error(message), { status });

export async function issueOtp(db, email, purpose) {
  const col = db.collection('otps');
  const _id = `${purpose}:${email}`;
  const existing = await col.findOne({ _id });
  if (existing && existing.cooldownUntil > Date.now()) {
    throw err(429, 'Please wait 30 seconds before requesting another code.');
  }
  const otp = generateOtp();
  const now = Date.now();
  await col.replaceOne(
    { _id },
    { _id, h: hashOtp(email, otp), tries: 0, expiresAt: new Date(now + OTP_TTL_MS), cooldownUntil: now + RESEND_COOLDOWN_MS },
    { upsert: true },
  );
  try {
    await sendOtpEmail(email, otp, purpose);
  } catch (e) {
    await col.deleteOne({ _id }); // let the user retry immediately
    console.error('Email send failed:', e.message);
    throw err(502, 'Could not send the email. Please try again in a moment.');
  }
}

export async function checkOtp(db, email, purpose, otp) {
  const col = db.collection('otps');
  const _id = `${purpose}:${email}`;
  const rec = await col.findOne({ _id });
  if (!rec || rec.expiresAt.getTime() < Date.now()) throw err(400, 'Code expired. Request a new one.');
  if (rec.tries >= MAX_TRIES) {
    await col.deleteOne({ _id });
    throw err(429, 'Too many wrong codes. Request a new one.');
  }
  if (!safeEqual(rec.h, hashOtp(email, String(otp).trim()))) {
    await col.updateOne({ _id }, { $inc: { tries: 1 } });
    throw err(400, 'Incorrect code.');
  }
  await col.deleteOne({ _id }); // single use
}
