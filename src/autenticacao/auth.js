const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connection = require('../DBmysql/conectaraoDB');

const SECRET_KEY = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui_2024';
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Fazer login e retornar token JWT
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{token, user}>} Token JWT e dados do usuário
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }

  // Buscar usuário no banco
  const query = 'SELECT id, nome_usuario, email, password, ativo FROM usuarios WHERE email = ?';
  const [rows] = await connection.execute(query, [email]);

  if (rows.length === 0) {
    throw new Error('Usuário não encontrado');
  }

  const user = rows[0];

  if (!user.ativo) {
    throw new Error('Usuário inativo');
  }

  // Verificar senha
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Senha incorreta');
  }

  // Gerar token JWT
  // determine role: check professores and alunos tables
  let role = 'usuario';
  try {
    const [profRows] = await connection.execute('SELECT id FROM professores WHERE usuario_id = ? LIMIT 1', [user.id]);
    if (profRows && profRows.length > 0) role = 'professor';
    else {
      const [alRows] = await connection.execute('SELECT id FROM alunos WHERE usuario_id = ? LIMIT 1', [user.id]);
      if (alRows && alRows.length > 0) role = 'aluno';
    }
  } catch (e) {
    // ignore role-detection errors and fall back to 'usuario'
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, nome: user.nome_usuario, role },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRY }
  );

  return {
    token,
    user: {
      id: user.id,
      nome_usuario: user.nome_usuario,
      email: user.email,
      role
    }
  };
};

/**
 * Gerar token para convidado (sem usuário)
 * @param {string} [expiry] - string de expiração tipo '2h' (opcional)
 */
const generateGuestToken = (expiry) => {
  const guestExpiry = expiry || process.env.GUEST_TOKEN_EXPIRY || '2h';
  const payload = { role: 'guest', scope: ['public_projects'] };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: guestExpiry });
  return { token };
};

/**
 * Registrar novo usuário (opcional)
 * @param {string} nome_usuario - Nome do usuário
 * @param {string} email - Email único
 * @param {string} password - Senha
 * @returns {Promise<{id, nome_usuario, email}>} Dados do novo usuário
 */
const register = async (nome_usuario, email, password) => {
  if (!nome_usuario || !email || !password) {
    throw new Error('Nome, email e senha são obrigatórios');
  }

  // Verificar se email já existe
  const checkQuery = 'SELECT id FROM usuarios WHERE email = ?';
  const [existing] = await connection.execute(checkQuery, [email]);

  if (existing.length > 0) {
    throw new Error('Email já registrado');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Inserir novo usuário
  const insertQuery = `
    INSERT INTO usuarios (nome_usuario, email, password, ativo)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await connection.execute(insertQuery, [nome_usuario, email, hashedPassword, true]);

  return {
    id: result.insertId,
    nome_usuario,
    email
  };
};

/**
 * Verificar se token é válido
 * @param {string} token - Token JWT
 * @returns {Promise<{id, email, nome}>} Dados do usuário decodificado
 */
const verifyToken = async (token) => {
  if (!token) {
    throw new Error('Token não fornecido');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw new Error('Token inválido');
  }
};

/**
 * Middleware para proteger rotas
 * Verifica se o token está no header Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai token após "Bearer "

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido', message: 'Acesso negado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Armazena dados do usuário na requisição
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(403).json({ error: message, message });
  }
};

/**
 * Decodificar token (sem verificação)
 * Útil apenas para debug
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
};

module.exports = {
  login,
  register,
  generateGuestToken,
  verifyToken,
  authenticateToken,
  decodeToken,
  SECRET_KEY,
  TOKEN_EXPIRY
};
