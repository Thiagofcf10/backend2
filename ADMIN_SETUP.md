# 🔧 Guia de Setup - Página Admin e API

## Problema Resolvido: Erro 405 (Method Not Allowed)

### O que causava o erro:
1. **CORS não configurado corretamente** — Faltava permitir métodos PUT, DELETE, OPTIONS
2. **Order dos middlewares** — CORS precisa vir ANTES das rotas
3. **Falta de tratamento de requisições vazio** — Servidor não aceitava requisições sem Content-Type correto

### Soluções aplicadas em `src/app.js`:

✅ **CORS mais permissivo:**
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

✅ **Ordem correta dos middlewares:**
1. CORS
2. JSON Parser
3. Rotas

✅ **Melhorias em `public/admin.html`:**
- Adicionado log de URLs (console.log para debug)
- Melhor visualização de erros (mostra URL tentada)
- Suporte a apiPrefix (pode usar `/api` ou sem prefixo)

---

## 🚀 Como usar:

### 1. Inicie o servidor:
```bash
node src/server.js
```

O servidor deve iniciar na porta `3001` (ou outra definida em `.env`).

### 2. Acesse a página admin:
Abra no navegador:
```
http://localhost:3001/admin
```

### 3. Teste um endpoint:

**Exemplo: Listar Alunos**
- Aba: `👥 Alunos`
- Método: `GET - Listar todos`
- Clique em `Enviar`

Você deve ver a resposta JSON com todos os alunos.

**Exemplo: Inserir Aluno**
- Aba: `👥 Alunos`
- Método: `POST - Criar novo`
- Payload JSON (preencher automaticamente clicando `📋 Inserir`):
```json
{
  "nome_aluno": "João Silva",
  "matricula_aluno": 20230001,
  "id_curso": 1,
  "usuario_id": null,
  "telefone": "999999999"
}
```
- Clique em `Enviar`

---

## 🔍 Debug: Como verificar se está funcionando

Se receber erro 405 ou outro erro:

1. **Abra o console do navegador** (F12 → Console)
   - Procure por `Enviando requisição:` para ver a URL exata

2. **Teste via curl** (terminal):
```bash
# Listar alunos
curl -X GET http://localhost:3001/selectaluno

# Inserir aluno
curl -X POST http://localhost:3001/inseriraluno \
  -H "Content-Type: application/json" \
  -d '{"nome_aluno":"João","matricula_aluno":20230001}'
```

3. **Verifique as credenciais MySQL**:
   - Abra `src/DBmysql/conectaraoDB.js`
   - Confirme user, password, host, database

---

## 📋 Rotas Disponíveis

### Alunos
- `GET /selectaluno` — Listar todos
- `POST /inseriraluno` — Criar novo
- `PUT /atualizaraluno/:id` — Atualizar
- `DELETE /deletealuno/:id` — Deletar

### Professores
- `GET /selectprofessor` — Listar todos
- `POST /inserirprofessor` — Criar novo
- `PUT /atualizarprofessor/:id` — Atualizar
- `DELETE /deleteprofessor/:id` — Deletar

### Cursos
- `GET /selectcursos` — Listar todos
- `POST /inserircursos` — Criar novo
- `PUT /atualizarcurso/:id` — Atualizar
- `DELETE /deletecurso/:id` — Deletar

### Usuários
- `GET /selectusuarios` — Listar todos
- `POST /inserirusuario` — Criar novo
- `PUT /atualizarusuario/:id` — Atualizar
- `DELETE /deleteusuario/:id` — Deletar

### Turmas
- `GET /selectturmas` — Listar todos
- `POST /inserirturma` — Criar novo
- `PUT /atualizarturma/:id` — Atualizar
- `DELETE /deleteturma/:id` — Deletar

### Áreas Acadêmicas
- `GET /selectareas` — Listar todos
- `POST /inserirarea` — Criar novo
- `PUT /atualizararea/:id` — Atualizar
- `DELETE /deletearea/:id` — Deletar

### Projetos
- `GET /selectprojetos` — Listar todos
- `POST /inserirprojeto` — Criar novo
- `PUT /atualizarprojeto/:id` — Atualizar
- `DELETE /deleteprojeto/:id` — Deletar

### Custos
- `GET /selectcustos` — Listar todos
- `POST /inserircusto` — Criar novo
- `PUT /atualizarcusto/:id` — Atualizar
- `DELETE /deletecusto/:id` — Deletar

### Arquivos
- `GET /selectarquivos` — Listar todos
- `POST /inserirarquivo` — Criar novo
- `PUT /atualizararquivo/:id` — Atualizar
- `DELETE /deletarquivos/:id` — Deletar

### Registros
- `GET /selectregistros` — Listar todos
- `POST /inserirregistro` — Criar novo
- `PUT /atualizarregistro/:id` — Atualizar
- `DELETE /deleteregistro/:id` — Deletar

### Meus Projetos
- `GET /selectmeusprojetos` — Listar todos
- `POST /inserirmeuprojeto` — Criar novo
- `PUT /atualizarmeusprojeto/:id` — Atualizar
- `DELETE /deletemeusprojeto/:id` — Deletar

---

## ✅ Validações Automáticas

As seguintes rotas possuem validação de campos obrigatórios:

- **Alunos (INSERT/UPDATE)**: nome_aluno, matricula_aluno
- **Professores (INSERT/UPDATE)**: nome_professor, matricula_professor
- **Cursos (INSERT/UPDATE)**: nome_curso, coordenador
- **Usuários (INSERT/UPDATE)**: nome_usuario, email, password
- **Turmas (INSERT/UPDATE)**: cod_turma, turno
- **Áreas (INSERT/UPDATE)**: nome_area, codigo_area
- **Projetos (INSERT/UPDATE)**: nome_projeto, orientador
- **Meus Projetos (INSERT/UPDATE)**: nome_projeto, usuarios

Se tentar inserir/atualizar sem esses campos, receberá erro 400 com mensagem clara.

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| **405 Method Not Allowed** | Certifique-se que CORS está configurado. Veja acima. |
| **404 Not Found** | Verifique se a rota existe no `resourceMap` do admin.html |
| **500 Internal Server Error** | Verifique credenciais MySQL em `conectaraoDB.js` |
| **CORS Error no console** | Abra DevTools (F12), aba Network, procure pela requisição com erro |
| **Blank Response** | Pode ser que o banco de dados retornou vazio. Insira dados de teste. |

---

## � Autenticação JWT

### Registrar novo usuário:
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome_usuario": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "nome_usuario": "João Silva",
    "email": "joao@example.com"
  }
}
```

### Fazer login:
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome_usuario": "João Silva",
    "email": "joao@example.com"
  }
}
```

### Usar token em requisições protegidas:
```bash
curl -X POST http://localhost:3001/inseriraluno \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nome_aluno": "Maria",
    "matricula_aluno": 20230001
  }'
```

### Verificar se token é válido:
```bash
curl -X GET http://localhost:3001/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📄 Paginação

Todos os endpoints GET suportam paginação com query parameters:

### Query Parameters:
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10, máximo: 100)

### Exemplo:
```bash
# Página 1 com 10 itens
curl http://localhost:3001/selectaluno?page=1&limit=10

# Página 2 com 20 itens
curl http://localhost:3001/selectaluno?page=2&limit=20
```

### Resposta com Paginação:
```json
{
  "message": "Alunos obtidos com sucesso",
  "data": [
    { "id": 1, "nome_aluno": "João", ... },
    { "id": 2, "nome_aluno": "Maria", ... },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Usando no admin.html:
A página admin agora permite definir página e limite:
```
Página: [  1  ]  Limite: [ 10 ]  [Enviar]
```

---

## 📝 Próximos Passos (Opcional)

- [ ] Melhorar documentação da API (Swagger)
- [ ] Criar testes automatizados (Jest)
- [x] ✅ Adicionar upload de arquivos para a rota `/inserirarquivo` — **FEITO!** Ver `FILE_UPLOAD_GUIDE.md` e `UPLOAD_CHANGES.md`
