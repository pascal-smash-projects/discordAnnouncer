import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
const dbPath = fileURLToPath(new URL("./posts.db", import.meta.url));
const db = new DatabaseSync(dbPath);

const createPosts = `CREATE TABLE IF NOT EXISTS posts (
id Integer PRIMARY KEY AUTOINCREMENT,
channel TEXT NOT NULL,
message TEXT NOT NULL,
user TEXT,
roles TEXT,
attachmentUrl TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
status TEXT
);`;

const createAttachments = `CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    data BLOB NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);`;

db.exec(createPosts);
db.exec(createAttachments);
db.exec("CREATE INDEX IF NOT EXISTS idx_attachments_post_id ON attachments(post_id)");

const insertPostQuery = `INSERT INTO posts (channel, message, user, roles, attachmentUrl, status) VALUES (?, ?, ?, ?, ?, ?)`;
const insertAttachmentQuery = `INSERT INTO attachments (post_id, filename, mime_type, size, data) VALUES (?, ?, ?, ?, ?)`;
const selectPostsQuery = `SELECT * FROM posts ORDER BY created_at DESC`;
// no `data` here: listing posts shouldn't load every image
const selectAttachmentsQuery = `SELECT id, filename, mime_type, size FROM attachments WHERE post_id = ?`;
const selectAttachmentQuery = `SELECT filename, mime_type, data FROM attachments WHERE id = ?`;

// files: [{ buffer, filename, mimeType }]
export function insertPost(channel, message, user, roles, attachmentUrl, status, files = []) {
    db.exec("BEGIN");
    try {
        const { lastInsertRowid } = db
            .prepare(insertPostQuery)
            .run(channel, message, user, JSON.stringify(roles), attachmentUrl, status);

        const insertAttachment = db.prepare(insertAttachmentQuery);
        for (const file of files) {
            insertAttachment.run(lastInsertRowid, file.filename, file.mimeType, file.buffer.length, file.buffer);
        }

        db.exec("COMMIT");
        return lastInsertRowid;
    } catch (err) {
        db.exec("ROLLBACK");
        throw err;
    }
}

export function getAllPosts() {
    const attachments = db.prepare(selectAttachmentsQuery);
    return db.prepare(selectPostsQuery).all().map((post) => ({
        ...post,
        attachments: attachments.all(post.id),
    }));
}

export function getAttachment(id) {
    return db.prepare(selectAttachmentQuery).get(id);
}