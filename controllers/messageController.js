const db = require("../db/queries");

exports.getPaginatedMessages = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    if (req.user) {
      if (page === 1) {
        const messages = await db.getMessagesWithUsers(limit, offset);
        res.render("index", { user: req.user, messages: messages });
      } else {
        const messages = await db.getMessagesWithUsers(limit, offset);

        res.json(messages);
      }
    } else {
      if (page === 1) {
        const messages = await db.getMessages(limit, offset);
        res.render("index", { user: req?.user, messages: messages });
      } else {
        const messages = await db.getMessages(limit, offset);
        res.json(messages);
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const response = await db.deleteMessage(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const response = await db.createMessage(req.body);
    if (response.length > 0) {
      res.redirect("/");
    }
  } catch (err) {
    next(err);
  }
};
