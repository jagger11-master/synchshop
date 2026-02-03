const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: '"SynchShop" <support@synchshop.com>',
        to: email,
        subject: 'SynchShop OTP Verification',
        html: `<div style="padding: 20px; text-align: center;">
                <h2>Welcome to SynchShop</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #4ecca3;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
               </div>`
    };
    await transporter.sendMail(mailOptions);
};
