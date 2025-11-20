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

const wrapInsert = (fn, name) => async (req, res) => {
    try {
        const result = await fn(req.body);
        return res.status(201).json({ message: `${name} criado com sucesso`, id: result.insertId });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const inserirAluno = wrapInsert(alunos.inserirAluno, 'Aluno');
const inserirProfessor = wrapInsert(professores.inserirProfessor, 'Professor');
const inserirAreaAcademica = wrapInsert(areas.inserirAreaAcademica, 'Área acadêmica');
const inserirCurso = wrapInsert(cursos.inserirCurso, 'Curso');
const inserirCusto = wrapInsert(custos.inserirCusto, 'Custo');
const inserirMeuProjeto = wrapInsert(meusprojetos.inserirMeuProjeto, 'Meu projeto');
const inserirProjeto = wrapInsert(projetos.inserirProjeto, 'Projeto');
const inserirRegistro = wrapInsert(registros.inserirRegistro, 'Registro');
const inserirTurma = wrapInsert(turmas.inserirTurma, 'Turma');
const inserirUsuario = wrapInsert(usuarios.inserirUsuario, 'Usuário');

// Controlador customizado para inserir arquivo com upload
const inserirArquivo = async (req, res) => {
    try {
        // Se houver arquivo, adicionar informações do arquivo ao body
        if (req.file) {
            req.body.nome_arquivo = req.file.originalname;
            req.body.caminho_arquivo = req.file.path;
            req.body.tipo_arquivo = req.file.mimetype;
            req.body.tamanho_arquivo = req.file.size;
        }

        const result = await arquivos.inserirArquivo(req.body);
        return res.status(201).json({ 
            message: 'Arquivo criado com sucesso', 
            id: result.insertId,
            arquivo: {
                nome: req.file ? req.file.originalname : null,
                tamanho: req.file ? req.file.size : null
            }
        });
    } catch (err) {
        // Se houver erro, deletar o arquivo que foi feito upload
        if (req.file) {
            const fs = require('fs');
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Erro ao deletar arquivo:', unlinkErr);
            });
        }
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { inserirAluno, inserirProfessor, inserirAreaAcademica, inserirArquivo, inserirCurso, inserirCusto, inserirMeuProjeto, inserirProjeto, inserirRegistro, inserirTurma, inserirUsuario };