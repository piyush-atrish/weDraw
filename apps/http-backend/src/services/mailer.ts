import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null | undefined;

const getTransporter = () => {
    if (transporter === undefined) {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
        const port = Number(SMTP_PORT) || 587;
        transporter = SMTP_HOST
            ? nodemailer.createTransport({
                host: SMTP_HOST,
                port,
                secure: port === 465,
                auth: { user: SMTP_USER, pass: SMTP_PASS },
            })
            : null;
    }
    return transporter;
};

export async function sendOtpEmail(to: string, code: string) {
    const mail = getTransporter();
    if (!mail) {
        if (process.env.NODE_ENV === "production") throw new Error("SMTP is not configured");
        console.log(`[mail] SMTP not configured, code for ${to}: ${code}`);
        return;
    }
    await mail.sendMail({
        from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
        to,
        subject: `${code} is your weDraw code`,
        text: `Your weDraw code is ${code}. It expires in 10 minutes. If you didn't ask for it, you can ignore this email.`,
        html: `<p>Your weDraw code is</p><p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p><p>It expires in 10 minutes. If you didn't ask for it, you can ignore this email.</p>`,
    });
}