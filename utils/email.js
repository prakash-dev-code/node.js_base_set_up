const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    secure: false, // Set to false for STARTTLS on port 587
    auth: {
      user: process.env.SMTP_EMAIL_USERNAME,
      pass: process.env.SMTP_EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Prakash <noreply@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response); // Log the response from the SMTP server

    // Optionally, return the info object for further processing
    return info;
  } catch (error) {
    console.error('Error sending email: ', error); // Log any errors that occur
    throw error; // Re-throw the error to handle it in the calling function
  }
};

module.exports = sendEmail;
