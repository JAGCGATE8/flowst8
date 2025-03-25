const axios = require("axios");
require("dotenv").config();

async function generateCampaignText(title) {
    try {
        console.log("🔵 AI: Generating campaign description for:", title);
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-base",
            { inputs: `Write a heartfelt and compelling fundraising campaign description for "${title}". 
            Explain the purpose, how the funds will be used, and add a personal touch to connect with donors.` },
            { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
        );

        console.log("🟢 AI Response (Description) Received:", response.data);
        return response.data[0]?.summary_text.trim() || "We need your support to make this campaign successful.";

    } catch (error) {
        console.error("❌ AI Error (Description):", error.response?.data || error.message);
        return "We need your support to make this campaign successful.";
    }
}

async function generateSocialPost(title, keywords) {
    try {
        console.log("🔵 AI: Generating social media post for:", title, "Keywords:", keywords);
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-base",
            { inputs: `Create an engaging and emotional social media post for a fundraising campaign titled "${title}". 
            Use the keywords: ${keywords}.  
            The post should be short, persuasive, and include a direct call to action for donations.` },
            { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
        );

        console.log("🟢 AI Response (Social Post) Received:", response.data);
        return response.data[0]?.summary_text.trim() || "Support this important cause today! #Fundraising #DonateNow";

    } catch (error) {
        console.error("❌ AI Error (Social Post):", error.response?.data || error.message);
        return "Support this important cause today! #Fundraising #DonateNow";
    }
}

module.exports = { generateCampaignText, generateSocialPost };