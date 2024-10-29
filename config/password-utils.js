const bcrypt = require("bcrypt");

exports.genPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
exports.validatePassword = async (user, password) => {
  if (!user || !user[0] || !user[0].password) {
    return false;
  }
  if (!password) {
    return false;
  }
  try {
    const result = await bcrypt.compare(password, user[0]?.password);
    return result;
  } catch (err) {
    return false;
  }
};
