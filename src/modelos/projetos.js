const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getProjetos = async () => {
  const [rows] = await connection.execute('SELECT * FROM projetos');
  return rows;
};

const getProjetosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM projetos');
  return rows[0].total;
};

const inserirProjeto = async (projeto) => {
  const { nome_projeto, orientador, coorientador, matricula_alunos, published, published_at } = projeto;
  const query = `
    INSERT INTO projetos (nome_projeto, orientador, coorientador, matricula_alunos, published, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_projeto || '',
    orientador || 1,
    coorientador || '',
    matricula_alunos || '',
    published ? 1 : 0,
    published_at || null
  ]);
  return { insertId: result.insertId };
};

const deleteProjeto = async (id) => {
  const [removed] = await connection.execute('DELETE FROM projetos WHERE id = ?', [id]);
  return removed;
};

const atualizarProjeto = async (id, projeto) => {
  const { nome_projeto, orientador, coorientador, matricula_alunos, published, published_at } = projeto;
  const query = 'UPDATE projetos SET nome_projeto = ?, orientador = ?, coorientador = ?, matricula_alunos = ?, published = ?, published_at = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_projeto, orientador, coorientador, matricula_alunos, published ? 1 : 0, published_at || null, id]);
  return updated;
};

// Get projects where the given user is the orientador
const getProjetosByOrientador = async (orientadorId) => {
  const [rows] = await connection.execute('SELECT * FROM projetos WHERE orientador = ?', [orientadorId]);
  return rows;
};

// Get projects which list the given matricula in the matricula_alunos CSV/text column
const getProjetosByMatricula = async (matricula) => {
  const cleaned = String(matricula).trim();
  const like = `%,${cleaned},%`;
  const [rows] = await connection.execute("SELECT * FROM projetos WHERE CONCAT(',', REPLACE(IFNULL(matricula_alunos, ''), ' ', ''), ',') LIKE ?", [like]);
  return rows;
};

// Get only published projects (for public listing)
const getProjetosPublicos = async () => {
  const [rows] = await connection.execute('SELECT * FROM projetos WHERE published = 1 ORDER BY published_at DESC');
  return rows;
};

// Get single projeto by id
const getProjetoById = async (id) => {
  const [rows] = await connection.execute('SELECT * FROM projetos WHERE id = ?', [id]);
  return rows && rows.length ? rows[0] : null;
};

// Set publish state for a project (published boolean). If publishing, set published_at to now; if unpublishing, clear published_at.
const publicarProjeto = async (id, published) => {
  const publishedAt = published ? new Date() : null;
  const query = 'UPDATE projetos SET published = ?, published_at = ? WHERE id = ?';
  const [updated] = await connection.execute(query, [published ? 1 : 0, publishedAt ? publishedAt.toISOString().slice(0, 19).replace('T', ' ') : null, id]);
  return updated;
};

module.exports = { getProjetos, getProjetosTotal, inserirProjeto, deleteProjeto, atualizarProjeto, getProjetosByOrientador, getProjetosByMatricula, getProjetosPublicos, publicarProjeto, getProjetoById };