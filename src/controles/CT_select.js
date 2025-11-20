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
const getArquivos = wrapGetSimple(arquivos.getArquivos, arquivos.getArquivosTotal, 'Arquivos', 'arquivos');
const getCursos = wrapGetSimple(cursos.getCursos, cursos.getCursosTotal, 'Cursos', 'cursos');
const getCustos = wrapGetSimple(custos.getCustos, custos.getCustosTotal, 'Custos', 'custos');
const getMeusProjetos = wrapGetSimple(meusprojetos.getMeusProjetos, meusprojetos.getMeusProjetosTotal, 'Meus projetos', 'meusprojetos');
const getProjetos = wrapGetSimple(projetos.getProjetos, projetos.getProjetosTotal, 'Projetos', 'projetos');
const getRegistros = wrapGetSimple(registros.getRegistros, registros.getRegistrosTotal, 'Registros', 'registros');
const getTurmas = wrapGetSimple(turmas.getTurmas, turmas.getTurmasTotal, 'Turmas', 'turmas');
const getUsuarios = wrapGetSimple(usuarios.getUsuarios, usuarios.getUsuariosTotal, 'Usuários', 'usuarios');

module.exports = { getAlunos, getProfessores, getAreasAcademicas, getArquivos, getCursos, getCustos, getMeusProjetos, getProjetos, getRegistros, getTurmas, getUsuarios };