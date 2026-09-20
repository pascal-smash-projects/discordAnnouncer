import { Router } from "express";
import config from "../../bot/config.json" with { type: "json" };

const router = Router();

router.get("/", (req, res) => {
    const servers = Object.entries(config.servers).map(([name, server]) => ({
        id: name,
        name,
        channels: Object.entries(server.channels).map(([name, id]) => ({ id, name })),
        roles: Object.entries(server.roles).map(([roleName, roleId]) => ({ id: roleId, name: roleName })),
    }));
    res.json(servers);
});

export default router;