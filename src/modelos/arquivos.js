const connection = require('../DBmysql/conectaraoDB'); // Importa a conexão MySQL

const getArquivos = async (projetoId = null) => {
  if (projetoId) {
    const [rows] = await connection.execute('SELECT * FROM arquivos WHERE projeto_id = ? OR id_meuprojeto = ?', [projetoId, projetoId]);
    return rows;
  }
  const [rows] = await connection.execute('SELECT * FROM arquivos');
  return rows;
};

const getArquivosTotal = async (projetoId = null) => {
  if (projetoId) {
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM arquivos WHERE projeto_id = ? OR id_meuprojeto = ?', [projetoId, projetoId]);
    return rows[0].total;
  }
  const [rows] = await connection.execute('SELECT COUNT(*) as total FROM arquivos');
  return rows[0].total;
};

// Obtém arquivos de um projeto específico
const getArquivosPorProjeto = async (projetoId) => {
  const [rows] = await connection.execute('SELECT * FROM arquivos WHERE projeto_id = ? OR id_meuprojeto = ?', [projetoId, projetoId]);
  return rows;
};

const inserirArquivo = async (arquivo) => {
  const { 
    projeto_id,
    id_meuprojeto, 
    resumo, 
    justificativa, 
    objetivo, 
    sumario, 
    introducao, 
    bibliografia, 
    nome_arquivo, 
    caminho_arquivo, 
    tipo_arquivo, 
    tamanho_arquivo 
  } = arquivo;
  
  const query = `
    INSERT INTO arquivos (projeto_id, id_meuprojeto, resumo, justificativa, objetivo, sumario, introducao, bibliografia, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho_arquivo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    projeto_id || id_meuprojeto || 1,
    id_meuprojeto || 1,
    resumo || '',
    justificativa || '',
    objetivo || '',
    sumario || '',
    introducao || '',
    bibliografia || '',
    nome_arquivo || null,
    caminho_arquivo || null,
    tipo_arquivo || null,
    tamanho_arquivo || 0
  ]);

  return { insertId: result.insertId };
};

const deleteArquivo = async (id) => {
  const [removed] = await connection.execute('DELETE FROM arquivos WHERE id = ?', [id]);
  return removed;
};

const atualizarArquivo = async (id, arquivo) => {
  const { resumo, justificativa, objetivo, sumario, introducao, bibliografia, projeto_id } = arquivo;
  const query = `
    UPDATE arquivos SET resumo = ?, justificativa = ?, objetivo = ?, sumario = ?, introducao = ?, bibliografia = ?, projeto_id = ? WHERE id = ?
  `;

  const [updated] = await connection.execute(query, [resumo, justificativa, objetivo, sumario, introducao, bibliografia, projeto_id, id]);
  return updated;
};

module.exports = { getArquivos, getArquivosTotal, getArquivosPorProjeto, inserirArquivo, deleteArquivo, atualizarArquivo };
