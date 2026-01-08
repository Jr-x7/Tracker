const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create Transporter
  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Real SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
          rejectUnauthorized: false
      }
    });
  } else {
    // Dev Mode / Fallback: Log to console
    console.log("No SMTP Settings found. Using Console Mock.");
    transporter = {
        sendMail: async (mailOptions) => {
            console.log("-----------------------------------------");
            console.log(`[MOCK EMAIL] To: ${mailOptions.to}`);
            console.log(`[MOCK EMAIL] Subject: ${mailOptions.subject}`);
            console.log(`[MOCK EMAIL] Text: ${mailOptions.text}`);
            console.log("-----------------------------------------");
            return { messageId: 'mock-id' };
        }
    }
  }

  // 2. Define Email Options
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || '"Tracker App" <noreply@tracker.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html // Optional HTML body
  };

  // 3. Send Email
  const info = await transporter.sendMail(mailOptions);

  console.log(`Message sent: ${info.messageId}`);
};

module.exports = sendEmail;
