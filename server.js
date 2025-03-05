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
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(require("./routes/authRoutes")); // Load authentication routes

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
