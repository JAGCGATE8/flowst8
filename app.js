const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const path = require("path");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const PORT = 3000;

// ✅ OpenAI Setup
const { openaiKey } = require("./config");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: openaiKey
});

// XAMPP
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",       
  database: "flowst8",
};

let db;
mysql.createConnection(dbConfig)
  .then((connection) => {
    db = connection;
    console.log("✅ Connected to MySQL");
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err);
  });

// ✅ Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
// ✅ Pledge Route (GET)
app.get("/pledge", (req, res) => {
  res.render("pledge");
});

// ✅ Pledge Submission (POST)
app.post("/pledge", async (req, res) => {
  const { donor_name, donor_email, amount } = req.body;

  try {
    await db.query(
      "INSERT INTO donations (donor_name, donor_email, amount, pledge_status) VALUES (?, ?, ?, ?)",
      [donor_name, donor_email, amount, "pledged"]
    );

    res.redirect("/thankyou");
  } catch (err) {
    console.error("❌ Error saving pledge:", err);
    res.send("Error saving pledge.");
  }
});

// Homepage
app.get("/", (req, res) => {
  res.render("home");
});

// Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { full_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)", [full_name, email, hashedPassword]);
    res.send("Registration successful. Please go to the login page.");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.send("Error registering user.");
  }
});

// Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user) return res.send("User not found.");

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.send("Incorrect password.");

    res.redirect("/dashboard");
  } catch (err) {
    console.error("❌ Login error:", err);
    res.send("Login error.");
  }
});

// Dashboard
app.get("/dashboard", async (req, res) => {
  try {
    const [campaigns] = await db.query("SELECT * FROM campaigns");
    res.render("dashboard", { campaigns });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.send("Error loading dashboard.");
  }
});

// Create Campaign
app.get("/create", (req, res) => {
  res.render("createCampaign");
});

app.post("/create", async (req, res) => {
  const { title, goal_amount, keywords } = req.body;

  try {
    const description = await generateCampaignText(title, keywords);
    await db.query("INSERT INTO campaigns (title, goal_amount, description) VALUES (?, ?, ?)", [title, goal_amount, description]);
    res.redirect("/dashboard");
  } catch (err) {
    console.error("❌ Campaign creation error:", err);
    res.send("Failed to create campaign.");
  }
});

// Thank You Page
app.get("/thankyou", (req, res) => {
  res.render("thankyou");
});

// Fallback 404
app.use((req, res) => {
  res.status(404).render("404");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// ✅ OpenAI Helper Function
async function generateCampaignText(title, keywords) {
  const prompt = `Generate a short campaign description for a fundraiser titled "${title}" using these keywords: ${keywords}. Make it warm and inspiring.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 100,
  });

  return response.data.choices[0].text.trim();
}