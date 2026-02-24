const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development: Use ethereal.email or configure your SMTP
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // For development, log to console
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'your-ethereal-email@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'your-ethereal-password'
      }
    });
  }
};

// Send invitation email
const sendInvitationEmail = async (to, inviterName, projectName, invitationToken) => {
  try {
    const transporter = createTransporter();
    
    const acceptUrl = `${process.env.CLIENT_URL}/accept-invitation/${invitationToken}`;
    const declineUrl = `${process.env.CLIENT_URL}/decline-invitation/${invitationToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'TaskFlow'}" <${process.env.EMAIL_FROM || 'noreply@taskflow.com'}>`,
      to: to,
      subject: `You're invited to join "${projectName}" on TaskFlow`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .accept-btn { background: #10B981; color: white; }
            .decline-btn { background: #EF4444; color: white; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Project Invitation</h1>
            </div>
            <div class="content">
              <p>Hi there! 👋</p>
              <p><strong>${inviterName}</strong> has invited you to join the project:</p>
              <h2 style="color: #4F46E5; margin: 20px 0;">${projectName}</h2>
              <p>You've been invited to collaborate on this exciting project. Click below to accept or decline the invitation:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${acceptUrl}" class="button accept-btn">✓ Accept Invitation</a>
                <a href="${declineUrl}" class="button decline-btn">✗ Decline</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This invitation will expire in 7 days.<br>
                If you can't click the buttons, copy and paste this link:<br>
                <a href="${acceptUrl}" style="color: #4F46E5;">${acceptUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TaskFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        You're invited to join "${projectName}" on TaskFlow
        
        ${inviterName} has invited you to join the project: ${projectName}
        
        Accept invitation: ${acceptUrl}
        Decline invitation: ${declineUrl}
        
        This invitation will expire in 7 days.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Message sent: %s', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send invitation accepted notification to project owner
const sendInvitationAcceptedEmail = async (to, memberName, projectName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'TaskFlow'}" <${process.env.EMAIL_FROM || 'noreply@taskflow.com'}>`,
      to: to,
      subject: `${memberName} accepted your invitation`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10B981;">✓ Invitation Accepted</h2>
            <p><strong>${memberName}</strong> has accepted your invitation to join <strong>${projectName}</strong>.</p>
            <p>They can now collaborate with you on this project.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              © ${new Date().getFullYear()} TaskFlow
            </p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending acceptance notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInvitationEmail,
  sendInvitationAcceptedEmail
};
