module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  next();
};
module.exports.isAdmin = (req, res, next) => {
  if (req.user?.status === "ADMIN") {
    return next();
  } else {
    res
      .sendStatus(403)
      .send("Access Denied: You do not have perms to perform this action.");
  }
};
