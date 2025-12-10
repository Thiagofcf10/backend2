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

const wrapDelete = (fn) => async (req, res) => {
    try {
        const { id } = req.params;
        await fn(id);
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteAluno = wrapDelete(alunos.deleteAluno);
const deleteProfessor = wrapDelete(professores.deleteProfessor);
const deleteAreaAcademica = wrapDelete(areas.deleteAreaAcademica);
const deleteArquivo = wrapDelete(arquivos.deleteArquivo);
const deleteCurso = wrapDelete(cursos.deleteCurso);
const deleteCusto = wrapDelete(custos.deleteCusto);
const deleteMeuProjeto = wrapDelete(meusprojetos.deleteMeuProjeto);
const deleteProjeto = wrapDelete(projetos.deleteProjeto);
const deleteRegistro = wrapDelete(registros.deleteRegistro);
const deleteTurma = wrapDelete(turmas.deleteTurma);
const deleteUsuario = wrapDelete(usuarios.deleteUsuario);

module.exports = { deleteAluno, deleteProfessor, deleteAreaAcademica, deleteArquivo, deleteCurso, deleteCusto, deleteMeuProjeto, deleteProjeto, deleteRegistro, deleteTurma, deleteUsuario };