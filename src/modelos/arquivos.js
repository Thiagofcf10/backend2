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

// Get single arquivo by id
const getArquivoById = async (id) => {
  const [rows] = await connection.execute('SELECT * FROM arquivos WHERE id = ?', [id]);
  return rows && rows.length ? rows[0] : null;
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
  // Use null when id_meuprojeto or projeto_id are not provided to avoid foreign key issues
  const projParam = projeto_id || id_meuprojeto || null;
  const idMeuParam = id_meuprojeto || null;

  const [result] = await connection.execute(query, [
    projParam,
    idMeuParam,
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

const atualizarArquivo = async (id, arquivo, file) => {
  // arquivo: object with metadata fields; file: multer file object if a new file was uploaded
  // First, if a new file is provided, remove the old file from disk (if exists)
  if (file) {
    try {
      const [rows] = await connection.execute('SELECT caminho_arquivo FROM arquivos WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const oldPath = rows[0].caminho_arquivo;
        if (oldPath) {
          const fs = require('fs');
          try {
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          } catch (e) {
            // log but continue
            console.error('Erro removendo arquivo antigo:', e);
          }
        }
      }
    } catch (e) {
      // ignore selection error and proceed with update
      console.error('Erro buscando caminho_arquivo:', e);
    }
  }

  // Build dynamic update to include file fields when provided
  const fields = [];
  const params = [];

  // metadata
  if (arquivo.resumo !== undefined) { fields.push('resumo = ?'); params.push(arquivo.resumo); }
  if (arquivo.justificativa !== undefined) { fields.push('justificativa = ?'); params.push(arquivo.justificativa); }
  if (arquivo.objetivo !== undefined) { fields.push('objetivo = ?'); params.push(arquivo.objetivo); }
  if (arquivo.sumario !== undefined) { fields.push('sumario = ?'); params.push(arquivo.sumario); }
  if (arquivo.introducao !== undefined) { fields.push('introducao = ?'); params.push(arquivo.introducao); }
  if (arquivo.bibliografia !== undefined) { fields.push('bibliografia = ?'); params.push(arquivo.bibliografia); }
  if (arquivo.projeto_id !== undefined) { fields.push('projeto_id = ?'); params.push(arquivo.projeto_id); }

  // file fields (if new file uploaded)
  if (file) {
    fields.push('nome_arquivo = ?'); params.push(file.originalname || null);
    fields.push('caminho_arquivo = ?'); params.push(file.path || null);
    fields.push('tipo_arquivo = ?'); params.push(file.mimetype || null);
    fields.push('tamanho_arquivo = ?'); params.push(file.size || 0);
  }

  if (fields.length === 0) {
    // nothing to update
    return { affectedRows: 0 };
  }

  const query = `UPDATE arquivos SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  const [updated] = await connection.execute(query, params);
  return updated;
};

module.exports = { getArquivos, getArquivosTotal, getArquivosPorProjeto, getArquivoById, inserirArquivo, deleteArquivo, atualizarArquivo };
