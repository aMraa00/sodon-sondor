const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const BRAND_COLOR = '#0d9488';

const wrapper = (body) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdfa;padding:32px;border-radius:16px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:32px">🦷</span>
      <h2 style="color:${BRAND_COLOR};margin:4px 0">Содон Сондор</h2>
      <p style="color:#64748b;font-size:13px;margin:0">Шүдний Эмнэлгийн Удирдлагын Систем</p>
    </div>
    ${body}
    <hr style="border:none;border-top:1px solid #ccfbf1;margin:24px 0">
    <p style="color:#94a3b8;font-size:11px;text-align:center">© ${new Date().getFullYear()} Содон Сондор. Энэ имэйл автоматаар илгээгдсэн болно.</p>
  </div>
`;

const card = (content) =>
  `<div style="background:white;padding:20px 24px;border-radius:12px;margin:16px 0;border-left:4px solid ${BRAND_COLOR}">${content}</div>`;

const btn = (url, label) =>
  `<div style="text-align:center;margin:24px 0"><a href="${url}" style="display:inline-block;background:${BRAND_COLOR};color:white;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">${label}</a></div>`;

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: `"Содон Сондор" <${process.env.EMAIL_FROM}>`, to, subject, html });
  } catch (err) {
    console.error('Имэйл илгээхэд алдаа:', err.message);
  }
};

// ── Тавтай морил ────────────────────────────────────────────────────────────
const sendWelcome = (to, name) =>
  sendEmail({
    to,
    subject: '🦷 Тавтай морилно уу — Содон Сондор',
    html: wrapper(`
      <p style="font-size:17px;font-weight:600;color:#0f172a">Сайн байна уу, ${name}!</p>
      <p style="color:#334155">Содон Сондор шүдний эмнэлгийн системд бүртгэгдсэн танд баярлалаа.</p>
      ${card(`
        <p style="margin:0 0 8px;color:#0f172a;font-weight:600">Та дараах боломжуудыг ашиглах боломжтой:</p>
        <ul style="margin:0;padding-left:20px;color:#334155;line-height:1.8">
          <li>📅 Онлайн цаг захиалах</li>
          <li>📋 Эмчилгээний түүх харах</li>
          <li>💊 Эмийн жор авах</li>
          <li>🔔 Мэдэгдэл хүлээн авах</li>
        </ul>
      `)}
      ${btn('https://sodon-sondor.vercel.app/login', 'Системд нэвтрэх')}
    `),
  });

// ── Цаг захиалга батлагдлаа ─────────────────────────────────────────────────
const sendAppointmentConfirmation = (to, name, date, time, doctorName, serviceName) =>
  sendEmail({
    to,
    subject: '✅ Цаг захиалга батлагдлаа — Содон Сондор',
    html: wrapper(`
      <p style="font-size:16px;color:#0f172a">Сайн байна уу, <strong>${name}</strong>!</p>
      <p style="color:#334155">Таны цаг захиалга амжилттай <strong>батлагдлаа</strong>.</p>
      ${card(`
        <p style="margin:0 0 10px;font-weight:600;color:#0d9488">Захиалгын дэлгэрэнгүй</p>
        <table style="width:100%;border-collapse:collapse;color:#334155">
          <tr><td style="padding:5px 0;width:40%">📅 Огноо</td><td><strong>${date}</strong></td></tr>
          <tr><td style="padding:5px 0">🕐 Цаг</td><td><strong>${time}</strong></td></tr>
          <tr><td style="padding:5px 0">👨‍⚕️ Эмч</td><td><strong>${doctorName}</strong></td></tr>
          <tr><td style="padding:5px 0">🦷 Үйлчилгээ</td><td><strong>${serviceName}</strong></td></tr>
        </table>
      `)}
      <p style="color:#64748b;font-size:13px">Цаг өөрчлөх эсвэл цуцлах шаардлагатай бол системд нэвтрэн удирдана уу.</p>
      ${btn('https://sodon-sondor.vercel.app/patient/appointments', 'Захиалгаа харах')}
    `),
  });

// ── Цаг захиалга цуцлагдлаа ─────────────────────────────────────────────────
const sendAppointmentCancelled = (to, name, date, time, reason) =>
  sendEmail({
    to,
    subject: '❌ Цаг захиалга цуцлагдлаа — Содон Сондор',
    html: wrapper(`
      <p style="font-size:16px;color:#0f172a">Сайн байна уу, <strong>${name}</strong>!</p>
      <p style="color:#334155">Таны доорх цаг захиалга <strong style="color:#ef4444">цуцлагдсан</strong> байна.</p>
      ${card(`
        <table style="width:100%;border-collapse:collapse;color:#334155">
          <tr><td style="padding:5px 0;width:40%">📅 Огноо</td><td><strong>${date}</strong></td></tr>
          <tr><td style="padding:5px 0">🕐 Цаг</td><td><strong>${time}</strong></td></tr>
          ${reason ? `<tr><td style="padding:5px 0">📝 Шалтгаан</td><td>${reason}</td></tr>` : ''}
        </table>
      `)}
      <p style="color:#64748b;font-size:13px">Шинэ цаг захиалахыг хүсвэл доорх товчийг дарна уу.</p>
      ${btn('https://sodon-sondor.vercel.app/book', 'Шинэ цаг захиалах')}
    `),
  });

// ── Эмчилгээ дууслаа ────────────────────────────────────────────────────────
const sendAppointmentCompleted = (to, name, doctorName, serviceName) =>
  sendEmail({
    to,
    subject: '🎉 Эмчилгээ амжилттай — Содон Сондор',
    html: wrapper(`
      <p style="font-size:16px;color:#0f172a">Сайн байна уу, <strong>${name}</strong>!</p>
      <p style="color:#334155">Таны эмчилгээ амжилттай дууслаа. <strong>Др. ${doctorName}</strong>-ийн үйлчилгээнд баярлалаа.</p>
      ${card(`
        <p style="margin:0 0 6px;font-weight:600;color:#0d9488">Хүлээн авсан үйлчилгээ</p>
        <p style="margin:0;color:#334155">🦷 ${serviceName}</p>
      `)}
      <p style="color:#64748b;font-size:13px">Эмчилгээний дэлгэрэнгүй мэдээлэл болон жорыг системд нэвтрэн харна уу.</p>
      ${btn('https://sodon-sondor.vercel.app/patient/history', 'Эмчилгээний түүх харах')}
    `),
  });

// ── Нууц үг сэргээх ─────────────────────────────────────────────────────────
const sendPasswordReset = (to, name, url) =>
  sendEmail({
    to,
    subject: '🔐 Нууц үг сэргээх — Содон Сондор',
    html: wrapper(`
      <p style="font-size:16px;color:#0f172a">Сайн байна уу, <strong>${name}</strong>!</p>
      <p style="color:#334155">Нууц үг сэргээх хүсэлт ирлээ. Доорх товч дарж нууц үгээ сэргээнэ үү.</p>
      ${card(`<p style="margin:0;color:#b45309;font-size:13px">⏱ Линк <strong>10 минут</strong> хүчинтэй.</p>`)}
      ${btn(url, '🔐 Нууц үг сэргээх')}
      <p style="color:#94a3b8;font-size:12px;text-align:center">Хэрэв та энэ хүсэлт илгээгүй бол энэ имэйлийг үл тооно уу.</p>
    `),
  });

module.exports = {
  sendEmail,
  sendWelcome,
  sendAppointmentConfirmation,
  sendAppointmentCancelled,
  sendAppointmentCompleted,
  sendPasswordReset,
};
