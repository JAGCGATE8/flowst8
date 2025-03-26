require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("🔵 OpenAI API Key Loaded:", OPENAI_API_KEY ? "✅ Yes" : "❌ No API Key Found!");

// ✅ Function to Generate AI Fundraising Campaign Description
async function generateCampaignText(title) {
    try {
        console.log("🔵 Requesting AI campaign description for:", title);

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `Write a compelling fundraising campaign for "${title}". 
                        Make it emotional, engaging, and persuasive. Include a clear call to action.`
                    }
                ],
                max_tokens: 300
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // ✅ Fix AI response parsing issue
        const aiGeneratedText = response.data.choices[0]?.message?.content || "AI failed to generate content.";
        console.log("✅ AI Response (Description):", aiGeneratedText);
        return aiGeneratedText;
    } catch (error) {
        console.error("❌ AI Generation Error:", error.response ? error.response.data : error.message);
        return "AI failed to generate content.";
    }
}

// ✅ Function to Generate AI-Optimized Social Media Post
async function generateSocialPost(title, keywords) {
    try {
        console.log("🔵 Requesting AI social post for:", title, "with keywords:", keywords);

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `Write a short, engaging, and persuasive social media post for a fundraising campaign titled "${title}". 
                        Use the following keywords: ${keywords}. Include a strong call to action.`
                    }
                ],
                max_tokens: 150
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // ✅ Fix AI response parsing issue
        const aiSocialPost = response.data.choices[0]?.message?.content || "AI failed to generate content.";
        console.log("✅ AI Response (Social Post):", aiSocialPost);
        return aiSocialPost;
    } catch (error) {
        console.error("❌ AI Generation Error:", error.response ? error.response.data : error.message);
        return "AI failed to generate content.";
    }
}

// ✅ Export functions for use in other files
module.exports = { generateCampaignText, generateSocialPost };