const axios = require("axios");
require("dotenv").config();

async function generateCampaignText(title) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: `Generate a compelling fundraising campaign description for "${title}"` }],
        max_tokens: 150,
    }, {
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    return response.data.choices[0].message.content;
}

async function generateSocialPost(title) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: `Generate a short and engaging social media post for a fundraising campaign titled "${title}"` }],
        max_tokens: 100,
    }, {
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    return response.data.choices[0].message.content;
}

module.exports = { generateCampaignText, generateSocialPost };
