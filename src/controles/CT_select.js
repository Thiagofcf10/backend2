const alunos = require('../modelos/alunos');
const professores = require('../modelos/professores');
const areas = require('../modelos/areas_academicas');
const arquivos = require('../modelos/arquivos');
const cursos = require('../modelos/cursos');
const custos = require('../modelos/custos');
const meusprojetos = require('../modelos/meusprojetos');
const projetos = require('../modelos/projetos');
const registros = require('../modelos/registros');
const turmas = require('../modelos/turmas');
const usuarios = require('../modelos/usuarios');
const common = require('../modelos/common');

// Allowed searchable fields per table (keeps search safe)
const searchable = {
  usuarios: ['nome_usuario', 'email'],
  alunos: ['nome_aluno', 'matricula_aluno'],
  professores: ['nome_professor', 'matricula_professor'],
  cursos: ['nome_curso', 'descricao_curso'],
  turmas: ['cod_turma'],
  areas_academicas: ['nome_area', 'descricao_area'],
  projetos: ['nome_projeto', 'descricao'],
  custos: ['descricao'],
  meusprojetos: ['nome_projeto'],
  registros: ['acao', 'tabela'],
  arquivos: ['nome', 'tipo']
};

const wrapGetSimple = (getFn, getTotalFn, name, table) => async (req, res) => {
  try {
    // parse optional query params for filtering
    const { q, field, limit, offset } = req.query || {};

    if (q || limit || offset || field) {
      // Use parameterized generic query
      const allowed = searchable[table] || [];
      const options = { q, field, limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined };
      const data = await common.queryTable(table, allowed, options);
      const total = await common.countTable(table, allowed, { q, field });
      return res.status(200).json({ message: `${name} obtidos com sucesso`, data, total });
    }

    // Default: return all records via model
    const data = await getFn();
    const total = typeof getTotalFn === 'function' ? await getTotalFn() : (Array.isArray(data) ? data.length : 0);
    return res.status(200).json({ message: `${name} obtidos com sucesso`, data, total });
  } catch (err) {
    console.error('Erro ao obter ' + name, err);
    return res.status(500).json({ error: err.message });
  }
};

const getAlunos = wrapGetSimple(alunos.getAlunos, alunos.getAlunosTotal, 'Alunos', 'alunos');
const getProfessores = wrapGetSimple(professores.getProfessores, professores.getProfessoresTotal, 'Professores', 'professores');
const getAreasAcademicas = wrapGetSimple(areas.getAreas, areas.getAreasAcademicasTotal, 'Áreas acadêmicas', 'areas_academicas');
// Custom getArquivos: allow filtering by projeto_id query param
const getArquivos = async (req, res) => {
  try {
    const projetoId = req.query && req.query.projeto_id;
    if (projetoId) {
      const rows = await arquivos.getArquivos(projetoId);
      return res.status(200).json({ message: 'Arquivos obtidos com sucesso', data: rows, total: rows.length });
    }

    // fallback to default behavior
    const data = await arquivos.getArquivos();
    const total = await arquivos.getArquivosTotal();
    return res.status(200).json({ message: 'Arquivos obtidos com sucesso', data, total });
  } catch (err) {
    console.error('Erro ao obter Arquivos', err);
    return res.status(500).json({ error: err.message });
  }
};
const getCursos = wrapGetSimple(cursos.getCursos, cursos.getCursosTotal, 'Cursos', 'cursos');
// Custom getCustos: allow filtering by projeto_id query param
const getCustos = async (req, res) => {
  try {
    const projetoId = req.query && req.query.projeto_id;
    if (projetoId) {
      const rows = await custos.getCustos(projetoId);
      return res.status(200).json({ message: 'Custos obtidos com sucesso', data: rows, total: rows.length });
    }

    // fallback to default behavior
    const data = await custos.getCustos();
    const total = await custos.getCustosTotal();
    return res.status(200).json({ message: 'Custos obtidos com sucesso', data, total });
  } catch (err) {
    console.error('Erro ao obter Custos', err);
    return res.status(500).json({ error: err.message });
  }
};
const getMeusProjetos = wrapGetSimple(meusprojetos.getMeusProjetos, meusprojetos.getMeusProjetosTotal, 'Meus projetos', 'meusprojetos');
const getProjetos = wrapGetSimple(projetos.getProjetos, projetos.getProjetosTotal, 'Projetos', 'projetos');
// Public projects
const getProjetosPublicos = async (req, res) => {
  try {
    const rows = await projetos.getProjetosPublicos();
    return res.status(200).json({ message: 'Projetos públicos obtidos com sucesso', data: rows, total: rows.length });
  } catch (err) {
    console.error('Erro ao obter projetos públicos', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get projects for a given user based on role/type
const getMeusProjetosByUsuario = async (req, res) => {
  try {
    const usuario_id = req.params && req.params.usuario_id;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id é necessário' });

    const tipo = (req.query.tipo || '').toLowerCase();

    if (tipo === 'professor') {
      const rows = await projetos.getProjetosByOrientador(usuario_id);
      return res.status(200).json({ message: 'Projetos do professor obtidos com sucesso', data: rows, total: rows.length });
    }

    if (tipo === 'aluno') {
      // find aluno record by usuario_id to get matricula
      const aluno = await alunos.getAlunoByUsuarioId(usuario_id);
      if (!aluno || !aluno.matricula_aluno) {
        return res.status(200).json({ message: 'Nenhum projeto encontrado para este aluno', data: [], total: 0 });
      }
      const matricula = aluno.matricula_aluno;
      const rows = await projetos.getProjetosByMatricula(matricula);
      return res.status(200).json({ message: 'Projetos do aluno obtidos com sucesso', data: rows, total: rows.length });
    }

    // if no tipo provided, return bad request
    return res.status(400).json({ error: 'Parâmetro tipo é necessário e deve ser "professor" ou "aluno"' });
  } catch (err) {
    console.error('Erro ao obter meus projetos por usuário', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get single arquivo by id
const getArquivoById = async (req, res) => {
  try {
    const id = req.params && req.params.id;
    if (!id) return res.status(400).json({ error: 'ID do arquivo é necessário' });
    const data = await arquivos.getArquivoById(id);
    if (!data) return res.status(404).json({ error: 'Arquivo não encontrado' });
    return res.status(200).json({ message: 'Arquivo obtido com sucesso', data });
  } catch (err) {
    console.error('Erro ao obter arquivo por id', err);
    return res.status(500).json({ error: err.message });
  }
};

// single projeto by id
const getProjetoById = async (req, res) => {
  try {
    const id = req.params && req.params.id;
    if (!id) return res.status(400).json({ error: 'ID do projeto é necessário' });
    const data = await projetos.getProjetoById(id);
    if (!data) return res.status(404).json({ error: 'Projeto não encontrado' });
    return res.status(200).json({ message: 'Projeto obtido com sucesso', data });
  } catch (err) {
    console.error('Erro ao obter projeto por id', err);
    return res.status(500).json({ error: err.message });
  }
};
const getRegistros = wrapGetSimple(registros.getRegistros, registros.getRegistrosTotal, 'Registros', 'registros');

// Generate a plain-text export of registros. If ?projeto_id=ID is provided, export only that project's registros;
// otherwise export registros grouped by project.
const getRegistrosTxt = async (req, res) => {
  try {
    const projetoId = req.query && req.query.projeto_id;

    let rows = [];
    if (projetoId) {
      rows = await registros.getRegistrosByProjeto(projetoId);
      // single project export
      const projectName = (rows && rows.length && rows[0].nome_projeto) ? rows[0].nome_projeto : `projeto_${projetoId}`;
      let content = `Registros de reuniões - Projeto: ${projectName} (ID: ${projetoId})\n\n`;
      if (!rows || rows.length === 0) content += 'Nenhum registro encontrado.\n';
      else {
        rows.forEach((r, idx) => {
          content += `#${idx + 1} - Data: ${r.data_reuniao} | Duração: ${r.duracao_reuniao} | Título: ${r.titulo_reuniao}\n`;
          content += `Participantes: ${r.lista_participantes}\n`;
          content += `Relatório:\n${r.relatorio || ''}\n`;
          content += '----------------------------------------\n';
        });
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="registros_projeto_${projetoId}.txt"`);
      return res.status(200).send(content);
    }

    // export all registros grouped by project
    rows = await registros.getAllRegistrosWithProject();
    let content = `Registros de reuniões - Todos os projetos\n\n`;
    if (!rows || rows.length === 0) content += 'Nenhum registro encontrado.\n';
    else {
      // group by projeto id
      const grouped = {};
      rows.forEach((r) => {
        const pid = r.id_projeto || 'sem_projeto';
        if (!grouped[pid]) grouped[pid] = { nome: r.nome_projeto || `projeto_${pid}`, registros: [] };
        grouped[pid].registros.push(r);
      });

      for (const pid of Object.keys(grouped)) {
        const grp = grouped[pid];
        content += `Projeto: ${grp.nome} (ID: ${pid})\n`;
        content += '========================================\n';
        if (grp.registros.length === 0) content += 'Nenhum registro encontrado.\n\n';
        else {
          grp.registros.forEach((r, idx) => {
            content += `#${idx + 1} - Data: ${r.data_reuniao} | Duração: ${r.duracao_reuniao} | Título: ${r.titulo_reuniao}\n`;
            content += `Participantes: ${r.lista_participantes}\n`;
            content += `Relatório:\n${r.relatorio || ''}\n`;
            content += '----------------------------------------\n';
          });
          content += '\n';
        }
      }
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="registros_todos_projetos.txt"`);
    return res.status(200).send(content);
  } catch (err) {
    console.error('Erro ao gerar exportacao de registros:', err);
    return res.status(500).json({ error: err.message });
  }
};
const getTurmas = wrapGetSimple(turmas.getTurmas, turmas.getTurmasTotal, 'Turmas', 'turmas');
const getUsuarios = wrapGetSimple(usuarios.getUsuarios, usuarios.getUsuariosTotal, 'Usuários', 'usuarios');

// single aluno by id
const getAlunoById = async (req, res) => {
  try {
    const id = req.params && req.params.id;
    if (!id) return res.status(400).json({ error: 'ID do aluno é necessário' });
    const data = await alunos.getAlunoById(id);
    if (!data) return res.status(404).json({ error: 'Aluno não encontrado' });
    return res.status(200).json({ message: 'Aluno obtido com sucesso', data });
  } catch (err) {
    console.error('Erro ao obter aluno por id', err);
    return res.status(500).json({ error: err.message });
  }
};

// single professor by id
const getProfessorById = async (req, res) => {
  try {
    const id = req.params && req.params.id;
    if (!id) return res.status(400).json({ error: 'ID do professor é necessário' });
    const data = await professores.getProfessorById(id);
    if (!data) return res.status(404).json({ error: 'Professor não encontrado' });
    return res.status(200).json({ message: 'Professor obtido com sucesso', data });
  } catch (err) {
    console.error('Erro ao obter professor por id', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getAlunos, getProfessores, getAreasAcademicas, getArquivos, getArquivoById, getAlunoById, getProfessorById, getCursos, getCustos, getMeusProjetos, getMeusProjetosByUsuario, getProjetos, getProjetoById, getProjetosPublicos, getRegistros, getRegistrosTxt, getTurmas, getUsuarios };