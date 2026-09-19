// Blocks any request that doesn't carry a valid logged-in session cookie.
export function requireAuth(req, res, next) {
    if (req.session && req.session.authed) return next();
    res.status(401).json({ error: 'Authentication required' });
}
