const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getRegistros = async () => {
  const [rows] = await connection.execute('SELECT * FROM registros');
  return rows;
};

const getRegistrosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM registros');
  return rows[0].total;
};

const inserirRegistro = async (registro) => {
  const { id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao } = registro;
  const query = `
    INSERT INTO registros (id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    id_projeto || 1,
    data_reuniao || null,
    lista_participantes || '',
    duracao_reuniao || '00:00:00',
    titulo_reuniao || ''
  ]);
  return { insertId: result.insertId };
};

const deleteRegistro = async (id) => {
  const [removed] = await connection.execute('DELETE FROM registros WHERE id = ?', [id]);
  return removed;
};

const atualizarRegistro = async (id, registro) => {
  const { id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao } = registro;
  const query = 'UPDATE registros SET id_projeto = ?, data_reuniao = ?, lista_participantes = ?, duracao_reuniao = ?, titulo_reuniao = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [id_projeto, data_reuniao, lista_participantes, duracao_reuniao, titulo_reuniao, id]);
  return updated;
};

module.exports = { getRegistros, getRegistrosTotal, inserirRegistro, deleteRegistro, atualizarRegistro };