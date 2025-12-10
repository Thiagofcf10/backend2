const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getCursos = async () => {
  const [rows] = await connection.execute('SELECT * FROM cursos');
  return rows;
};

const getCursosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM cursos');
  return rows[0].total;
};

const inserirCurso = async (curso) => {
  const { nome_curso, coordenador, duracao, descricao_curso } = curso;
  const query = `
    INSERT INTO cursos (nome_curso, coordenador, duracao, descricao_curso)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_curso || '',
    coordenador || '',
    duracao || 0,
    descricao_curso || ''
  ]);
  return { insertId: result.insertId };
};

const deleteCurso = async (id) => {
  const [removed] = await connection.execute('DELETE FROM cursos WHERE id = ?', [id]);
  return removed;
};

const atualizarCurso = async (id, curso) => {
  const { nome_curso, coordenador, duracao, descricao_curso } = curso;
  const query = 'UPDATE cursos SET nome_curso = ?, coordenador = ?, duracao = ?, descricao_curso = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_curso, coordenador, duracao, descricao_curso, id]);
  return updated;
};

module.exports = { getCursos, getCursosTotal, inserirCurso, deleteCurso, atualizarCurso };