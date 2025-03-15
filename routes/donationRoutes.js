const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../db");
const { exec } = require("child_process");

const router = express.Router();

// Route to process donation
router.post("/process", async (req, res) => {
    const { campaign_id, donor_name, donor_email, amount, stripeToken } = req.body;

    try {
        // Process payment with Stripe
        const charge = await stripe.charges.create({
            amount: amount * 100, // Convert dollars to cents
            currency: "usd",
            source: stripeToken,
            description: `Donation for Campaign #${campaign_id}`
        });

        // Store successful donation in MySQL
        db.query("INSERT INTO donations (campaign_id, donor_name, donor_email, amount, payment_status) VALUES (?, ?, ?, ?, ?)",
        [campaign_id, donor_name, donor_email, amount, "completed"], 
        (err) => {
            if (err) return res.send("Error saving donation");

            // Update total donations for the campaign
            db.query("UPDATE campaigns SET total_donations = total_donations + ? WHERE campaign_id = ?", 
            [amount, campaign_id]);

            // Call Python script to send email
            exec(`python3 send_email.py "${donor_email}" "${donor_name}" "${amount}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Email sending failed: ${error.message}`);
                }
                if (stderr) {
                    console.error(`Email script error: ${stderr}`);
                }
                console.log(`Email script output: ${stdout}`);
            });

            res.redirect(`/campaign/${campaign_id}`); // Redirect back to campaign page
        });

    } catch (error) {
        res.send("Payment failed");
    }
});

module.exports = router;
