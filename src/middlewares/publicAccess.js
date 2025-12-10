const auth = require('../autenticacao/auth');
require('dotenv').config();

/**
 * Middleware permissivo para endpoints públicos (ex.: projetos publicados).
 * - Se houver x-api-key valida, marca req.apiKey = true
 * - Se houver Authorization Bearer <token> valida e popula req.user
 * - Se não houver credenciais válidas, define req.user = { role: 'guest' }
 * Não bloqueia a requisição; apenas tenta autenticar quando possível.
 */
module.exports = async function publicAccess(req, res, next) {
  const providedKey = req.headers['x-api-key'] || req.query.api_key;
  const expectedKey = process.env.API_KEY;
  if (providedKey && expectedKey && providedKey === expectedKey) {
    req.apiKey = true;
    return next();
  }

  // Try to parse bearer token if present
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = await auth.verifyToken(token);
      req.user = decoded;
      return next();
    } catch (err) {
      // If token invalid/expired, treat as guest (do not block)
      req.user = { role: 'guest' };
      return next();
    }
  }

  // No creds provided -> guest
  req.user = { role: 'guest' };
  return next();
};
