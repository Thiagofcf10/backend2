const usuarioProjeto = require('../modelos/usuario_projeto');

const wrapGetSimple = (getFn, getTotalFn, name) => async (req, res) => {
  try {
    const data = await getFn();
    const total = typeof getTotalFn === 'function' ? await getTotalFn() : (Array.isArray(data) ? data.length : 0);
    return res.status(200).json({ message: `${name} obtidos com sucesso`, data, total });
  } catch (err) {
    console.error('Erro ao obter ' + name, err);
    return res.status(500).json({ error: err.message });
  }
};

const wrapInsert = (fn, name) => async (req, res) => {
  try {
    const result = await fn(req.body);
    return res.status(201).json({ message: `${name} criado com sucesso`, id: result.insertId });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const wrapDelete = (fn, name) => async (req, res) => {
  try {
    const result = await fn(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `${name} não encontrado` });
    }
    return res.status(200).json({ message: `${name} deletado com sucesso` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const wrapUpdate = (fn, name) => async (req, res) => {
  try {
    const result = await fn(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `${name} não encontrado` });
    }
    return res.status(200).json({ message: `${name} atualizado com sucesso` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET all usuario_projeto records
const getUsuarioProjeto = wrapGetSimple(
  usuarioProjeto.getUsuarioProjeto,
  usuarioProjeto.getUsuarioProjetoTotal,
  'Associações usuário-projeto'
);

// GET usuario_projeto by ID
const getUsuarioProjetoById = async (req, res) => {
  try {
    const record = await usuarioProjeto.getUsuarioProjetoById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Associação não encontrada' });
    }
    return res.status(200).json({ message: 'Associação obtida com sucesso', data: record });
  } catch (err) {
    console.error('Erro ao obter associação', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET usuario_projeto by usuario_id (all projects for a user)
const getProjetosByUsuario = async (req, res) => {
  try {
    const records = await usuarioProjeto.getUsuarioProjetoByUsuarioId(req.params.usuario_id);
    return res.status(200).json({
      message: 'Projetos do usuário obtidos com sucesso',
      data: records,
      total: records.length
    });
  } catch (err) {
    console.error('Erro ao obter projetos do usuário', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET usuario_projeto by projeto_id (all users in a project)
const getUsuariosByProjeto = async (req, res) => {
  try {
    const records = await usuarioProjeto.getUsuarioProjetoByProjetoId(req.params.projeto_id);
    return res.status(200).json({
      message: 'Usuários do projeto obtidos com sucesso',
      data: records,
      total: records.length
    });
  } catch (err) {
    console.error('Erro ao obter usuários do projeto', err);
    return res.status(500).json({ error: err.message });
  }
};

// POST new usuario_projeto
const inserirUsuarioProjeto = wrapInsert(usuarioProjeto.inserirUsuarioProjeto, 'Associação usuário-projeto');

// DELETE usuario_projeto by ID
const deleteUsuarioProjeto = wrapDelete(usuarioProjeto.deleteUsuarioProjeto, 'Associação');

// DELETE usuario_projeto by usuario_id and projeto_id
const deleteUsuarioProjetoByUsuarioAndProjeto = async (req, res) => {
  try {
    const { usuario_id, projeto_id } = req.params;
    const result = await usuarioProjeto.deleteUsuarioProjetoByUsuarioAndProjeto(usuario_id, projeto_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Associação não encontrada' });
    }
    return res.status(200).json({ message: 'Associação deletada com sucesso' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT update usuario_projeto
const atualizarUsuarioProjeto = wrapUpdate(usuarioProjeto.atualizarUsuarioProjeto, 'Associação');

module.exports = {
  getUsuarioProjeto,
  getUsuarioProjetoById,
  getProjetosByUsuario,
  getUsuariosByProjeto,
  inserirUsuarioProjeto,
  deleteUsuarioProjeto,
  deleteUsuarioProjetoByUsuarioAndProjeto,
  atualizarUsuarioProjeto
};
