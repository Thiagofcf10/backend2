const connection = require('../DBmysql/conectaraoDB');

/**
 * Generic table query with optional search and limit/offset.
 * Supports additional filters for specific tables (e.g., projeto_id for arquivos).
 * @param {string} table - table name
 * @param {Array<string>} allowedFields - fields that may be searched with q
 * @param {object} options - { q, field, limit, offset, projeto_id, usuario_id, ... }
 */
async function queryTable(table, allowedFields = [], options = {}) {
  const { q, field, limit, offset, projeto_id, usuario_id } = options || {};
  let sql = `SELECT * FROM \`${table}\``;
  const params = [];
  const where = [];

  // Specific filters for arquivos table
  if (table === 'arquivos' && projeto_id) {
    where.push(`(projeto_id = ? OR id_meuprojeto = ?)`);
    params.push(projeto_id, projeto_id);
  }

  // Search filters
  if (q) {
    const like = `%${q}%`;
    if (field) {
      // only allow searching on explicitly allowed field
      if (allowedFields.includes(field)) {
        where.push(`\`${field}\` LIKE ?`);
        params.push(like);
      }
    } else if (allowedFields && allowedFields.length > 0) {
      const clauses = allowedFields.map(f => {
        params.push(like);
        return `\`${f}\` LIKE ?`;
      });
      where.push(`(${clauses.join(' OR ')})`);
    }
  }

  if (where.length) sql += ' WHERE ' + where.join(' AND ');

  if (limit) {
    sql += ' LIMIT ?';
    params.push(Number(limit));
    if (offset) {
      sql += ' OFFSET ?';
      params.push(Number(offset));
    }
  }

  const [rows] = await connection.execute(sql, params);
  return rows;
}

async function countTable(table, allowedFields = [], options = {}) {
  const { q, field, projeto_id, usuario_id } = options || {};
  let sql = `SELECT COUNT(*) as total FROM \`${table}\``;
  const params = [];
  const where = [];

  // Specific filters for arquivos table
  if (table === 'arquivos' && projeto_id) {
    where.push(`(projeto_id = ? OR id_meuprojeto = ?)`);
    params.push(projeto_id, projeto_id);
  }

  // Search filters
  if (q) {
    const like = `%${q}%`;
    if (field) {
      if (allowedFields.includes(field)) {
        where.push(`\`${field}\` LIKE ?`);
        params.push(like);
      }
    } else if (allowedFields && allowedFields.length > 0) {
      const clauses = allowedFields.map(f => {
        params.push(like);
        return `\`${f}\` LIKE ?`;
      });
      where.push(`(${clauses.join(' OR ')})`);
    }
  }

  if (where.length) sql += ' WHERE ' + where.join(' AND ');

  const [rows] = await connection.execute(sql, params);
  return rows[0] ? rows[0].total : 0;
}

module.exports = { queryTable, countTable };
