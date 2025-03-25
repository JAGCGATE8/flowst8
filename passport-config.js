const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("./db"); // ✅ Use connection pool to prevent MySQL errors

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        console.log("🟢 Login attempt for:", email);  // ✅ Log before query

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        console.log("🔵 Query result:", users); // ✅ Log query result

        if (users.length === 0) {
            console.log("🔴 No user found");
            return done(null, false, { message: "No user found" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log("🟢 Password Match:", isMatch);  // ✅ Log if password matches

        return isMatch ? done(null, user) : done(null, false, { message: "Incorrect password" });

    } catch (error) {
        console.error("❌ Login Error:", error);
        return done(error);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.user_id));

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
    console.log("🟢 User session restored:", users[0]);  // ✅ Log session restore
    return done(null, users[0]);
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;