const express = require("express");
const passport = require("passport");
const db = require("../db");
const bcrypt = require("bcryptjs");

const router = express.Router();

// ✅ Register Page (GET)
router.get("/register", (req, res) => {
  res.render("register");
});

// ✅ Register (POST)
router.post("/register", async (req, res) => {
  const { full_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)", 
  [full_name, email, hashedPassword], 
  (err) => {
    if (err) return res.send("Error registering user");
    res.redirect("/login");
  });
});

// ✅ Login Page (GET)
router.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Login (POST) - Fix for Passport redirect issue
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
      console.log("🟢 User logged in successfully:", user);
      return res.redirect("/dashboard"); // ✅ Force redirect to dashboard
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
      console.log("🔴 User not authenticated - Redirecting to login");
      return res.redirect("/login");
  }

  console.log("🟢 Fetching campaigns for user:", req.user.user_id);

  try {
      const [campaigns] = await db.query("SELECT * FROM campaigns WHERE fundraiser_id = ?", [req.user.user_id]);
      console.log("🔵 Campaigns Retrieved:", campaigns.length);

      res.render("dashboard", { user: req.user, campaigns });
  } catch (err) {
      console.error("❌ Error loading campaigns:", err);
      res.send("Error loading campaigns");
  }
});

module.exports = router;