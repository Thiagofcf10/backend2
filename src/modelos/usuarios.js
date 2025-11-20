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

const atualizarUsuario = async (id, usuario) => {
  const { nome_usuario, email, password, ativo } = usuario;
  const query = 'UPDATE usuarios SET nome_usuario = ?, email = ?, password = ?, ativo = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_usuario, email, password, ativo, id]);
  return updated;
};

module.exports = { getUsuarios, getUsuariosTotal, inserirUsuario, deleteUsuario, atualizarUsuario };