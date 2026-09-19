import express from "express";

import config from "./bot/config.json" with {type: "json"};
import { sendMessage, buildContent, sendMessageWithAttachment } from "./bot/messaging.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

app.get(/config/, (req, res) => {
    const servers = Object.entries(config.servers).map(([name, server]) => ({
        id: name,
        name,
        channels: Object.keys(server.channels).map((channel) => ({ id: channel, name: channel })),
        roles: Object.entries(server.roles).map(([roleName, roleId]) => ({ id: roleId, name: roleName })),
    }));
    res.json(servers);
});

app.post('/announce', async (req, res) => {
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

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});