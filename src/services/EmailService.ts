/**
 * EmailService.ts
 * Handles email notifications using EmailJS
 * 
 * CONFIGURED ✅
 * Service: Light House Academy
 */

import emailjs from '@emailjs/browser';

// ========================================
// EMAILJS CREDENTIALS - CONFIGURED ✅
// ========================================
const EMAILJS_SERVICE_ID = 'service_2bc5kwq';
const EMAILJS_TEMPLATE_ID = 'template_0fpphg6';
const EMAILJS_PUBLIC_KEY = 'HkQD5DYzI8Finy_Tj';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  verification_code?: string;
}

export const EmailService = {
  // Check if EmailJS is configured
  isConfigured: (): boolean => {
    return EMAILJS_SERVICE_ID.length > 0 && 
           EMAILJS_TEMPLATE_ID.length > 0 &&
           EMAILJS_PUBLIC_KEY.length > 0;
  },

  // Send an email
  sendEmail: async (params: EmailParams): Promise<boolean> => {
    if (!EmailService.isConfigured()) {
      console.log('EmailJS not configured. Email would be sent to:', params.to_email);
      return false;
    }

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: params.to_email,
          to_name: params.to_name,
          subject: params.subject,
          message: params.message,
          verification_code: params.verification_code || '',
        }
      );
      
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },

  // Send registration confirmation email
  sendRegistrationEmail: async (
    email: string, 
    name: string, 
    registrationNumber: string,
    verificationCode?: string
  ): Promise<boolean> => {
    const message = `
      <h2>🎉 Welcome to Light House Academy!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering with Light House Academy. Your registration has been successfully completed.</p>
      
      <div style="background: #e0f2fe; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #0369a1; margin-top: 0;">Your Registration Details:</h3>
        <p><strong>Registration Number:</strong> ${registrationNumber}</p>
        <p><strong>Login Password:</strong> ${registrationNumber}</p>
      </div>
      
      <p><strong>Important:</strong> Your registration number is also your password to login to the Student Portal.</p>
      
      <p>Visit our website to access your student portal:</p>
      <p><a href="https://bit.ly/LightHouseAcademy" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Student Portal</a></p>
      
      <p>We're excited to have you on board!</p>
      <p>Best regards,<br>Light House Academy Team</p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: '🎓 Welcome to Light House Academy - Registration Confirmed!',
      message,
      verification_code: verificationCode,
    });
  },

  // Send payment verification email
  sendPaymentVerifiedEmail: async (email: string, name: string): Promise<boolean> => {
    const message = `
      <h2>✅ Payment Verified!</h2>
      <p>Dear ${name},</p>
      <p>Great news! Your payment has been verified successfully.</p>
      
      <div style="background: #d1fae5; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #065f46; margin-top: 0;">What's Next?</h3>
        <p>Your certificate is now unlocked! You can download it from your Student Portal.</p>
      </div>
      
      <p><a href="https://bit.ly/LightHouseAcademy" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
      
      <p>Thank you for being part of Light House Academy!</p>
      <p>Best regards,<br>Light House Academy Team</p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: '✅ Payment Verified - Certificate Unlocked!',
      message,
    });
  },

  // Send certificate ready email
  sendCertificateReadyEmail: async (email: string, name: string): Promise<boolean> => {
    const message = `
      <h2>🎓 Your Certificate is Ready!</h2>
      <p>Dear ${name},</p>
      <p>Congratulations! Your certificate from Light House Academy is now ready for download.</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">Download Your Certificate</h3>
        <p>Login to your Student Portal to download your certificate.</p>
      </div>
      
      <p><a href="https://bit.ly/LightHouseAcademy" style="background: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Now</a></p>
      
      <p>Thank you for completing the training!</p>
      <p>Best regards,<br>Light House Academy Team</p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: '🎓 Your Certificate is Ready for Download!',
      message,
    });
  },

  // Send announcement email to subscribers
  sendAnnouncementEmail: async (
    email: string, 
    name: string, 
    announcementTitle: string,
    announcementMessage: string
  ): Promise<boolean> => {
    const message = `
      <h2>📢 ${announcementTitle}</h2>
      <p>Dear ${name},</p>
      
      <div style="background: #ede9fe; padding: 20px; border-radius: 10px; margin: 20px 0;">
        ${announcementMessage}
      </div>
      
      <p>Visit our website for more information:</p>
      <p><a href="https://bit.ly/LightHouseAcademy" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Website</a></p>
      
      <p>Best regards,<br>Light House Academy Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af;">
        You received this email because you subscribed to Light House Academy updates.
        <a href="https://bit.ly/LightHouseAcademy">Unsubscribe</a>
      </p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: `📢 ${announcementTitle}`,
      message,
    });
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string, name: string, resetCode: string): Promise<boolean> => {
    const message = `
      <h2>🔐 Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>We received a request to reset your password. Use the code below to reset it:</p>
      
      <p>If you didn't request this, you can safely ignore this email.</p>
      
      <p>Best regards,<br>Light House Academy Team</p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: '🔐 Password Reset - Light House Academy',
      message,
      verification_code: resetCode,
    });
  },

  // Send reminder email for upcoming session
  sendSessionReminderEmail: async (
    email: string, 
    name: string, 
    sessionName: string,
    sessionDate: string
  ): Promise<boolean> => {
    const message = `
      <h2>⏰ Session Reminder</h2>
      <p>Dear ${name},</p>
      <p>This is a friendly reminder that your training session is coming up!</p>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">${sessionName}</h3>
        <p><strong>Date:</strong> ${sessionDate}</p>
      </div>
      
      <p>Make sure you're ready! Log in to your Student Portal for more details.</p>
      
      <p><a href="https://bit.ly/LightHouseAcademy" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Session Details</a></p>
      
      <p>See you soon!</p>
      <p>Best regards,<br>Light House Academy Team</p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: `⏰ Reminder: ${sessionName} is Coming Up!`,
      message,
    });
  },

  // Send welcome email to new subscriber
  sendWelcomeSubscriberEmail: async (email: string, name: string): Promise<boolean> => {
    const message = `
      <h2>🎉 Welcome to Our Community!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for subscribing to Light House Academy updates!</p>
      
      <div style="background: #d1fae5; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #065f46; margin-top: 0;">What You'll Receive:</h3>
        <ul>
          <li>📅 Upcoming training announcements</li>
          <li>🎓 New course notifications</li>
          <li>💡 Tips and resources</li>
          <li>🎁 Exclusive offers</li>
        </ul>
      </div>
      
      <p>Visit our website to explore our programs:</p>
      <p><a href="https://bit.ly/LightHouseAcademy" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Programs</a></p>
      
      <p>Welcome aboard!</p>
      <p>Best regards,<br>Light House Academy Team</p>
    `;

    return EmailService.sendEmail({
      to_email: email,
      to_name: name,
      subject: '🎉 Welcome to Light House Academy!',
      message,
    });
  },
};

export default EmailService;
