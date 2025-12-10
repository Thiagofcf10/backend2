# API Usage Guide

Esta é a documentação completa para usar a API do sistema IFPA.

## Table of Contents
1. [Autenticação](#autenticação)
2. [Configuração da API Key](#configuração-da-api-key)
3. [Endpoints Públicos (com API Key)](#endpoints-públicos-com-api-key)
4. [Endpoints Protegidos (com JWT)](#endpoints-protegidos-com-jwt)
5. [Upload de Arquivos](#upload-de-arquivos)
6. [Tratamento de Erros](#tratamento-de-erros)

---

## Autenticação

A API suporta dois tipos de autenticação:

### 1. API Key (para leitura pública de dados)
- Tipo: Bearer Token via header ou query parameter
- Use-case: Acesso público e somente leitura a dados do sistema
- Métodos: `GET` em endpoints de select

### 2. JWT Token (para operações autenticadas)
- Tipo: Bearer Token via header `Authorization`
- Use-case: Login, registro, inserção, atualização e exclusão de dados
- Métodos: `POST`, `PUT`, `DELETE`

---

## Configuração da API Key

### 1. Definir a API Key no Backend

No arquivo `.env` do backend, configure:

```bash
API_KEY=sua_chave_secreta_aqui
```

**Exemplo:**
```bash
# .env
PORT=3333
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
JWT_SECRET=seu_jwt_secret
API_KEY=minha_chave_api_super_secreta_12345
```

### 2. Usar a API Key em Requisições

A API key pode ser passada de **duas formas**:

#### Opção A: Via Header
```bash
curl -X GET "http://localhost:3333/api/usuarios" \
  -H "x-api-key: minha_chave_api_super_secreta_12345"
```

#### Opção B: Via Query Parameter
```bash
curl -X GET "http://localhost:3333/api/usuarios?api_key=minha_chave_api_super_secreta_12345"
```

---

## Endpoints Públicos (com API Key)

Todos os endpoints de **leitura** (SELECT) requerem a API key e retornam **todos os registros** (sem paginação no servidor).

### GET /api/usuarios
Retorna todos os usuários.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/usuarios" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@example.com",
      "tipo": "aluno",
      "criado_em": "2025-11-17T10:30:00Z"
    },
    {
      "id": 2,
      "nome": "Maria Santos",
      "email": "maria@example.com",
      "tipo": "professor",
      "criado_em": "2025-11-17T10:35:00Z"
    }
  ],
  "total": 2
}
```

### GET /api/alunos
Retorna todos os alunos.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/alunos" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Pedro Costa",
      "matricula": "2023001",
      "email": "pedro@example.com",
      "status": "ativo"
    }
  ],
  "total": 1
}
```

### GET /api/professores
Retorna todos os professores.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/professores" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Dr. Carlos",
      "email": "carlos@example.com",
      "especialidade": "Engenharia de Software"
    }
  ],
  "total": 1
}
```

### GET /api/cursos
Retorna todos os cursos.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/cursos" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Análise de Sistemas",
      "codigo": "AS001",
      "descricao": "Curso de análise de sistemas"
    }
  ],
  "total": 1
}
```

### GET /api/turmas
Retorna todas as turmas.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/turmas" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Turma 2025-A",
      "periodo": "2025-1",
      "codigo": "T001"
    }
  ],
  "total": 1
}
```

### GET /api/areas_academicas
Retorna todas as áreas acadêmicas.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/areas_academicas" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Engenharia",
      "descricao": "Área de Engenharia"
    }
  ],
  "total": 1
}
```

### GET /api/projetos
Retorna todos os projetos.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/projetos" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Sistema de Gestão",
      "descricao": "Projeto de desenvolvimento",
      "status": "ativo"
    }
  ],
  "total": 1
}
```

### GET /api/custos
Retorna todos os custos.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/custos" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "descricao": "Material",
      "valor": 150.50,
      "data": "2025-11-17"
    }
  ],
  "total": 1
}
```

### GET /api/meusprojetos
Retorna todos os projetos do usuário.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/meusprojetos" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "projeto_id": 1,
      "usuario_id": 1,
      "funcao": "Desenvolvedor"
    }
  ],
  "total": 1
}
```

### GET /api/registros
Retorna todos os registros.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/registros" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "acao": "insert",
      "tabela": "alunos",
      "timestamp": "2025-11-17T10:30:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/arquivos
Retorna todos os arquivos.

**Requisição:**
```bash
curl -X GET "http://localhost:3333/api/arquivos" \
  -H "x-api-key: sua_api_key"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "documento.pdf",
      "path": "/uploads/documento.pdf",
      "tamanho": 2048,
      "tipo": "application/pdf",
      "uploaded_at": "2025-11-17T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

## Endpoints Protegidos (com JWT)

Estes endpoints requerem autenticação via JWT token.

### 1. Autenticação (Login)

#### POST /api/login
Realiza login e retorna um JWT token.

**Requisição:**
```bash
curl -X POST "http://localhost:3333/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "senha": "senha123"
  }'
```

**Resposta (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "usuario@example.com",
    "tipo": "aluno"
  }
}
```

**Resposta (401 Unauthorized):**
```json
{
  "mensagem": "Email ou senha inválidos"
}
```

### 2. Registro (Signup)

#### POST /api/register
Cria um novo usuário.

**Requisição:**
```bash
curl -X POST "http://localhost:3333/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Usuário",
    "email": "novo@example.com",
    "senha": "senha_forte_123",
    "tipo": "aluno"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 3,
  "nome": "Novo Usuário",
  "email": "novo@example.com",
  "tipo": "aluno",
  "criado_em": "2025-11-17T11:00:00Z"
}
```

**Resposta (400 Bad Request):**
```json
{
  "mensagem": "Email já cadastrado"
}
```

### 3. Inserção de Dados (INSERT)

Todos os endpoints de inserção usam `POST` e requerem JWT token.

#### POST /api/usuarios
Insere um novo usuário (requer autenticação).

**Requisição:**
```bash
curl -X POST "http://localhost:3333/api/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "nome": "Ana Silva",
    "email": "ana@example.com",
    "tipo": "professor",
    "senha": "senha123"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 4,
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "tipo": "professor"
}
```

#### POST /api/alunos
Insere um novo aluno.

**Requisição:**
```bash
curl -X POST "http://localhost:3333/api/alunos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "nome": "Lucia Costa",
    "matricula": "2025002",
    "email": "lucia@example.com",
    "status": "ativo"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 2,
  "nome": "Lucia Costa",
  "matricula": "2025002",
  "email": "lucia@example.com",
  "status": "ativo"
}
```

#### POST /api/cursos
Insere um novo curso.

**Requisição:**
```bash
curl -X POST "http://localhost:3333/api/cursos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "nome": "Sistemas Distribuídos",
    "codigo": "SD001",
    "descricao": "Estudo de sistemas distribuídos"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 2,
  "nome": "Sistemas Distribuídos",
  "codigo": "SD001",
  "descricao": "Estudo de sistemas distribuídos"
}
```

### 4. Atualização de Dados (UPDATE)

Todos os endpoints de atualização usam `PUT` e requerem JWT token.

#### PUT /api/usuarios/:id
Atualiza um usuário existente.

**Requisição:**
```bash
curl -X PUT "http://localhost:3333/api/usuarios/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "nome": "João Silva Atualizado",
    "email": "joao_novo@example.com"
  }'
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Usuário atualizado com sucesso",
  "id": 1
}
```

#### PUT /api/alunos/:id
Atualiza um aluno.

**Requisição:**
```bash
curl -X PUT "http://localhost:3333/api/alunos/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_jwt_token" \
  -d '{
    "status": "inativo"
  }'
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Aluno atualizado com sucesso",
  "id": 1
}
```

### 5. Exclusão de Dados (DELETE)

Todos os endpoints de exclusão usam `DELETE` e requerem JWT token.

#### DELETE /api/usuarios/:id
Deleta um usuário.

**Requisição:**
```bash
curl -X DELETE "http://localhost:3333/api/usuarios/1" \
  -H "Authorization: Bearer seu_jwt_token"
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Usuário deletado com sucesso"
}
```

#### DELETE /api/alunos/:id
Deleta um aluno.

**Requisição:**
```bash
curl -X DELETE "http://localhost:3333/api/alunos/1" \
  -H "Authorization: Bearer seu_jwt_token"
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Aluno deletado com sucesso"
}
```

---

## Upload de Arquivos

### POST /api/arquivos/upload
Upload de arquivos (requer JWT token).

**Requisição (multipart/form-data):**
```bash
curl -X POST "http://localhost:3333/api/arquivos/upload" \
  -H "Authorization: Bearer seu_jwt_token" \
  -F "file=@/caminho/para/arquivo.pdf"
```

**Resposta (201 Created):**
```json
{
  "id": 2,
  "nome": "arquivo.pdf",
  "path": "/uploads/arquivo.pdf",
  "tamanho": 5120,
  "tipo": "application/pdf",
  "uploaded_at": "2025-11-17T12:00:00Z"
}
```

---

## Tratamento de Erros

### Erro 401 - API Key Inválida
Ocorre quando a API key está ausente ou inválida nos endpoints públicos.

**Resposta:**
```json
{
  "mensagem": "API key inválida ou ausente"
}
```

### Erro 401 - JWT Inválido
Ocorre quando o JWT token está ausente, expirado ou inválido.

**Resposta:**
```json
{
  "mensagem": "Token não autorizado"
}
```

### Erro 400 - Validação
Ocorre quando os dados enviados não passam na validação.

**Resposta:**
```json
{
  "mensagem": "Erro de validação",
  "erros": {
    "email": "Email inválido",
    "nome": "Nome é obrigatório"
  }
}
```

### Erro 500 - Erro Interno do Servidor
Ocorre quando há um erro não tratado no servidor.

**Resposta:**
```json
{
  "mensagem": "Erro interno do servidor"
}
```

---

## Exemplo Completo: Fluxo de Autenticação e Inserção

### 1. Fazer Login
```bash
# Step 1: Login
TOKEN=$(curl -s -X POST "http://localhost:3333/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "senha": "senha123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. Usar o Token para Inserir um Novo Aluno
```bash
# Step 2: Insert new student using token
curl -X POST "http://localhost:3333/api/alunos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Carlos Mendes",
    "matricula": "2025003",
    "email": "carlos@example.com",
    "status": "ativo"
  }'
```

### 3. Usar a API Key para Listar Todos os Alunos
```bash
# Step 3: List all students using API key
curl -X GET "http://localhost:3333/api/alunos" \
  -H "x-api-key: sua_api_key"
```

---

## Resumo Rápido

| Tipo | Autenticação | Métodos | Exemplo |
|------|--------------|---------|---------|
| Leitura Pública | API Key | GET | `GET /api/usuarios` + header `x-api-key` |
| Login | Nenhuma | POST | `POST /api/login` |
| Registro | Nenhuma | POST | `POST /api/register` |
| Escrita | JWT | POST, PUT, DELETE | `POST /api/alunos` + header `Authorization: Bearer <token>` |
| Upload | JWT | POST | `POST /api/arquivos/upload` + header `Authorization: Bearer <token>` |

---

## Variáveis de Ambiente Necessárias

Certifique-se de que seu `.env` contém:

```bash
# Servidor
PORT=3333

# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=ifpa_db

# Autenticação
JWT_SECRET=sua_chave_jwt_secreta_aqui

# API
API_KEY=sua_chave_api_secreta_aqui
```

---

## Notas Importantes

1. **API Key**: A chave de API é uma string simples definida no `.env`. Mantenha-a segura e privada.
2. **JWT Token**: Os tokens JWT expiram. Implemente refresh token se necessário.
3. **HTTPS**: Em produção, use HTTPS para todas as requisições.
4. **Rate Limiting**: Considere implementar rate limiting para proteger a API.
5. **Logs**: Todas as requisições são registradas no banco de dados (tabela `registros`).
6. **Sem Paginação no Servidor**: As requisições GET retornam todos os registros. Para grandes volumes, implemente filtros no cliente ou no servidor.

---

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

## Filtragem e Paginação Opcional

Todos os endpoints de leitura (GET) suportam parâmetros opcionais para filtrar e paginar resultados:

### Parâmetros Disponíveis

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Termo de busca (procura em campos searchable da tabela) |
| `field` | string | Campo específico para buscar (quando usado com `q`) |
| `limit` | number | Número máximo de registros a retornar (ex: 10, 50) |
| `offset` | number | Número de registros a pular (para paginação) |

### Exemplos de Uso

#### 1. Buscar por termo (em qualquer campo searchable)
```bash
curl -X GET "http://localhost:3333/api/usuarios?q=joao" \
  -H "x-api-key: sua_api_key"
```

**Campos pesquisáveis por tabela:**
- usuarios: nome_usuario, email
- alunos: nome_aluno, matricula_aluno
- professores: nome_professor, matricula_professor
- cursos: nome_curso, descricao_curso
- turmas: cod_turma
- areas_academicas: nome_area, descricao_area
- projetos: nome_projeto, descricao
- custos: descricao
- meusprojetos: nome_projeto
- registros: acao, tabela
- arquivos: nome, tipo

#### 2. Buscar em campo específico
```bash
curl -X GET "http://localhost:3333/api/usuarios?q=joao&field=nome_usuario" \
  -H "x-api-key: sua_api_key"
```

#### 3. Retornar apenas 10 registros
```bash
curl -X GET "http://localhost:3333/api/alunos?limit=10" \
  -H "x-api-key: sua_api_key"
```

#### 4. Paginação (pular 20 registros, retornar próximos 10)
```bash
curl -X GET "http://localhost:3333/api/alunos?limit=10&offset=20" \
  -H "x-api-key: sua_api_key"
```

#### 5. Combinar busca com paginação
```bash
curl -X GET "http://localhost:3333/api/projetos?q=sistema&limit=5&offset=0" \
  -H "x-api-key: sua_api_key"
```

**Resposta com paginação:**
```json
{
  "message": "Projetos obtidos com sucesso",
  "data": [
    {
      "id": 1,
      "nome_projeto": "Sistema de Gestão",
      "descricao": "Projeto de desenvolvimento"
    }
  ],
  "total": 42
}
```

---

