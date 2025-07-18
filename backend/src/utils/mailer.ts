import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"E-Commerce Support" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  })
}
