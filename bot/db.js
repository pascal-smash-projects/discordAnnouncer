import {DatabaseSync} from "node:sqlite";
import { fileURLToPath } from "node:url";
const dbPath = fileURLToPath(new URL("./posts.db", import.meta.url));
const db = new DatabaseSync(dbPath);


const createQuery = `CREATE TABLE IF NOT EXISTS posts (
id Integer PRIMARY KEY AUTOINCREMENT,
channel TEXT NOT NULL,
message TEXT NOT NULL,
user TEXT,
roles TEXT,
attachmentUrl TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
status TEXT
);`;

db.exec(createQuery);

const insertQuery = `INSERT INTO posts (channel, message, user, roles, attachmentUrl, status) VALUES (?, ?, ?, ?, ?, ?)`;
const selectQuery = `SELECT * FROM posts ORDER BY created_at DESC`;

export function insertPost(channel, message, user, roles, attachmentUrl, status) {
    const stmt = db.prepare(insertQuery);
    stmt.run(channel, message, user, JSON.stringify(roles), attachmentUrl, status);
}

export function getAllPosts() {
    const stmt = db.prepare(selectQuery);
    return stmt.all();
}