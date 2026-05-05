const connection = require('../DBmysql/conectaraoDB');

const getByCodigo = async (codigo) => {
  const [rows] = await connection.execute('SELECT * FROM codigo_matricula_pro WHERE codigo = ? LIMIT 1', [codigo]);
  return rows && rows.length ? rows[0] : null;
};

const insertCodigo = async (codigo, matricula_valida = 1) => {
  const [result] = await connection.execute(
    'INSERT INTO codigo_matricula_pro (codigo, matricula_valida) VALUES (?, ?) ON DUPLICATE KEY UPDATE matricula_valida = VALUES(matricula_valida)',
    [String(codigo), matricula_valida]
  );
  return { insertId: result.insertId };
};

module.exports = { getByCodigo, insertCodigo };
