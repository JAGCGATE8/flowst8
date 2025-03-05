const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("./db");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) return done(err);
      if (results.length === 0) return done(null, false, { message: "No user found" });

      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) return done(null, user);
        else return done(null, false, { message: "Incorrect password" });
      });
    });
  })
);

passport.serializeUser((user, done) => done(null, user.user_id));
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE user_id = ?", [id], (err, results) => {
    if (err) return done(err);
    return done(null, results[0]);
  });
});
