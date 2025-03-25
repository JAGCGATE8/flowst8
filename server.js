const express = require("express");
const session = require("express-session");
const passport = require("passport");
const db = require("./db"); // ✅ MySQL connection pool
require("dotenv").config();
require("./passport-config"); // ✅ Load authentication logic

const app = express();

// ✅ Fix session issue
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // ✅ Serve static files

// ✅ Home Route - Redirects to Login or Dashboard
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/dashboard");
    } else {
        res.redirect("/login");
    }
});

// ✅ Load Routes
app.use("/", require("./routes/authRoutes"));
app.use("/campaigns", require("./routes/campaignRoutes"));
app.use("/donations", require("./routes/donationRoutes"));

// ✅ Default 404 Error Page
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));