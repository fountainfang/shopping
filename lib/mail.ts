
import nodemailer from "nodemailer";

const smtpOptions = {
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASSWORD || "password",
    },
};

export const sendEmail = async (data: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}) => {
    // If no credentials are provided (default mock values), log it (or throw)
    // But better to just try or fail gracefully. 
    // Actually, Nodemailer will fail if connection fails.

    const transporter = nodemailer.createTransport({
        ...smtpOptions,
    });

    return await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || "admin@example.com",
        ...data,
    });
};
