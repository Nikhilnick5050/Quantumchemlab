import nodemailer from "nodemailer";

// DEBUG (TEMP)
console.log("BREVO HOST:", process.env.BREVO_SMTP_HOST);
console.log("BREVO USER:", process.env.BREVO_SMTP_USER);
console.log(
  "BREVO PASS:",
  process.env.BREVO_SMTP_PASS ? "SET" : "MISSING"
);

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ Brevo SMTP error:", err.message);
  } else {
    console.log("✅ Brevo SMTP ready");
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to);
    return info; // ✅ ADD THIS RETURN
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err; // ✅ ADD THIS THROW - This is what's missing!
  }
};