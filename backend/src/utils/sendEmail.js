const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, retries = 2) => {
  const emailConfig = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Cho phép self-signed certificates trên một số server
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  };

  console.log(`📧 Attempting to send email to ${to}...`);
  console.log(`📧 Config: host=${emailConfig.host}, port=${emailConfig.port}, secure=${emailConfig.secure}, user=${emailConfig.auth.user?.substring(0, 3)}***`);

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const transporter = nodemailer.createTransport(emailConfig);

      // Verify connection
      await transporter.verify();
      console.log(`✅ SMTP connection verified (attempt ${attempt})`);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to} - MessageID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Email send failed (attempt ${attempt}/${retries + 1}):`, {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response
      });

      if (attempt > retries) {
        throw new Error(`Email sending failed after ${retries + 1} attempts: ${error.message}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};

module.exports = sendEmail;