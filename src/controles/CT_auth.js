const auth = require('../autenticacao/auth');

/**
 * POST /login - Fazer login
 * Body: { email, password }
 * Response: { token, user }
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth.login(email, password);
    
    return res.status(200).json({
      message: 'Login realizado com sucesso',
      ...result
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    const statusCode = err.message === 'Usuário não encontrado' || err.message === 'Senha incorreta' ? 401 : 400;
    return res.status(statusCode).json({ error: err.message });
  }
};

/**
 * POST /register - Registrar novo usuário
 * Body: { nome_usuario, email, password }
 * Response: { user }
 */
const registerController = async (req, res) => {
  try {
    const { nome_usuario, email, password } = req.body;
    
    if (!nome_usuario || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const user = await auth.register(nome_usuario, email, password);
    
    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user
    });
  } catch (err) {
    console.error('Erro no registro:', err.message);
    const statusCode = err.message === 'Email já registrado' ? 409 : 400;
    return res.status(statusCode).json({ error: err.message });
  }
};

/**
 * POST /guest-token - Gerar token temporário para convidados (sem necessidade de autenticação)
 * Body (opcional): { expiry: '1h' }
 * Response: { token }
 */
const guestTokenController = (req, res) => {
  try {
    const { expiry } = req.body || {};
    const result = auth.generateGuestToken ? auth.generateGuestToken(expiry) : auth.generateGuestToken(expiry);
    return res.status(200).json({ message: 'Guest token gerado', token: result.token });
  } catch (err) {
    console.error('Erro ao gerar guest token:', err);
    return res.status(500).json({ error: 'Erro ao gerar guest token' });
  }
};

/**
 * GET /verify - Verificar se token é válido
 * Header: Authorization: Bearer <token>
 * Response: { user }
 */
const verifyController = (req, res) => {
  // O middleware authenticateToken já verificou o token
  return res.status(200).json({
    message: 'Token válido',
    user: req.user
  });
};

/**
 * POST /logout - Logout (apenas para frontend, backend não precisa fazer nada)
 */
const logoutController = (req, res) => {
  return res.status(200).json({
    message: 'Logout realizado. Remova o token do localStorage.'
  });
};

module.exports = {
  loginController,
  registerController,
  guestTokenController,
  verifyController,
  logoutController
};
