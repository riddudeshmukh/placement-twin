import nodemailer from 'nodemailer';

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_PORT || '465') === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to, otp, purpose) {
  const action = purpose === 'signup' ? 'finish creating your account' : 'sign in';
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || `PlacementTwin <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your PlacementTwin verification code`,
    text: `Use this code to ${action}: ${otp}\n\nIt expires in 10 minutes. If you didn't request it, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px">
      <h2 style="margin:0 0 8px">PlacementTwin</h2>
      <p>Use this code to ${action}:</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">${otp}</p>
      <p style="color:#666;font-size:13px">Expires in 10 minutes. If you didn't request it, you can ignore this email.</p></div>`,
  });
}
