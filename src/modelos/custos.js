const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getCustos = async (projetoId = null) => {
  if (projetoId) {
    const [rows] = await connection.execute('SELECT * FROM custos WHERE id_projeto = ?', [projetoId]);
    return rows;
  }
  const [rows] = await connection.execute('SELECT * FROM custos');
  return rows;
};

const getCustosTotal = async (projetoId = null) => {
  if (projetoId) {
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM custos WHERE id_projeto = ?', [projetoId]);
    return rows[0].total;
  }
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM custos');
  return rows[0].total;
};

const inserirCusto = async (custo) => {
  const { id_projeto, equipamento, custos_equipamento, insumos, custos_insumos } = custo;
  const query = `
    INSERT INTO custos (id_projeto, equipamento, custos_equipamento, insumos, custos_insumos)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    id_projeto || 1,
    equipamento || '',
    custos_equipamento || 0.0,
    insumos || '',
    custos_insumos || 0.0
  ]);
  return { insertId: result.insertId };
};

const deleteCusto = async (id) => {
  const [removed] = await connection.execute('DELETE FROM custos WHERE id = ?', [id]);
  return removed;
};

const atualizarCusto = async (id, custo) => {
  const { id_projeto, equipamento, custos_equipamento, insumos, custos_insumos } = custo;
  const query = 'UPDATE custos SET id_projeto = ?, equipamento = ?, custos_equipamento = ?, insumos = ?, custos_insumos = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [id_projeto, equipamento, custos_equipamento, insumos, custos_insumos, id]);
  return updated;
};

module.exports = { getCustos, getCustosTotal, inserirCusto, deleteCusto, atualizarCusto };