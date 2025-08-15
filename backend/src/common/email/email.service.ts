import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface PurchaseNotificationData {
  customerName: string;
  customerEmail: string;
  projectTitle: string;
  projectId: string;
  amount: number;
  currency: string;
  reference: string;
  purchaseDate: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your app password
      },
    });
  }

  async sendContactEmail(contactData: ContactEmailData): Promise<void> {
    try {
      const { name, email, phone, message } = contactData;

      // Email to yourself (the portfolio owner)
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.PORTFOLIO_EMAIL || process.env.SMTP_USER, // Your email where you want to receive messages
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #6366f1; margin-top: 0;">Contact Details</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Quick Actions:</strong><br>
                Reply to this email: <a href="mailto:${email}">Click here</a><br>
                ${phone ? `Call directly: <a href="tel:${phone}">${phone}</a>` : ''}
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 15px;">
              This email was sent from your portfolio contact form.
            </p>
          </div>
        `,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Contact email sent successfully: ${info.messageId}`);

    } catch (error) {
      this.logger.error('Failed to send contact email:', error);
      throw new Error('Failed to send email notification');
    }
  }

  // Optional: Send auto-reply to the contact submitter
  async sendAutoReply(contactData: ContactEmailData): Promise<void> {
    try {
      const { name, email } = contactData;

      const autoReplyOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Thank you for your message!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1; text-align: center;">Thank You for Reaching Out!</h2>
            
            <p>Hi ${name},</p>
            
            <p>Thank you for getting in touch through my portfolio website. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #6366f1; margin-top: 0;">What's Next?</h3>
              <ul style="line-height: 1.6;">
                <li>I'll review your message carefully</li>
                <li>I'll respond with any follow-up questions or next steps</li>
                <li>If it's a project inquiry, I'll provide initial thoughts and availability</li>
              </ul>
            </div>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Check out more of my work on my portfolio</li>
              <li>Connect with me on <a href="https://linkedin.com/in/your-profile">LinkedIn</a></li>
              <li>Follow my latest updates on <a href="https://github.com/your-username">GitHub</a></li>
            </ul>
            
            <p>Looking forward to connecting with you!</p>
            
            <p>Best regards,<br>
            <strong>Henry Agyemang</strong><br>
            Full Stack Developer</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 15px;">
              This is an automated response. Please don't reply to this email - I'll be in touch from my personal email soon!
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(autoReplyOptions);
      this.logger.log(`Auto-reply sent successfully: ${info.messageId}`);

    } catch (error) {
      this.logger.error('Failed to send auto-reply email:', error);
      // Don't throw error for auto-reply failure - it's not critical
    }
  }

  async sendPurchaseNotification(purchaseData: PurchaseNotificationData): Promise<void> {
    try {
      const {
        customerName,
        customerEmail,
        projectTitle,
        projectId,
        amount,
        currency,
        reference,
        purchaseDate
      } = purchaseData;

      // Email to yourself (the portfolio owner) about the purchase
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.PORTFOLIO_EMAIL, // Your email where you want to receive purchase notifications
        subject: `🎉 New Project Purchase: ${projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
              🎉 New Project Purchase!
            </h2>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #16a34a; margin-top: 0;">Purchase Summary</h3>
              <p><strong>Project:</strong> ${projectTitle}</p>
              <p><strong>Project ID:</strong> ${projectId}</p>
              <p><strong>Amount:</strong> ${currency} ${amount}</p>
              <p><strong>Purchase Date:</strong> ${purchaseDate.toLocaleString()}</p>
              <p><strong>Reference:</strong> ${reference}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Next Steps:</strong><br>
                • The customer now has access to the project source code<br>
                • Consider following up with additional resources or support<br>
                • Check your Paystack dashboard for payment details
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 15px;">
              This notification was sent automatically when a customer completed a purchase.
            </p>
          </div>
        `,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Purchase notification email sent successfully: ${info.messageId}`);

    } catch (error) {
      this.logger.error('Failed to send purchase notification email:', error);
      // Don't throw error for notification failure - it's not critical for payment flow
    }
  }
}
