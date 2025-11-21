const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getUsuarios = async () => {
  const [rows] = await connection.execute('SELECT * FROM usuarios');
  return rows;
};

const getUsuariosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
  return rows[0].total;
};

const inserirUsuario = async (usuario) => {
  const { nome_usuario, email, password, ativo } = usuario;
  const query = `
    INSERT INTO usuarios (nome_usuario, email, password, ativo)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_usuario || '',
    email || 'user@example.com',
    password || 'senha123',
    ativo == null ? true : ativo
  ]);
  return { insertId: result.insertId };
};

const deleteUsuario = async (id) => {
  const [removed] = await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);
  return removed;
};

const bcrypt = require('bcryptjs');

// Update user safely: preserve existing values for fields not provided and hash password when present
const atualizarUsuario = async (id, usuario) => {
  // Fetch current values
  const [rows] = await connection.execute('SELECT nome_usuario, email, password, ativo FROM usuarios WHERE id = ?', [id]);
  if (!rows || rows.length === 0) {
    throw new Error('Usuário não encontrado');
  }

  const current = rows[0];

  const nome_usuario = (typeof usuario.nome_usuario !== 'undefined') ? usuario.nome_usuario : current.nome_usuario;
  const email = (typeof usuario.email !== 'undefined') ? usuario.email : current.email;
  const ativo = (typeof usuario.ativo !== 'undefined') ? usuario.ativo : current.ativo;

  let password;
  if (typeof usuario.password !== 'undefined' && usuario.password !== null && usuario.password !== '') {
    // Hash new password
    password = await bcrypt.hash(String(usuario.password), 10);
  } else {
    // keep existing hashed password
    password = current.password;
  }

  const query = 'UPDATE usuarios SET nome_usuario = ?, email = ?, password = ?, ativo = ? WHERE id = ?';
  const [updated] = await connection.execute(query, [nome_usuario, email, password, ativo, id]);
  return updated;
};

module.exports = { getUsuarios, getUsuariosTotal, inserirUsuario, deleteUsuario, atualizarUsuario };