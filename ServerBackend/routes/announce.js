import { Router } from "express";
import multer from "multer";
import { sendMessageWithFiles, buildContent } from "../../bot/messaging.mjs";
import { insertPost } from "../../bot/db.js";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // should b Discord's current limit
const MAX_FILES = 10;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
});

function logPost(...args){
    try{
        insertPost(...args);
    } catch (err) {
        console.error("Failed to log post:", err);
    }
}

// multer reports its own errors, too big, too many files
function handleUpload(req, res, next) {
    upload.array("files", MAX_FILES)(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            const message = err.code === "LIMIT_FILE_SIZE" ? "A file is too large" : err.message;
            return res.status(status).json({ error: message });
        }
        next(err);
    });
}

function parseTargets(req) {
    if (typeof req.body?.targets === "string") return JSON.parse(req.body.targets);
    return req.body;
}

const router = Router();

router.post("/", handleUpload, async (req, res) => {
    let targets;
    try {
        targets = parseTargets(req);
    } catch {
        return res.status(400).json({ error: "targets is not valid JSON" });
    }

    if (!Array.isArray(targets) || targets.length === 0 || !targets.every(target => target.channel && target.message)) {
        return res.status(400).json({ status: 'error', message: 'Invalid request payload' });
    }

    // same files go to every target
    const files = (req.files ?? []).map((f) => ({
        buffer: f.buffer,
        filename: f.originalname,
        mimeType: f.mimetype,
    }));

    if (files.some((f) => !ALLOWED_TYPES.includes(f.mimeType))) {
        return res.status(415).json({ error: "Only PNG, JPEG, GIF and WebP images are allowed" });
    }

    const results = [];
    for (const target of targets) {
        try {
            const content = buildContent(target.message, target.user, target.roles);
            await sendMessageWithFiles(target.channel, content, files);
            results.push({ channel: target.channel, status: 'sent' });
            logPost(target.channel, target.message, target.user || "", target.roles || [], null, 'sent', files);
        } catch (err) {
            console.error(`Failed to send to ${target.channel}:`, err);
            results.push({ channel: target.channel, status: 'failed', error: err.message });
            logPost(target.channel, target.message, target.user || "", target.roles || [], null, 'failed');
        }
    }

    const sent = results.filter((r) => r.status === 'sent').length;
    const failed = results.length - sent;

    // 200 = all sent, 502 = all failed, 207 = partial send
    const statusCode = failed === 0 ? 200 : sent === 0 ? 502 : 207;
    res.status(statusCode).json({ sent, failed, results });
});

export default router;