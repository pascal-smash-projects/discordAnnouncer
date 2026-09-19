import { Router } from "express";
import {getAllPosts} from "../../bot/db.js";
const router = Router();

router.get("/", (req, res) => {
    try {
        const posts = getAllPosts();
        res.json(posts);
    } catch (err) {
        console.error('Failed to retrieve posts from db:', err);
        res.status(500).json({ status: 'error', message: 'Failed to retrieve posts' });
    }
});

export default router;