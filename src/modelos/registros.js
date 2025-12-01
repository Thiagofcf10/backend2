const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getRegistros = async () => {
  const [rows] = await connection.execute('SELECT * FROM registros');
  return rows;
};

const getRegistrosByProjeto = async (projetoId) => {
  const [rows] = await connection.execute(
    `SELECT r.*, p.nome_projeto FROM registros r LEFT JOIN projetos p ON r.id_projeto = p.id WHERE r.id_projeto = ? ORDER BY r.data_reuniao ASC`,
    [projetoId]
  );
  return rows;
};

const getAllRegistrosWithProject = async () => {
  const [rows] = await connection.execute(
    `SELECT r.*, p.nome_projeto FROM registros r LEFT JOIN projetos p ON r.id_projeto = p.id ORDER BY p.id, r.data_reuniao ASC`
  );
  return rows;
};

const getRegistrosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM registros');
  return rows[0].total;
};

const inserirRegistro = async (registro) => {
  const { id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao, relatorio } = registro;
  const query = `
    INSERT INTO registros (id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao, relatorio)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    id_projeto || 1,
    data_reuniao || null,
    lista_participantes || '',
    duracao_reuniao || '00:00:00',
    titulo_reuniao || '',
    relatorio || null
  ]);
  return { insertId: result.insertId };
};

const deleteRegistro = async (id) => {
  const [removed] = await connection.execute('DELETE FROM registros WHERE id = ?', [id]);
  return removed;
};

const atualizarRegistro = async (id, registro) => {
  const { id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao, relatorio } = registro;
  const query = 'UPDATE registros SET id_projeto = ?, data_reuniao = ?, lista_participantes = ?, duracao_reuniao = ?, titulo_reuniao = ?, relatorio = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao, relatorio || null, id]);
  return updated;
};

module.exports = { getRegistros, getRegistrosTotal, inserirRegistro, deleteRegistro, atualizarRegistro, getRegistrosByProjeto, getAllRegistrosWithProject };