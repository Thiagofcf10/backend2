// Validador genérico para campo obrigatório
const validarCampoObrigatorio = (campo, nomeCampo = campo) => {
  return (request, response, next) => {
    const { body } = request;

    if (body[campo] === undefined) {
      return response.status(400).json({ message: `${nomeCampo} não foi enviado` });
    }

    if (body[campo] === '') {
      return response.status(400).json({ message: `${nomeCampo} está em branco` });
    }

    next();
  };
};

// Validador para múltiplos campos obrigatórios
const validarCamposObrigatorios = (campos) => {
  return (request, response, next) => {
    const { body } = request;

    for (const { nome, exibicao } of campos) {
      if (body[nome] === undefined) {
        return response.status(400).json({ message: `${exibicao || nome} não foi enviado` });
      }

      if (body[nome] === '') {
        return response.status(400).json({ message: `${exibicao || nome} está em branco` });
      }
    }

    next();
  };
};

// Optional validator to ensure destaque, if provided, is 0/1 or boolean
const validarDestaque = (request, response, next) => {
  try {
    const { body } = request;
    if (body && body.destaque !== undefined && body.destaque !== null) {
      const val = body.destaque;
      // Accept boolean or numeric 0/1 or string '0'/'1'
      if (typeof val === 'boolean') return next();
      const num = Number(val);
      if (!Number.isNaN(num) && (num === 0 || num === 1)) return next();
      return response.status(400).json({ message: 'Campo destaque inválido. Use 0 ou 1.' });
    }
    return next();
  } catch (err) {
    return next();
  }
};

// Validadores específicos legados (mantidos para compatibilidade)
const validarnome = validarCampoObrigatorio('nome_aluno', 'nome do aluno');

const telefone = validarCampoObrigatorio('telefone', 'telefone');

// Validadores por entidade
const validacoes = {
  aluno: validarCamposObrigatorios([
    { nome: 'nome_aluno', exibicao: 'Nome do aluno' },
    { nome: 'matricula_aluno', exibicao: 'Matrícula do aluno' }
  ]),

  professor: validarCamposObrigatorios([
    { nome: 'nome_professor', exibicao: 'Nome do professor' },
    { nome: 'matricula_professor', exibicao: 'Matrícula do professor' }
  ]),

  curso: validarCamposObrigatorios([
    { nome: 'nome_curso', exibicao: 'Nome do curso' },
    { nome: 'coordenador', exibicao: 'Coordenador' }
  ]),

  usuario: validarCamposObrigatorios([
    { nome: 'nome_usuario', exibicao: 'Nome do usuário' },
    { nome: 'email', exibicao: 'Email' },
    { nome: 'password', exibicao: 'Senha' }
  ]),
  // validator for updating user (password optional)
  usuario_update: validarCamposObrigatorios([
    { nome: 'nome_usuario', exibicao: 'Nome do usuário' },
    { nome: 'email', exibicao: 'Email' }
  ]),

  turma: validarCamposObrigatorios([
    { nome: 'cod_turma', exibicao: 'Código da turma' },
    { nome: 'turno', exibicao: 'Turno' }
  ]),

  area: validarCamposObrigatorios([
    { nome: 'nome_area', exibicao: 'Nome da área' },
    { nome: 'codigo_area', exibicao: 'Código da área' }
  ]),

  projeto: validarCamposObrigatorios([
    { nome: 'nome_projeto', exibicao: 'Nome do projeto' },
    // orientador será atribuído automaticamente a partir do usuário autenticado
  ]),
  // validator for creating a project (client does not need to send orientador)
  projeto_create: validarCamposObrigatorios([
    { nome: 'nome_projeto', exibicao: 'Nome do projeto' }
  ]),
  // validator for updating a project (tipo_projeto is optional)
  projeto_update: validarCamposObrigatorios([
    { nome: 'nome_projeto', exibicao: 'Nome do projeto' }
  ]),

  meuprojeto: validarCamposObrigatorios([
    { nome: 'nome_projeto', exibicao: 'Nome do projeto' },
    { nome: 'usuarios', exibicao: 'Usuário' }
  ])
};

module.exports = {
  validarnome,
  telefone,
  validarCampoObrigatorio,
  validarCamposObrigatorios,
  validarDestaque,
  validacoes
};