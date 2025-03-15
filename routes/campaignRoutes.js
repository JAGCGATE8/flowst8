const express = require("express");
const db = require("../db");
const { generateCampaignText, generateSocialPost } = require("../aiHelper");

const router = express.Router();

// Route to display "Create Campaign" page
router.get("/create", (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/login"); // Only allow logged-in users
    res.render("createCampaign", { user: req.user });
});

// Route to handle campaign creation
router.post("/create", async (req, res) => {
    const { title, goal_amount } = req.body;
    const fundraiser_id = req.user.user_id; // Get logged-in user's ID

    try {
        // Generate AI content
        const description = await generateCampaignText(title);
        const ai_social_post = await generateSocialPost(title);

        // Insert campaign into database
        db.query("INSERT INTO campaigns (fundraiser_id, title, description, ai_social_post, goal_amount) VALUES (?, ?, ?, ?, ?)", 
        [fundraiser_id, title, description, ai_social_post, goal_amount], 
        (err, result) => {
            if (err) return res.send("Error creating campaign");
            res.redirect("/dashboard");
        });

    } catch (error) {
        res.send("AI generation failed");
    }
});

// ✅ NEW: Public Campaign Page Route
router.get("/:campaign_id", (req, res) => {
    const campaignId = req.params.campaign_id;

    db.query("SELECT * FROM campaigns WHERE campaign_id = ?", [campaignId], (err, results) => {
        if (err) {
            console.error("Error fetching campaign:", err);
            return res.status(500).send("Error fetching campaign");
        }

        if (results.length === 0) {
            return res.status(404).send("Campaign not found");
        }

        const campaign = results[0];
        res.render("campaign", { campaign });
    });
});

module.exports = router;
