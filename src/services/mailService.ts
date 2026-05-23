import { mailTransporter } from '../config/mail'

export class MailService {
  static async send(to: string, subject: string, html: string): Promise<void> {
    await mailTransporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    })
  }

  static async sendVerificationCode(to: string, name: string, code: string): Promise<void> {
    const subject = `Your SnapSeat verification code`
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 24px;">Hello ${name},</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0; line-height: 1.6;">Thank you for registering with SnapSeat. Use the code below to complete your sign up:</p>
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; color: #af831d; margin: 24px 0; border-radius: 6px;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This code will expire shortly. If you did not request this, please ignore this email.</p>
      </div>
    `
    await this.send(to, subject, html)
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to SnapSeat!'
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 24px;">Welcome to SnapSeat, ${name}!</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your account is now fully verified. You can explore available venues and manage your bookings immediately from your dashboard.</p>
        <div style="margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="background: #db9706; color: white; padding: 10px 16px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px; display: inline-block;">Go to Profile</a>
        </div>
      </div>
    `
    await this.send(to, subject, html)
  }
}
