const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getAlunos = async () => {
  const [rows] = await connection.execute('SELECT * FROM alunos');
  return rows;
};

const getAlunosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM alunos');
  return rows[0].total;
};

const inserirAluno = async (aluno) => {
  const { nome_aluno, matricula_aluno, id_curso, usuario_id, telefone } = aluno;
  const query = `
    INSERT INTO alunos (nome_aluno, matricula_aluno, id_curso, usuario_id, telefone)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_aluno || 'Aluno sem nome',
    matricula_aluno || 0,
    id_curso || 1,
    usuario_id || null,
    telefone || ''
  ]);

  return { insertId: result.insertId };
};

const deleteAluno = async (id) => {
  const [removed] = await connection.execute('DELETE FROM alunos WHERE id = ?', [id]);
  return removed;
};

const atualizarAluno = async (id, aluno) => {
  const { nome_aluno, telefone, id_curso } = aluno;
  const query = 'UPDATE alunos SET nome_aluno = ?, telefone = ?, id_curso = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_aluno, telefone, id_curso, id]);
  return updated;
};

const getAlunoById = async (id) => {
  const [rows] = await connection.execute('SELECT * FROM alunos WHERE id = ?', [id]);
  return rows && rows.length ? rows[0] : null;
};

// Get aluno record by linked usuario_id
const getAlunoByUsuarioId = async (usuario_id) => {
  const [rows] = await connection.execute('SELECT * FROM alunos WHERE usuario_id = ? LIMIT 1', [usuario_id]);
  return rows && rows.length ? rows[0] : null;
};

module.exports = { getAlunos, getAlunosTotal, inserirAluno, deleteAluno, atualizarAluno, getAlunoById, getAlunoByUsuarioId }; // Exporta a função para ser usada em outras partes do aplicativo