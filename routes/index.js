const express = require("express");
const router = express.Router();
const passport = require("passport");
const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");
const isAuth = require("./authMiddleware").isAuth;
const isAdmin = require("./authMiddleware").isAdmin;

router.get("/", isAuth, messageController.getPaginatedMessages);

router.get("/login", async (req, res, next) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.json({ success: true });
    });
  })(req, res, next);
});

router.get("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out: ", err);
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session: ", err);
      }
      return next(err);
    });
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

router.get("/create", isAuth, async (req, res, next) => {
  res.render("createMessage");
});

router.post("/create", isAuth, messageController.createMessage);

router.get("/register", async (req, res, next) => {
  res.render("register");
});

router.post("/register", userController.PostRegister);

router.post(
  "/message/:id/delete",
  isAuth,
  isAdmin,
  messageController.deleteMessage
);

module.exports = router;
