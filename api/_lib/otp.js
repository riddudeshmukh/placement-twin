import { redis } from './store.js';
import { generateOtp, hashOtp, safeEqual } from './crypto.js';
import { sendOtpEmail } from './mail.js';

const OTP_TTL = 10 * 60;      // seconds
const RESEND_COOLDOWN = 30;   // seconds
const MAX_TRIES = 5;

export async function issueOtp(email, purpose) {
  const cdKey = `otp-cd:${purpose}:${email}`;
  if (await redis.get(cdKey)) {
    const e = new Error('Please wait 30 seconds before requesting another code.'); e.status = 429; throw e;
  }
  const otp = generateOtp();
  await redis.set(`otp:${purpose}:${email}`, { h: hashOtp(email, otp), tries: 0 }, { ex: OTP_TTL });
  await redis.set(cdKey, 1, { ex: RESEND_COOLDOWN });
  await sendOtpEmail(email, otp, purpose);
}

export async function checkOtp(email, purpose, otp) {
  const key = `otp:${purpose}:${email}`;
  const rec = await redis.get(key);
  if (!rec) { const e = new Error('Code expired. Request a new one.'); e.status = 400; throw e; }
  if (rec.tries >= MAX_TRIES) {
    await redis.del(key);
    const e = new Error('Too many wrong codes. Request a new one.'); e.status = 429; throw e;
  }
  if (!safeEqual(rec.h, hashOtp(email, String(otp).trim()))) {
    await redis.set(key, { ...rec, tries: rec.tries + 1 }, { keepTtl: true });
    const e = new Error('Incorrect code.'); e.status = 400; throw e;
  }
  await redis.del(key); // single use
}
