const express = require('express');
const router = express.Router();
const CT_select = require('./controles/CT_select');
const CT_insert = require('./controles/CT_insert');
const CT_delete = require('./controles/CT_delete');
const CT_update = require('./controles/CT_update');
const CT_auth = require('./controles/CT_auth');
const CT_usuario_projeto = require('./controles/CT_usuario_projeto');
const validacao = require('./validar/validacao');
const { authenticateToken } = require('./autenticacao/auth');
const apiKeyAuth = require('./middlewares/apiKey');
const upload = require('./middlewares/upload');
const connection = require('./DBmysql/conectaraoDB');

// Middleware: ensure orientador is present in body by mapping authenticated user -> professor.id
// If the client provided an explicit orientador (professor id), keep it. Otherwise attempt
// to find the professor record that matches the authenticated `usuarios.id` (usuario_id)
// and set `req.body.orientador` to that `professores.id` so FK constraint is satisfied.
const ensureOrientadorFromUser = async (req, res, next) => {
	try {
		if (!req.body) req.body = {};
		// If orientador already provided by client, do nothing.
		if (req.body.orientador) return next();

		if (req.user && req.user.id) {
			try {
				const [rows] = await connection.execute('SELECT id FROM professores WHERE usuario_id = ? LIMIT 1', [req.user.id]);
				if (rows && rows.length > 0) {
					req.body.orientador = rows[0].id;
				} else {
					// No professor record linked to this usuario; leave orientador undefined so validation
					// can return a clear error (or clients can select an explicit orientador).
				}
			} catch (dbErr) {
				// If DB query fails, log and continue to next so route validation handles missing orientador.
				console.error('Erro ao buscar professor para usuario:', dbErr.message || dbErr);
			}
		}
	} catch (err) {
		// ignore and continue; this middleware is a convenience
	}
	next();
};

// ============================================================
// ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
// ============================================================

// Autenticação
router.post('/login', CT_auth.loginController);
router.post('/register', CT_auth.registerController);
router.get('/verify', authenticateToken, CT_auth.verifyController);
router.post('/logout', CT_auth.logoutController);

// GET (Leitura) - acessível via API key (URL + api_key or header x-api-key)
router.get('/selectaluno', apiKeyAuth, CT_select.getAlunos);
router.get('/selectaluno/:id', apiKeyAuth, CT_select.getAlunoById);
router.get('/selectprofessor', apiKeyAuth, CT_select.getProfessores);
router.get('/selectprofessor/:id', apiKeyAuth, CT_select.getProfessorById);
router.get('/selectareas', apiKeyAuth, CT_select.getAreasAcademicas);
router.get('/selectarquivos', apiKeyAuth, CT_select.getArquivos);
// single arquivo by id
router.get('/selectarquivos/:id', apiKeyAuth, CT_select.getArquivoById);
router.get('/selectcursos', apiKeyAuth, CT_select.getCursos);
router.get('/selectcustos', apiKeyAuth, CT_select.getCustos);
router.get('/selectmeusprojetos', apiKeyAuth, CT_select.getMeusProjetos);
// Role-aware meus projetos: pass ?tipo=professor|aluno
router.get('/selectmeusprojetos/:usuario_id', apiKeyAuth, CT_select.getMeusProjetosByUsuario);
router.get('/selectprojetos', apiKeyAuth, CT_select.getProjetos);
// Public listing of published projects
router.get('/selectprojetos_publicos', apiKeyAuth, CT_select.getProjetosPublicos);
// single projeto by id
router.get('/selectprojetos/:id', apiKeyAuth, CT_select.getProjetoById);
router.get('/selectregistros', apiKeyAuth, CT_select.getRegistros);
router.get('/selectturmas', apiKeyAuth, CT_select.getTurmas);
router.get('/selectusuarios', apiKeyAuth, CT_select.getUsuarios);

// ============================================================
// ROTAS PROTEGIDAS (COM AUTENTICAÇÃO)
// ============================================================

// Alunos
router.post('/inseriraluno', authenticateToken, validacao.validacoes.aluno, CT_insert.inserirAluno);
router.delete('/deletealuno/:id', authenticateToken, CT_delete.deleteAluno);
router.put('/atualizaraluno/:id', authenticateToken, validacao.validacoes.aluno, CT_update.atualizarAluno);

// Professores
router.post('/inserirprofessor', authenticateToken, validacao.validacoes.professor, CT_insert.inserirProfessor);
router.delete('/deleteprofessor/:id', authenticateToken, CT_delete.deleteProfessor);
router.put('/atualizarprofessor/:id', authenticateToken, validacao.validacoes.professor, CT_update.atualizarProfessor);

// Areas acadêmicas
router.post('/inserirarea', authenticateToken, validacao.validacoes.area, CT_insert.inserirAreaAcademica);
router.delete('/deletearea/:id', authenticateToken, CT_delete.deleteAreaAcademica);
router.put('/atualizararea/:id', authenticateToken, validacao.validacoes.area, CT_update.atualizarAreaAcademica);

// Arquivos
router.post('/inserirarquivo', authenticateToken, upload.single('arquivo'), CT_insert.inserirArquivo);
router.delete('/deletarquivos/:id', authenticateToken, CT_delete.deleteArquivo);
// Allow file replacement via multipart/form-data on atualizararquivo
router.put('/atualizararquivo/:id', authenticateToken, upload.single('arquivo'), CT_update.atualizarArquivo);

// Cursos
router.post('/inserircursos', authenticateToken, validacao.validacoes.curso, CT_insert.inserirCurso);
router.delete('/deletecurso/:id', authenticateToken, CT_delete.deleteCurso);
router.put('/atualizarcurso/:id', authenticateToken, validacao.validacoes.curso, CT_update.atualizarCurso);

// Custos
router.post('/inserircusto', authenticateToken, CT_insert.inserirCusto);
router.delete('/deletecusto/:id', authenticateToken, CT_delete.deleteCusto);
router.put('/atualizarcusto/:id', authenticateToken, CT_update.atualizarCusto);

// Meus projetos
router.post('/inserirmeuprojeto', authenticateToken, validacao.validacoes.meuprojeto, CT_insert.inserirMeuProjeto);
router.delete('/deletemeusprojeto/:id', authenticateToken, CT_delete.deleteMeuProjeto);
router.put('/atualizarmeusprojeto/:id', authenticateToken, validacao.validacoes.meuprojeto, CT_update.atualizarMeuProjeto);

// Projetos
// When creating a project, orientador is set server-side from the authenticated user
// When creating a project, orientador is set server-side from the authenticated user
// ensureOrientadorFromUser runs after authenticateToken and before validation to avoid
// validation errors if an older validator still expects orientador in the body.
router.post('/inserirprojeto', authenticateToken, ensureOrientadorFromUser, validacao.validacoes.projeto_create, CT_insert.inserirProjeto);
router.delete('/deleteprojeto/:id', authenticateToken, CT_delete.deleteProjeto);
router.put('/atualizarprojeto/:id', authenticateToken, validacao.validacoes.projeto, CT_update.atualizarProjeto);
// Publish/unpublish a project (authenticated)
router.put('/publicarprojeto/:id', authenticateToken, CT_update.publicarProjeto);

// Registros
router.post('/inserirregistro', authenticateToken, CT_insert.inserirRegistro);
router.delete('/deleteregistro/:id', authenticateToken, CT_delete.deleteRegistro);
router.put('/atualizarregistro/:id', authenticateToken, CT_update.atualizarRegistro);

// Turmas
router.post('/inserirturma', authenticateToken, validacao.validacoes.turma, CT_insert.inserirTurma);
router.delete('/deleteturma/:id', authenticateToken, CT_delete.deleteTurma);
router.put('/atualizarturma/:id', authenticateToken, validacao.validacoes.turma, CT_update.atualizarTurma);

// Usuarios
router.post('/inserirusuario', authenticateToken, validacao.validacoes.usuario, CT_insert.inserirUsuario);
router.delete('/deleteusuario/:id', authenticateToken, CT_delete.deleteUsuario);
// Use a lighter validator for updates (password optional)
router.put('/atualizarusuario/:id', authenticateToken, validacao.validacoes.usuario_update, CT_update.atualizarUsuario);

// Usuario-Projeto (Gerenciar associações de usuários em projetos)
// GET - listar todos
router.get('/selectusuario_projeto', apiKeyAuth, CT_usuario_projeto.getUsuarioProjeto);
// GET - by ID
router.get('/selectusuario_projeto/:id', apiKeyAuth, CT_usuario_projeto.getUsuarioProjetoById);
// GET - projetos de um usuário
router.get('/selectusuario_projetos/:usuario_id', apiKeyAuth, CT_usuario_projeto.getProjetosByUsuario);
// GET - usuários de um projeto
router.get('/selectprojeto_usuarios/:projeto_id', apiKeyAuth, CT_usuario_projeto.getUsuariosByProjeto);
// POST - associar usuário a projeto
router.post('/inserirusuario_projeto', authenticateToken, CT_usuario_projeto.inserirUsuarioProjeto);
// DELETE - remover associação
router.delete('/deleteusuario_projeto/:id', authenticateToken, CT_usuario_projeto.deleteUsuarioProjeto);
// DELETE - remover por usuario_id e projeto_id
router.delete('/deleteusuario_projeto/:usuario_id/:projeto_id', authenticateToken, CT_usuario_projeto.deleteUsuarioProjetoByUsuarioAndProjeto);
// PUT - atualizar associação
router.put('/atualizarusuario_projeto/:id', authenticateToken, CT_usuario_projeto.atualizarUsuarioProjeto);

module.exports = router;