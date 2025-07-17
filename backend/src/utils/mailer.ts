import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"E-Commerce Support" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html
  })
}
