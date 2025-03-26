const express = require("express");
const db = require("../db");
const { generateCampaignText, generateSocialPost } = require("../aiHelper");

const router = express.Router();

// ✅ Route to display "Create Campaign" page
router.get("/create", (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    res.render("createCampaign", { user: req.user });
});

// ✅ Route to handle campaign creation
router.post("/create", async (req, res) => {
    const { title, goal_amount } = req.body;
    const fundraiser_id = req.user.user_id;

    try {
        console.log("🟢 Creating campaign:", title, "Goal:", goal_amount);

        // Insert campaign placeholder into database
        const [result] = await db.query(
            "INSERT INTO campaigns (fundraiser_id, title, description, ai_social_post, goal_amount, status) VALUES (?, ?, ?, ?, ?, ?)",
            [fundraiser_id, title, "Generating...", "Generating...", goal_amount, "processing"]
        );

        const campaignId = result.insertId;
        console.log("🟢 Campaign placeholder saved with ID:", campaignId);

        // ✅ Run AI text generation asynchronously
        setTimeout(async () => {
            try {
                console.log("🔵 AI: Generating content for campaign ID:", campaignId);
                const description = await generateCampaignText(title);
                const ai_social_post = await generateSocialPost(title, "fundraising, donation, support");

                console.log("🟢 AI Response (Description):", description);
                console.log("🟢 AI Response (Social Post):", ai_social_post);

                // ✅ Update the campaign with AI-generated content
                await db.query(
                    "UPDATE campaigns SET description = ?, ai_social_post = ?, status = ? WHERE campaign_id = ?",
                    [description, ai_social_post, "completed", campaignId]
                );

                console.log("✅ Campaign AI content updated successfully!");

            } catch (aiError) {
                console.error("❌ AI Generation Error:", aiError);
                await db.query("UPDATE campaigns SET status = ? WHERE campaign_id = ?", ["failed", campaignId]);
            }
        }, 2000); // Delay AI call slightly

        res.redirect("/dashboard");

    } catch (error) {
        console.error("❌ Error creating campaign:", error);
        res.send("Error creating campaign.");
    }
});

// ✅ Route to display all campaigns on the dashboard
router.get("/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/login");

    try {
        console.log("🟢 Fetching campaigns for user:", req.user.user_id);
        const [campaigns] = await db.query(`
    SELECT c.*, 
        COALESCE(SUM(d.amount), 0) AS total_donations
    FROM campaigns c
    LEFT JOIN donations d ON c.campaign_id = d.campaign_id
    WHERE c.fundraiser_id = ?
    GROUP BY c.campaign_id
`, [req.user.user_id]);
        
        console.log("🔵 Campaigns Retrieved:", campaigns.length);
        res.render("dashboard", { user: req.user, campaigns });

    } catch (error) {
        console.error("❌ Error fetching campaigns:", error);
        res.send("Error loading campaigns.");
    }
});

// ✅ Route to display the public shareable campaign page with donation history
router.get("/:campaign_id", async (req, res) => {
    const campaignId = req.params.campaign_id;

    try {
        console.log("🟢 Share link accessed for campaign ID:", campaignId);

        if (isNaN(campaignId)) {
            console.log("❌ Invalid campaign ID:", campaignId);
            return res.status(400).send("Invalid campaign ID.");
        }

        // ✅ Fetch campaign with total donations
        const [results] = await db.query(`
            SELECT c.*, 
                   COALESCE(SUM(d.amount), 0) AS total_donations
            FROM campaigns c
            LEFT JOIN donations d ON c.campaign_id = d.campaign_id
            WHERE c.campaign_id = ?
            GROUP BY c.campaign_id
        `, [campaignId]);

        if (!results || results.length === 0) {
            console.log("🔴 Campaign ID", campaignId, "not found in database.");
            return res.status(404).send("Campaign not found.");
        }

        const campaign = results[0];
        console.log("✅ Campaign found:", campaign);

        // ✅ Fetch individual donor history
        const [donations] = await db.query(
            "SELECT donor_name, amount FROM donations WHERE campaign_id = ? ORDER BY donation_id DESC",
            [campaignId]
        );

        res.render("share", { campaign, donations });

    } catch (err) {
        console.error("❌ Error fetching campaign for sharing:", err);
        res.status(500).send("Error loading campaign.");
    }
});

module.exports = router;