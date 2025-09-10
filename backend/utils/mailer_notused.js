import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.MAIL_USER, // ex: ton adresse Gmail
    pass: process.env.MAIL_PASS, // mot de passe d’application Gmail
  },
});

export async function sendInitSessionEmail(to, firstName, token) {
  const url = `${process.env.KEYCLOAK_FRONTEND}/init-session?token=${token}`

  const mailOptions = {
    from: `"Mon Application" <${process.env.MAIL_USER}>`,
    to,
    subject: "Initialisation de votre session",
    html: `
      <p>Bonjour ${firstName},</p>
      <p>Pour initialiser votre session, cliquez sur ce lien :</p>
      <p><a href="${url}">${url}</a></p>
      <p>Ce lien est valable 24h.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
export default sendInitSessionEmail;
