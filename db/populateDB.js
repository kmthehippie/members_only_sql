const { Client } = require("pg");
require("dotenv").config();

const TABLE = `
CREATE TABLE users (
userid INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
email VARCHAR(255) NOT NULL UNIQUE,
CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
firstname VARCHAR(255) NOT NULL,
lastname VARCHAR(255) NOT NULL,
status VARCHAR(20) CHECK (status IN ('STANDARD', 'PREMIER', 'ADMIN')) DEFAULT 'STANDARD',
password VARCHAR(255) NOT NULL
);

CREATE TABLE messages (
messageid INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
title VARCHAR(255) NOT NULL,
message_text TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
user_id INTEGER,
CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(userid) ON DELETE SET NULL
);

CREATE TABLE sessions(
sid VARCHAR NOT NULL COLLATE "default",
sess JSON NOT NULL,
expire TIMESTAMP(6) NOT NULL,
PRIMARY KEY (sid)
);

`;

const INSERT_DATA = `
-- INSERT USERS
INSERT INTO users (email, firstname, lastname, status, password) VALUES
('admin@example.com', 'Admin', 'User', 'ADMIN', 'hashed_password_here'),
('john@example.com', 'John', 'Doe', 'STANDARD', 'hashed_password_here'),
('jane@example.com', 'Jane', 'Smith', 'PREMIER', 'hashed_password_here');

-- INSERT MESSAGES
INSERT INTO messages (title, message_text, user_id) VALUES
('Welcome', 'Welcome to our platform!', 1),
('Announcement', 'We have new features coming soon.', 1),
('Hello', 'Just saying hello to everyone.', 2),
('Question', 'How do I update my profile?', 3);
`;

const main = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    client.connect();
    const createTableStatements = TABLE.split(";").filter(
      (stmt) => stmt.trim() !== ""
    );
    for (const stmt of createTableStatements) {
      await client.query(stmt);
    }

    await client.query(INSERT_DATA);
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await client.end();
  }
};

main().catch(console.error);
