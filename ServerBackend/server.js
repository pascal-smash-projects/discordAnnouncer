import express from "express";
import cookieSession from "cookie-session";
import configRoutes from "./routes/config.js";
import announceRoutes from "./routes/announce.js";
import getPostsRoutes from "./routes/getPosts.js";
import attachmentRoutes from "./routes/attachments.js"
import authRoutes from "./routes/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";

import config from "../bot/config.json" with {type: "json"};
import { sendMessage, buildContent } from "../bot/messaging.mjs";

process.loadEnvFile(new URL("./.env", import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieSession({ name: "session", keys: [process.env.SESSION_KEYS] }));

app.use("/config", configRoutes);
app.use("/announce", announceRoutes);
app.use("/posts", getPostsRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});