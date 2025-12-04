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
        // Debug: log incoming update payload for easier troubleshooting
        try {
            console.log(`[CT_update] update request for id=${id} body=`, req.body);
        } catch (e) {
            // ignore logging errors
        }
        await fn(id, req.body);
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Special wrapper to allow passing multer file to the update function for arquivos
const wrapUpdateWithFile = (fn) => async (req, res) => {
    try {
        const { id } = req.params;
        // pass both body and file (file may be undefined)
        await fn(id, req.body, req.file);
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const atualizarAluno = wrapUpdate(alunos.atualizarAluno);
const atualizarProfessor = wrapUpdate(professores.atualizarProfessor);
const atualizarAreaAcademica = wrapUpdate(areas.atualizarAreaAcademica);
const atualizarArquivo = wrapUpdateWithFile(arquivos.atualizarArquivo);
const atualizarCurso = wrapUpdate(cursos.atualizarCurso);
const atualizarCusto = wrapUpdate(custos.atualizarCusto);
const atualizarMeuProjeto = wrapUpdate(meusprojetos.atualizarMeuProjeto);
const atualizarProjeto = wrapUpdate(projetos.atualizarProjeto);
const atualizarRegistro = wrapUpdate(registros.atualizarRegistro);
// Allow students to update only the relatorio field when permitted and within deadline
const atualizarRelatorio = async (req, res) => {
    try {
        const { id } = req.params;
        const { relatorio } = req.body;

        // require authentication
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Autenticação necessária' });

        // Professors can update freely via existing endpoint
        if (user.tipo === 'professor') {
            await registros.atualizarRelatorio(id, relatorio);
            return res.status(204).send();
        }

        // For students, verify permission
        const alunoRecord = await alunos.getAlunoByUsuarioId(user.id);
        if (!alunoRecord) return res.status(403).json({ error: 'Somente alunos vinculados podem alterar relatórios' });

        const registro = await registros.getRegistroById(id);
        if (!registro) return res.status(404).json({ error: 'Registro não encontrado' });

        // Check deadline: if set and now > deadline -> forbidden
        if (registro.relatorio_edit_deadline) {
            const deadline = new Date(registro.relatorio_edit_deadline);
            const now = new Date();
            if (now > deadline) return res.status(403).json({ error: 'Prazo para edição do relatório expirado' });
        }

        // Check allowed list (may contain matricula numbers or aluno ids) if provided
        if (registro.relatorio_edit_allowed && registro.relatorio_edit_allowed.trim() !== '') {
            const tokens = registro.relatorio_edit_allowed.split(',').map(t => String(t).trim()).filter(Boolean);
            const alunoIdStr = String(alunoRecord.id);
            const alunoMat = String(alunoRecord.matricula_aluno);
            const allowed = tokens.includes(alunoIdStr) || tokens.includes(alunoMat);
            if (!allowed) return res.status(403).json({ error: 'Você não tem permissão para editar este relatório' });
        }

        // All checks passed -> update relatorio
        await registros.atualizarRelatorio(id, relatorio);
        return res.status(204).send();
    } catch (err) {
        console.error('Erro em atualizarRelatorio:', err);
        return res.status(500).json({ error: err.message });
    }
};
const atualizarTurma = wrapUpdate(turmas.atualizarTurma);
const atualizarUsuario = wrapUpdate(usuarios.atualizarUsuario);

// Publish/unpublish a project
const publicarProjeto = async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        await projetos.publicarProjeto(id, !!published);
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Toggle or set destaque for a project
const toggleDestaque = async (req, res) => {
    try {
        const { id } = req.params;
        const { destaque } = req.body;
        // Expect destaque to be boolean-like (0/1 or true/false)
        await projetos.setDestaque(id, !!destaque);
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { atualizarAluno, atualizarProfessor, atualizarAreaAcademica, atualizarArquivo, atualizarCurso, atualizarCusto, atualizarMeuProjeto, atualizarProjeto, atualizarRegistro, atualizarRelatorio, atualizarTurma, atualizarUsuario, publicarProjeto, toggleDestaque };