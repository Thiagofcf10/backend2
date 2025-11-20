const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getTurmas = async () => {
  const [rows] = await connection.execute('SELECT * FROM turmas');
  return rows;
};

const getTurmasTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM turmas');
  return rows[0].total;
};

const inserirTurma = async (turma) => {
  const { cod_turma, turno, quantidade_alunos, id_curso } = turma;
  const query = `
    INSERT INTO turmas (cod_turma, turno, quantidade_alunos, id_curso)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [cod_turma || '', turno || '', quantidade_alunos || 0, id_curso || 1]);
  return { insertId: result.insertId };
};

const deleteTurma = async (id) => {
  const [removed] = await connection.execute('DELETE FROM turmas WHERE id = ?', [id]);
  return removed;
};

const atualizarTurma = async (id, turma) => {
  const { cod_turma, turno, quantidade_alunos, id_curso } = turma;
  const query = 'UPDATE turmas SET cod_turma = ?, turno = ?, quantidade_alunos = ?, id_curso = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [cod_turma, turno, quantidade_alunos, id_curso, id]);
  return updated;
};

module.exports = { getTurmas, getTurmasTotal, inserirTurma, deleteTurma, atualizarTurma };