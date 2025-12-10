const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getUsuarioProjeto = async () => {
  const [rows] = await connection.execute('SELECT * FROM usuario_projeto');
  return rows;
};

const getUsuarioProjetoTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM usuario_projeto');
  return rows[0].total;
};

const getUsuarioProjetoById = async (id) => {
  const [rows] = await connection.execute('SELECT * FROM usuario_projeto WHERE id = ?', [id]);
  return rows[0] || null;
};

const getUsuarioProjetoByUsuarioId = async (usuario_id) => {
  const [rows] = await connection.execute('SELECT * FROM usuario_projeto WHERE usuario_id = ?', [usuario_id]);
  return rows;
};

const getUsuarioProjetoByProjetoId = async (projeto_id) => {
  const [rows] = await connection.execute('SELECT * FROM usuario_projeto WHERE projeto_id = ?', [projeto_id]);
  return rows;
};

const inserirUsuarioProjeto = async (usuarioProjeto) => {
  const { usuario_id, projeto_id, funcao } = usuarioProjeto;
  const query = `
    INSERT INTO usuario_projeto (usuario_id, projeto_id, funcao, data_associacao)
    VALUES (?, ?, ?, NOW())
  `;

  try {
    const [result] = await connection.execute(query, [
      usuario_id,
      projeto_id,
      funcao || 'colaborador'
    ]);
    return { insertId: result.insertId };
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('Este usuário já está associado a este projeto');
    }
    throw err;
  }
};

const deleteUsuarioProjeto = async (id) => {
  const [removed] = await connection.execute('DELETE FROM usuario_projeto WHERE id = ?', [id]);
  return removed;
};

const deleteUsuarioProjetoByUsuarioAndProjeto = async (usuario_id, projeto_id) => {
  const [removed] = await connection.execute(
    'DELETE FROM usuario_projeto WHERE usuario_id = ? AND projeto_id = ?',
    [usuario_id, projeto_id]
  );
  return removed;
};

const atualizarUsuarioProjeto = async (id, usuarioProjeto) => {
  const { usuario_id, projeto_id, funcao } = usuarioProjeto;
  const query = 'UPDATE usuario_projeto SET usuario_id = ?, projeto_id = ?, funcao = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [usuario_id, projeto_id, funcao || 'colaborador', id]);
  return updated;
};

module.exports = {
  getUsuarioProjeto,
  getUsuarioProjetoTotal,
  getUsuarioProjetoById,
  getUsuarioProjetoByUsuarioId,
  getUsuarioProjetoByProjetoId,
  inserirUsuarioProjeto,
  deleteUsuarioProjeto,
  deleteUsuarioProjetoByUsuarioAndProjeto,
  atualizarUsuarioProjeto
};
