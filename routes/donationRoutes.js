const express = require("express");
const db = require("../db");
const { execFile } = require("child_process");
const path = require("path");

const router = express.Router();

// ✅ Show donation form
router.get("/:campaign_id", async (req, res) => {
    const campaignId = req.params.campaign_id;

    try {
        const [results] = await db.query("SELECT * FROM campaigns WHERE campaign_id = ?", [campaignId]);

        if (!results || results.length === 0) {
            return res.status(404).send("Campaign not found.");
        }

        res.render("donate", { campaign: results[0] });

    } catch (err) {
        console.error("❌ Error loading donation form:", err);
        res.status(500).send("Error loading donation form.");
    }
});

// ✅ Handle donation submission
router.post("/:campaign_id", async (req, res) => {
    const campaignId = req.params.campaign_id;
    const { donor_name, donor_email, amount } = req.body;

    try {
        // Save donation
        await db.query(
            "INSERT INTO donations (campaign_id, donor_name, donor_email, amount) VALUES (?, ?, ?, ?)",
            [campaignId, donor_name, donor_email, amount]
        );

        // Send Thank You email
        const { exec } = require('child_process');
        exec(`python C:/flowst8/send_email.py ${donor_email} "${donor_name}" ${amount}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`❌ Error sending email: ${err}`);
            } else {
                console.log(`✅ Email sent: ${stdout}`);
            }
        });

        // Redirect to Thank You page
        res.redirect(`/donations/thankyou`);
    } catch (err) {
        console.error("❌ Error saving donation:", err);
        res.status(500).send("Error saving donation.");
    }
});

module.exports = router;