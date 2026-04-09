import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD
    }
});

transporter.verify()
    .then(() => console.log("Email transporter is ready"))
    .catch((err) => console.error("Email transporter failed:", err));

export async function sendEmail({ to, subject, html, text }) {
    const details = await transporter.sendMail({
        from: process.env.GOOGLE_USER,
        to, subject, html, text
    });
    console.log("Email sent:", details.messageId);
}