import { Router } from "express";
import config from "../../bot/config.json" with { type: "json" };

const router = Router();

router.get("/", (req, res) => {
    const servers = Object.entries(config.servers).map(([name, server]) => ({
        id: name,
        name,
        channels: Object.keys(server.channels).map((channel) => ({ id: channel, name: channel })),
        roles: Object.entries(server.roles).map(([roleName, roleId]) => ({ id: roleId, name: roleName })),
    }));
    res.json(servers);
});

export default router;