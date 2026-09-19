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
    for (const target of targets) {
        const content = buildContent(target.message, target.user, target.roles);
        if (target.attachmentUrl) {
            await sendMessageWithAttachment(target.channel, content, target.attachmentUrl);
        } else { 
            await sendMessage(target.channel, content);
        }
    }
    res.json({ status: 'success', message: 'Messages sent successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});