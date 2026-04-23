const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Имэйл илгээхэд алдаа гарлаа:', err.message);
  }
};

const sendAppointmentConfirmation = (to, name, date, time, doctorName, serviceName) =>
  sendEmail({
    to,
    subject: '✅ Цаг захиалга батлагдлаа — Содон Сондор',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f0fdfa;padding:32px;border-radius:16px">
        <h2 style="color:#0d9488">🦷 Содон Сондор Шүдний Эмнэлэг</h2>
        <p>Сайн байна уу, <strong>${name}</strong>!</p>
        <p>Таны цаг захиалга амжилттай батлагдлаа.</p>
        <div style="background:white;padding:20px;border-radius:12px;margin:16px 0">
          <p>📅 <strong>Огноо:</strong> ${date}</p>
          <p>🕐 <strong>Цаг:</strong> ${time}</p>
          <p>👨‍⚕️ <strong>Эмч:</strong> ${doctorName}</p>
          <p>🦷 <strong>Үйлчилгээ:</strong> ${serviceName}</p>
        </div>
        <p style="color:#666">Хэрэв цаг өөрчлөх шаардлагатай бол манай веб дээр нэвтрэн захиалгаа удирдана уу.</p>
        <p style="color:#0d9488">Баярлалаа! 😊</p>
      </div>
    `,
  });

const sendPasswordReset = (to, name, url) =>
  sendEmail({
    to,
    subject: '🔐 Нууц үг сэргээх — Содон Сондор',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px">
        <h2>Нууц үг сэргээх</h2>
        <p>Сайн байна уу, <strong>${name}</strong>!</p>
        <p>Доорх товч дарж нууц үгээ сэргээнэ үү (10 минут хүчинтэй):</p>
        <a href="${url}" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Нууц үг сэргээх</a>
        <p style="color:#999;font-size:12px">Хэрэв та энэ хүсэлт илгээгүй бол энэ имэйлийг үл тооно уу.</p>
      </div>
    `,
  });

module.exports = { sendEmail, sendAppointmentConfirmation, sendPasswordReset };
