import process from "node:process";
import config from "./config.json" with { type: "json" };

process.loadEnvFile(new URL("./.env", import.meta.url));
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const channelIds = Object.fromEntries(
    Object.values(config.servers).flatMap((server) => Object.entries(server.channels))
);

export async function sendMessage(channel, content) {
    const CHANNEL_ID = channelIds[channel];

    const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;

    const headers = {
    "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json"
    };

    const payload = {
        "content": content
    }

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${response.statusText} - ${body}`);
    }
    return response.json();
}

// @pacal this shouldnt be needed anymore as could only handle one file, but ill leave here in case you had plans for it
// announce.js i changed over to new one
/*
export async function sendMessageWithAttachment(channel, content, attachmentUrl) {
    const CHANNEL_ID = channelIds[channel];

    const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;

    const fileResponse = await fetch(attachmentUrl);
    const fileBlob = await fileResponse.blob();
    const fileName = new URL(attachmentUrl).pathname.split('/').pop();
    const form = new FormData();
    form.append("payload_json", JSON.stringify({
        content:content,
        attachments: [{
            id: 0,
            filename: fileName
        }]
    }));
    form.append("files[0]", fileBlob, fileName);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bot ${DISCORD_BOT_TOKEN}`
        },
        body: form
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${response.statusText} - ${body}`);
    }
    return response.json();
}
*/

export async function sendMessageWithFiles(channel, content, files = []) {
    // basically just check if no files exist and just fire mssage function othrwise
    if (files.length === 0) {
        return sendMessage(channel, content);
    }

    const CHANNEL_ID = channelIds[channel];
    if (!CHANNEL_ID) {
        throw new Error(`Unknown channel: ${channel}`);
    }

    const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;

    const form = new FormData();
    form.append("payload_json", JSON.stringify({
        content: content,
        attachments: files.map((file, i) => ({ id: i, filename: file.filename })),
    }));
    files.forEach((file, i) => {
        form.append(`files[${i}]`, new Blob([file.buffer], { type: file.mimeType }), file.filename);
    });

    const response = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bot ${DISCORD_BOT_TOKEN}` },
        body: form
    });

    if (!response.ok) {
        const body = await response.text();
        const error = new Error(`Failed to send message: ${response.status} ${response.statusText} - ${body}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

export function buildContent(message, user, roles) {
    for (const role of roles) {
        if (role === "everyone") {
            message += `\n@everyone`;
        } else if (role === "here") {
            message += `\n@here`;
        } else {
            message += `\n<@&${role}>`;
        }
    }
    if (user !== "") {
        message += '\n\nSent From: ' + user;
    }
    return message;
}