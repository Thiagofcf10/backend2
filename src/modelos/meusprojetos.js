const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getMeusProjetos = async () => {
  const [rows] = await connection.execute('SELECT * FROM meusprojetos');
  return rows;
};

const getMeusProjetosTotal = async () => {
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM meusprojetos');
  return rows[0].total;
};

const inserirMeuProjeto = async (projeto) => {
  const { nome_projeto, usuarios, data_publicacao, area_de_pesquisa, coordenador } = projeto;
  const query = `
    INSERT INTO meusprojetos (nome_projeto, usuarios, data_publicacao, area_de_pesquisa, coordenador)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    nome_projeto || '',
    usuarios || 1,
    data_publicacao || null,
    area_de_pesquisa || '',
    coordenador || ''
  ]);
  return { insertId: result.insertId };
};

const deleteMeuProjeto = async (id) => {
  const [removed] = await connection.execute('DELETE FROM meusprojetos WHERE id = ?', [id]);
  return removed;
};

const atualizarMeuProjeto = async (id, projeto) => {
  const { nome_projeto, usuarios, data_publicacao, area_de_pesquisa, coordenador } = projeto;
  const query = 'UPDATE meusprojetos SET nome_projeto = ?, usuarios = ?, data_publicacao = ?, area_de_pesquisa = ?, coordenador = ? WHERE id = ?';

  const [updated] = await connection.execute(query, [nome_projeto, usuarios, data_publicacao, area_de_pesquisa, coordenador, id]);
  return updated;
};

module.exports = { getMeusProjetos, getMeusProjetosTotal, inserirMeuProjeto, deleteMeuProjeto, atualizarMeuProjeto };