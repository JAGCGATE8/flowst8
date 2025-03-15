const express = require("express");
const session = require("express-session");
const passport = require("passport");
const db = require("./db");
require("dotenv").config();
require("./passport-config"); // Authentication logic

const app = express();

// Middleware
app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // Serves static files (CSS, JS, images)

// Session setup
app.use(session({ 
    secret: "your_secret_key", 
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());

// Home Route - Redirects to Login or Dashboard
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/dashboard");  // If logged in, go to dashboard
    } else {
        res.redirect("/login");  // If not logged in, go to login page
    }
});

// Load Routes
app.use("/", require("./routes/authRoutes")); // Authentication (Login/Signup)
app.use("/campaigns", require("./routes/campaignRoutes")); // Campaign Management
app.use("/donations", require("./routes/donationRoutes")); // Donations

// Default 404 Error Page
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
