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
  const { nome_projeto, orientador, coorientador, matricula_alunos } = projeto;
  const query = `
    INSERT INTO projetos (nome_projeto, orientador, coorientador, matricula_alunos)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_projeto || '',
    orientador || 1,
    coorientador || '',
    matricula_alunos || ''
  ]);
  return { insertId: result.insertId };
};

const deleteProjeto = async (id) => {
  const [removed] = await connection.execute('DELETE FROM projetos WHERE id = ?', [id]);
  return removed;
};

const atualizarProjeto = async (id, projeto) => {
  const { nome_projeto, orientador, coorientador, matricula_alunos } = projeto;
  const query = 'UPDATE projetos SET nome_projeto = ?, orientador = ?, coorientador = ?, matricula_alunos = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_projeto, orientador, coorientador, matricula_alunos, id]);
  return updated;
};

module.exports = { getProjetos, getProjetosTotal, inserirProjeto, deleteProjeto, atualizarProjeto };