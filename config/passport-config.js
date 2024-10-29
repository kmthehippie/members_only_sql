const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../db/queries");
const validatePassword = require("../config/password-utils").validatePassword;

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user[0].userid);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.getUserid(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const users = await db.getEmail(email);

          if (!users || users.length === 0) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await validatePassword(users, password);
          if (isValid) {
            return done(null, users);
          } else {
            return done(null, false, { message: "Invalid email or password" });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
