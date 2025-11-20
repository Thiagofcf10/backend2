const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getProfessores = async () => {
  const [rows] = await connection.execute('SELECT * FROM professores');
  return rows;
};

const getProfessoresTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM professores');
  return rows[0].total;
};

const inserirProfessor = async (professor) => {
  const { nome_professor, matricula_professor, id_area, usuario_id, telefone } = professor;

  const query = `
    INSERT INTO professores (nome_professor, matricula_professor, id_area, usuario_id, telefone)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_professor || 'Professor sem nome',
    matricula_professor || 0,
    id_area || 1,
    usuario_id || null,
    telefone || ''
  ]);

  return { insertId: result.insertId };
};

const deleteProfessor = async (id) => {
  const [removed] = await connection.execute('DELETE FROM professores WHERE id = ?', [id]);
  return removed;
};

const atualizarProfessor = async (id, professor) => {
  const { nome_professor, telefone, id_area } = professor;
  const query = 'UPDATE professores SET nome_professor = ?, telefone = ?, id_area = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_professor, telefone, id_area, id]);
  return updated;
};

module.exports = { getProfessores, getProfessoresTotal, inserirProfessor, deleteProfessor, atualizarProfessor }; // Exporta a função para ser usada em outras partes do aplicativo
