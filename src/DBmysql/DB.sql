CREATE DATABASE repo_ifpa
    DEFAULT CHARACTER SET = 'utf8mb4';

USE repo_ifpa;


-- Tabela de usuários (referenciando matrículas de alunos e professores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nome_usuario VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL -- Indica se o usuário está ativo ou não
);

-- Tabela de áreas acadêmicas
CREATE TABLE areas_academicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    codigo_area INT NOT NULL,
    descricao_area TEXT NOT NULL,
    nome_area VARCHAR(255) NOT NULL
);

-- Tabela de professores ()
CREATE TABLE professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nome_professor VARCHAR(255) NOT NULL,
    matricula_professor INT NOT NULL, -- `
    id_area INT NOT NULL, -- Relacionado a `areas_academicas`
    usuario_id INT,
    telefone VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (id_area) REFERENCES areas_academicas(id)
);

-- Tabela de alunos ()
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nome_aluno VARCHAR(255) NOT NULL,
    matricula_aluno INT NOT NULL, -- `
    id_curso INT NOT NULL, -- Relacionado a `cursos`
    usuario_id INT,
    telefone VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (id_curso) REFERENCES cursos(id)
);

-- Tabela de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    coordenador VARCHAR(255) NOT NULL,
    duracao INT NOT NULL,
    descricao_curso TEXT NOT NULL,
    nome_curso VARCHAR(255) NOT NULL
);

-- Tabela de turmas (relacionadas a cursos)
CREATE TABLE turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cod_turma VARCHAR(50) UNIQUE NOT NULL, -- Código único
    turno VARCHAR(50) NOT NULL,
    quantidade_alunos INT NOT NULL,
    id_curso INT NOT NULL, -- Relacionamento obrigatório com cursos
    FOREIGN KEY (id_curso) REFERENCES cursos(id)
);




-- Tabela de projetos (agora referência para custos)
CREATE TABLE projetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nome_projeto VARCHAR(255) NOT NULL,
    orientador INT NOT NULL,
    coorientador VARCHAR(255) NOT NULL,
    matricula_alunos VARCHAR(255) NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at DATETIME DEFAULT NULL,
    FOREIGN KEY (orientador) REFERENCES professores(id)
);

-- Tabela de custos (agora vinculada à tabela `projetos`)
CREATE TABLE custos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_projeto INT NOT NULL, -- Agora vinculado a `projetos`
    equipamento VARCHAR(255) NOT NULL,
    custos_equipamento DOUBLE NOT NULL,
    insumos VARCHAR(255) NOT NULL,
    custos_insumos DOUBLE NOT NULL,
    FOREIGN KEY (id_projeto) REFERENCES projetos(id) -- Alteração da referência
);

-- Tabela de registros (relacionada à tabela projetos)
CREATE TABLE registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_projeto INT NOT NULL, -- Relacionado à tabela projetos
    data_reuniao DATE NOT NULL,
    lista_participantes TEXT NOT NULL, -- Pode ser uma lista de nomes ou IDs
    duracao_reuniao TIME NOT NULL, -- Armazena a duração no formato HH:MM:SS
    titulo_reuniao VARCHAR(255) NOT NULL,
    relatorio TEXT DEFAULT NULL,
    FOREIGN KEY (id_projeto) REFERENCES projetos(id)
);

-- Tabela de meus projetos (relacionada à tabela `matricula_alunos`)
CREATE TABLE meusprojetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nome_projeto VARCHAR(255) NOT NULL,
    usuarios INT NOT NULL, -- Relacionado à tabela `matricula_alunos`
    data_publicacao DATE NOT NULL,
    area_de_pesquisa VARCHAR(255) NOT NULL,
    coordenador VARCHAR(255) NOT NULL,
    Foreign Key (usuarios) REFERENCES usuarios (id) -- Relacionamento com a tabela alunos
);

-- Tabela de arquivos (relacionada a meusprojetos e projetos)
CREATE TABLE arquivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_meuprojeto INT DEFAULT NULL,
    resumo TEXT NOT NULL,
    justificativa TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    sumario TEXT NOT NULL,
    introducao TEXT NOT NULL,
    bibliografia TEXT NOT NULL,
    nome_arquivo VARCHAR(255),
    caminho_arquivo VARCHAR(500),
    tipo_arquivo VARCHAR(100),
    tamanho_arquivo INT,
    projeto_id INT DEFAULT NULL,
    FOREIGN KEY (id_meuprojeto) REFERENCES meusprojetos(id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

-- Tabela de junção: usuários e projetos (N:N)
-- Permite que um projeto tenha múltiplos usuários com diferentes papéis
CREATE TABLE usuario_projeto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    funcao VARCHAR(100) DEFAULT 'colaborador', -- papel do usuário no projeto (ex: proprietario, colaborador)
    data_associacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario_projeto (usuario_id, projeto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
);

```
