const express = require("express");
const session = require("express-session");
const passport = require("passport");
const db = require("./db");
require("dotenv").config();
require("./passport-config");

const app = express();

// ✅ Session Configuration
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false
}));

// ✅ Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ✅ Set View Engine
app.set("view engine", "ejs");

// ✅ Home Route (Shows homepage or redirects to dashboard if logged in)
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    res.render("home", { title: "Welcome to Flowst8Funds", user: null });
});

// ✅ Dashboard Redirect (if user manually visits /dashboard)
app.get("/dashboard", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/campaigns/dashboard");
    }
    res.redirect("/login");
});

// ✅ Load Routes
app.use("/", require("./routes/authRoutes"));
app.use("/campaigns", require("./routes/campaignRoutes"));
app.use("/donations", require("./routes/donationRoutes"));
app.use("/share", require("./routes/campaignRoutes")); // For public share pages

// ✅ Route Debugger (optional tool)
app.get("/debug/routes", (req, res) => {
    res.json([
        { path: "/", description: "Homepage" },
        { path: "/login", description: "Login" },
        { path: "/register", description: "Register" },
        { path: "/dashboard", description: "Redirect to campaign dashboard" },
        { path: "/campaigns/create", description: "Create Campaign" },
        { path: "/share/:campaign_id", description: "Public Campaign View" }
    ]);
});

// ✅ Default 404 Page
app.use((req, res) => {
    res.status(404).render("404", {
        user: req.user || null
    });
});


// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("🔵 OpenAI API Key Loaded:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");
});