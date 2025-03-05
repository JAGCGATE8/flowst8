const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db");

const router = express.Router();

// Render Register page (GET request)
router.get("/register", (req, res) => {
  res.render("register"); // This renders the 'register.ejs' view
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
  res.render("login"); // This renders the 'login.ejs' view
});

// Login Route (POST request)
router.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
}));

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

module.exports = router;

