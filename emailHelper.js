const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Your email
        pass: process.env.EMAIL_PASS   // Your email password
    }
});

// Function to Send Thank-You Email
async function sendThankYouEmail(donor_email, donor_name, amount) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: donor_email,
        subject: "Thank You for Your Donation!",
        html: `
            <h2>Dear ${donor_name},</h2>
            <p>Thank you for your generous donation of $${amount} to support our campaign.</p>
            <p>Your contribution makes a real difference!</p>
            <p>Best regards,<br>Flowst8 Fundraising Team</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Thank-you email sent to " + donor_email);
    } catch (error) {
        console.error("Email sending failed: " + error);
    }
}

module.exports = { sendThankYouEmail };
