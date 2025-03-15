const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db");

const router = express.Router();

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");  // Redirect to login if not authenticated
}

// Render Register page (GET request)
router.get("/register", (req, res) => {
  res.render("register");
});

// Register Route (POST request)
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

// Render Login page (GET request)
router.get("/login", (req, res) => {
  res.render("login");
});

// Login Route (POST request)
router.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
}));

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

// ✅ Updated Dashboard Route (Fetch Campaigns)
router.get("/dashboard", isAuthenticated, (req, res) => {
  const userId = req.user.user_id;

  db.query("SELECT * FROM campaigns WHERE fundraiser_id = ?", [userId], (err, campaigns) => {
    if (err) {
      console.error("Error fetching campaigns:", err);
      return res.status(500).send("Error fetching campaigns");
    }

    res.render("dashboard", { user: req.user, campaigns: campaigns });
  });
});

module.exports = router;
