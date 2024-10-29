const pool = require("./pool");

exports.getMessages = async (limit, offset) => {
  const { rows } = await pool.query(
    `SELECT * FROM messages
    ORDER BY created_at
    DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
};

exports.getEmail = async (email) => {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return rows;
};

exports.getUserid = async (id) => {
  const { rows } = await pool.query(
    `SELECT userid, email, firstname, status FROM users WHERE userid = $1 `,
    [id]
  );
  return rows[0];
};

exports.postRegister = async ({
  email,
  firstname,
  lastname,
  hashedPassword,
  actualStatus,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO users (email, firstname, lastname, status, password)
    VALUES ($1, $2, $3, $4, $5) RETURNING userid
`,
    [email, firstname, lastname, actualStatus, hashedPassword]
  );
  return rows;
};

exports.getMessagesWithUsers = async (limit, offset) => {
  const query = `
    SELECT 
      m.*,
      u.firstname,
      TO_CHAR(m.created_at, 'dd - mm - yyyy') date
    FROM messages m
    LEFT JOIN users u ON m.user_id = u.userid
    ORDER BY m.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

exports.deleteMessage = async (id) => {
  try {
    const { rows } = await pool.query(
      `
    DELETE FROM messages WHERE messageid = $1`,
      [id]
    );
    return rows;
  } catch (err) {
    console.error("Error deleting message: ", err);
    throw err;
  }
};

exports.createMessage = async ({ title, message_text, id }) => {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO messages (title, message_text, user_id) VALUES ($1, $2, $3) RETURNING user_id`,
      [title, message_text, id]
    );
    return rows;
  } catch (err) {
    console.error("Error creating message: ", err);
    throw err;
  }
};
