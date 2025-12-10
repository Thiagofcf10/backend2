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
// inserirProjeto: rely on middleware to set `orientador` to the correct professores.id
const inserirProjeto = async (req, res) => {
    try {
        const payload = { ...req.body };
        // Do NOT overwrite payload.orientador with req.user.id (usuarios.id) because
        // the database `projetos.orientador` is a FK to `professores.id`.
        const result = await projetos.inserirProjeto(payload);
        return res.status(201).json({ message: `Projeto criado com sucesso`, id: result.insertId });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
const inserirRegistro = wrapInsert(registros.inserirRegistro, 'Registro');
const inserirTurma = wrapInsert(turmas.inserirTurma, 'Turma');
const inserirUsuario = wrapInsert(usuarios.inserirUsuario, 'Usuário');

// Controlador customizado para inserir arquivo com upload
const connection = require('../DBmysql/conectaraoDB');
const inserirArquivo = async (req, res) => {
    try {
        // Ensure id_meuprojeto exists BEFORE attempting insert to avoid FK failures
        const userId = req.user?.id || null;
        let idMeu = req.body.id_meuprojeto ? Number(req.body.id_meuprojeto) : null;

        if (!idMeu && userId) {
            const [rows] = await connection.execute('SELECT id FROM meusprojetos WHERE usuarios = ? LIMIT 1', [userId]);
            if (rows && rows.length > 0) {
                idMeu = rows[0].id;
            } else {
                // create minimal meusprojetos
                const nomeProjeto = req.body.nome_projeto || req.body.nome_arquivo || `Projeto do usuário ${userId}`;
                const today = new Date().toISOString().slice(0,10);
                const meuprojetoRes = await meusprojetos.inserirMeuProjeto({
                    nome_projeto: nomeProjeto,
                    usuarios: userId,
                    data_publicacao: today,
                    area_de_pesquisa: req.body.area_de_pesquisa || '',
                    coordenador: (req.user && req.user.nome) ? req.user.nome : ''
                });
                idMeu = meuprojetoRes.insertId;
            }
        }

        // Se houver arquivo, adicionar informações do arquivo ao body
        if (req.file) {
            req.body.nome_arquivo = req.file.originalname;
            req.body.caminho_arquivo = req.file.path;
            req.body.tipo_arquivo = req.file.mimetype;
            req.body.tamanho_arquivo = req.file.size;
        }

        if (idMeu) req.body.id_meuprojeto = idMeu;

        const result = await arquivos.inserirArquivo(req.body);
        return res.status(201).json({ 
            message: 'Arquivo criado com sucesso', 
            id: result.insertId,
            arquivo: {
                nome: req.file ? req.file.originalname : null,
                tamanho: req.file ? req.file.size : null,
                id_meuprojeto: idMeu || null
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