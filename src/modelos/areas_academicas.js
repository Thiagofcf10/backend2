const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getAreas = async () => {
  const [rows] = await connection.execute('SELECT * FROM areas_academicas');
  return rows;
};

const getAreasAcademicasTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM areas_academicas');
  return rows[0].total;
};

const inserirAreaAcademica = async (area) => {
  const { codigo_area, descricao_area, nome_area } = area;
  const query = `
    INSERT INTO areas_academicas (codigo_area, descricao_area, nome_area)
    VALUES (?, ?, ?)
  `;

  const [result] = await connection.execute(query, [codigo_area || 0, descricao_area || '', nome_area || '']);
  return { insertId: result.insertId };
};

const deleteAreaAcademica = async (id) => {
  const [removed] = await connection.execute('DELETE FROM areas_academicas WHERE id = ?', [id]);
  return removed;
};

const atualizarAreaAcademica = async (id, area) => {
  const { codigo_area, descricao_area, nome_area } = area;
  const query = 'UPDATE areas_academicas SET codigo_area = ?, descricao_area = ?, nome_area = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [codigo_area, descricao_area, nome_area, id]);
  return updated;
};

  module.exports = { getAreas, getAreasAcademicasTotal, inserirAreaAcademica, deleteAreaAcademica, atualizarAreaAcademica };