const express = require("express");
const passport = require("passport");
const db = require("../db");
const bcrypt = require("bcryptjs");

const router = express.Router();

// ✅ Register Page (GET)
router.get("/register", (req, res) => {
  res.render("register", { title: "Register | Flowst8Funds" });
});

// ✅ Register (POST)
router.post("/register", async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [full_name, email, hashedPassword]
    );

    console.log("✅ User registered successfully:", email);
    res.redirect("/login");

  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(500).send("Registration failed.");
  }
});

// ✅ Login Page (GET)
router.get("/login", (req, res) => {
  res.render("login", { title: "Login | Flowst8Funds" });
});

// ✅ Login (POST) - Handles user authentication
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("❌ Passport Authentication Error:", err);
      return next(err);
    }
    if (!user) {
      console.log("🔴 Authentication Failed:", info.message);
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("❌ Login Error:", err);
        return next(err);
      }
      console.log("🟢 Logged in:", user.email);
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

// ✅ Dashboard (Protected Route)
router.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("🔴 Not logged in. Redirecting to login...");
    return res.redirect("/login");
  }

  try {
    console.log("🟢 Fetching campaigns for user:", req.user.user_id);

    const [campaigns] = await db.query(
      `SELECT c.*, 
              COALESCE(SUM(d.amount), 0) AS total_donations
         FROM campaigns c
    LEFT JOIN donations d ON c.campaign_id = d.campaign_id
        WHERE c.fundraiser_id = ?
     GROUP BY c.campaign_id`,
      [req.user.user_id]
    );

    res.render("dashboard", {
      title: "Dashboard | Flowst8Funds",
      user: req.user,
      campaigns,
    });
  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
    res.send("Error loading dashboard");
  }
});

module.exports = router;