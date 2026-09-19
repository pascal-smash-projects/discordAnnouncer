import express from "express";
import configRoutes from "./routes/config.js";
import announceRoutes from "./routes/announce.js";

import config from "../bot/config.json" with {type: "json"};
import { sendMessage, buildContent, sendMessageWithAttachment } from "../bot/messaging.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/config", configRoutes);
app.use("/announce", announceRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});