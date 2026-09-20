import { Router } from "express";
import { getAttachment } from "../../bot/db.js";

const router = Router();

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Invalid attachment id" });
    }

    const attachment = getAttachment(id);
    if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
    }

    res.set("Content-Type", attachment.mime_type);
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "private, max-age=31536000, immutable");
    res.send(Buffer.from(attachment.data));
});

export default router;