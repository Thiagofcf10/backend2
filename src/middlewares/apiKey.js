require('dotenv').config();

/**
 * Simple API key middleware.
 * Accepts key via header 'x-api-key' or query param 'api_key'.
 */
function apiKeyAuth(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) return res.status(500).json({ error: 'API key not configured on server' });
  const provided = req.headers['x-api-key'] || req.query.api_key;
  if (!provided) return res.status(401).json({ error: 'API key required' });
  if (provided !== expected) return res.status(401).json({ error: 'Invalid API key' });
  return next();
}

module.exports = apiKeyAuth;
