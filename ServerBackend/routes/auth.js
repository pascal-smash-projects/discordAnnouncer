import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
    const { password } = req.body; 
    if (password === process.env.APP_PASSWORD) {
        req.session.authed = true;
        res.json({ authed: true });
    } else {
        res.status(401).json({ authed: false, message: "Invalid password" });
    }
});

export default router;