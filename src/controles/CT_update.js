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

const wrapUpdate = (fn) => async (req, res) => {
    try {
        const { id } = req.params;
        await fn(id, req.body);
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const atualizarAluno = wrapUpdate(alunos.atualizarAluno);
const atualizarProfessor = wrapUpdate(professores.atualizarProfessor);
const atualizarAreaAcademica = wrapUpdate(areas.atualizarAreaAcademica);
const atualizarArquivo = wrapUpdate(arquivos.atualizarArquivo);
const atualizarCurso = wrapUpdate(cursos.atualizarCurso);
const atualizarCusto = wrapUpdate(custos.atualizarCusto);
const atualizarMeuProjeto = wrapUpdate(meusprojetos.atualizarMeuProjeto);
const atualizarProjeto = wrapUpdate(projetos.atualizarProjeto);
const atualizarRegistro = wrapUpdate(registros.atualizarRegistro);
const atualizarTurma = wrapUpdate(turmas.atualizarTurma);
const atualizarUsuario = wrapUpdate(usuarios.atualizarUsuario);

module.exports = { atualizarAluno, atualizarProfessor, atualizarAreaAcademica, atualizarArquivo, atualizarCurso, atualizarCusto, atualizarMeuProjeto, atualizarProjeto, atualizarRegistro, atualizarTurma, atualizarUsuario };