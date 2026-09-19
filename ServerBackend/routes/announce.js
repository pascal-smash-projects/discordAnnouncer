import { Router } from "express";
import { sendMessage, buildContent, sendMessageWithAttachment } from "../../bot/messaging.mjs";

const router = Router();

router.post("/", async (req, res) => {
    const targets = req.body;

    // validate the targets array
    if (!Array.isArray(targets) || targets.length === 0 || !targets.every(target => target.channel && target.message)) {
        return res.status(400).json({ error: "Invalid Request Payload" });
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
        } catch (err) {
            console.error(`Failed to send to ${target.channel}:`, err);
            results.push({ channel: target.channel, status: 'failed', error: err.message });
        }
    }

    const sent = results.filter((r) => r.status === 'sent').length;
    const failed = results.length - sent;

    // 200 = all sent, 502 = all failed, 207 = partial send
    const statusCode = failed === 0 ? 200 : sent === 0 ? 502 : 207;
    res.status(statusCode).json({ sent, failed, results });
});

export default router;