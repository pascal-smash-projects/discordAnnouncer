import { Router } from "express";
import { sendMessage, buildContent, sendMessageWithAttachment } from "../../bot/messaging.mjs";
import { insertPost } from "../../bot/db.js";

function logPost(...args){
    try{
        insertPost(...args);
    } catch (err) {
        console.error("Failed to log post:", err);
    }
}

const router = Router();

router.post("/", async (req, res) => {
    const targets = req.body;

    // validate the targets array
    if (!Array.isArray(targets) || targets.length === 0 || !targets.every(target => target.channel && target.message)) {
        return res.status(400).json({ status: 'error', message: 'Invalid request payload' });
    }

    const results = [];
    for (const target of targets) {
        try {
            const content = buildContent(target.message, target.user, target.roles);
            if (target.attachmentUrl) {
                await sendMessageWithAttachment(target.channel, content, target.attachmentUrl);
            } else {
                await sendMessage(target.channel, content);
            }
            results.push({ channel: target.channel, status: 'sent' });
            logPost(target.channel, target.message, target.user || "", target.roles || [], target.attachmentUrl || null, 'sent');
        } catch (err) {
            console.error(`Failed to send to ${target.channel}:`, err);
            results.push({ channel: target.channel, status: 'failed', error: err.message });
            logPost(target.channel, target.message, target.user || "", target.roles || [], target.attachmentUrl || null, 'failed');
        }
    }

    const sent = results.filter((r) => r.status === 'sent').length;
    const failed = results.length - sent;

    // 200 = all sent, 502 = all failed, 207 = partial send
    const statusCode = failed === 0 ? 200 : sent === 0 ? 502 : 207;
    res.status(statusCode).json({ sent, failed, results });
});

export default router;