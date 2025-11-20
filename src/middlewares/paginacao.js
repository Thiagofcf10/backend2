/**
 * Middleware para extrair e validar parâmetros de paginação
 * Query params: ?page=1&limit=10
 * 
 * Adiciona ao req.pagination: { page, limit, offset }
 */
const paginationMiddleware = (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  // Validações
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Máximo 100 registros por página

  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset
  };

  next();
};

/**
 * Helper para calcular informações de paginação na resposta
 * @param {number} page - Página atual
 * @param {number} limit - Itens por página
 * @param {number} total - Total de registros no banco
 * @returns {object} Metadata de paginação
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: total,
    totalPages: totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

module.exports = {
  paginationMiddleware,
  getPaginationMeta
};
