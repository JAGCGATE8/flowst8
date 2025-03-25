const express = require("express");
const db = require("../db");
const { generateCampaignText, generateSocialPost } = require("../aiHelper");

const router = express.Router();

// Route to display "Create Campaign" page
router.get("/create", (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    res.render("createCampaign", { user: req.user });
});

// ✅ Optimized Campaign Creation Route (Fix Delays)
router.post("/create", async (req, res) => {
    const { title, goal_amount, keywords } = req.body;
    const fundraiser_id = req.user.user_id;

    try {
        console.log("🟢 Creating campaign:", { title, goal_amount, keywords });

        // ✅ Save campaign first with a "Processing" status
        const [insertResult] = await db.query(
            "INSERT INTO campaigns (fundraiser_id, title, description, ai_social_post, goal_amount, status) VALUES (?, ?, ?, ?, ?, ?)",
            [fundraiser_id, title, "Generating description...", "Generating social post...", goal_amount, "processing"]
        );
        const campaignId = insertResult.insertId;
        console.log("🟢 Campaign placeholder saved with ID:", campaignId);

        // ✅ AI runs in the background (does not block request)
        setTimeout(async () => {
            try {
                console.log("🔵 Generating AI content...");
                const description = await generateCampaignText(title);
                const ai_social_post = await generateSocialPost(title, keywords);

                // ✅ Update campaign with AI content
                await db.query(
                    "UPDATE campaigns SET description = ?, ai_social_post = ?, status = ? WHERE campaign_id = ?",
                    [description, ai_social_post, "completed", campaignId]
                );
                console.log("🟢 Campaign AI content updated successfully!");

            } catch (error) {
                console.error("❌ AI Generation Error:", error);
                await db.query(
                    "UPDATE campaigns SET status = ? WHERE campaign_id = ?",
                    ["failed", campaignId]
                );
            }
        }, 1000); // ✅ Small delay before starting AI request

        res.redirect("/dashboard"); // ✅ Redirect immediately (AI runs in background)
    } catch (error) {
        console.error("❌ Error Creating Campaign:", error);
        res.send("Error creating campaign");
    }
});

module.exports = router;