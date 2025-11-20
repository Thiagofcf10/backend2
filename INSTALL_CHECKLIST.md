# 📋 Checklist de Instalação - Upload de Arquivos

## ✅ Pré-Requisitos

- [x] Node.js instalado
- [x] MySQL conectado
- [x] Backend funcionando em `localhost:3001`

## 🔧 Instalação Passo-a-Passo

### 1. Instalar Dependências
```bash
cd /home/thiag/repo_ifpa/backend
npm install
```
- ✅ `multer` será instalado automaticamente

### 2. Atualizar Banco de Dados

**Opção A: Banco novo (executar DB.sql completo)**
```bash
mysql -u root -p repo_ifpa < src/DBmysql/DB.sql
```

**Opção B: Banco existente (adicionar colunas)**
```sql
-- Conectar ao MySQL
mysql -u root -p

-- Usar database
USE repo_ifpa;

-- Adicionar colunas (execute uma por uma)
ALTER TABLE arquivos ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE arquivos ADD COLUMN nome_arquivo VARCHAR(255);
ALTER TABLE arquivos ADD COLUMN caminho_arquivo VARCHAR(500);
ALTER TABLE arquivos ADD COLUMN tipo_arquivo VARCHAR(100);
ALTER TABLE arquivos ADD COLUMN tamanho_arquivo INT;
```

### 3. Verificar Pasta de Uploads
```bash
# Pasta já foi criada, mas verificar permissões
ls -la uploads/
# Deve retoriar: drwxr-xr-x (755)

# Se não tiver permissão:
chmod 755 uploads
```

### 4. Iniciar Servidor
```bash
npm start
# ou para desenvolvimento com auto-reload:
npm run dev
```

O servidor deve iniciar em `http://localhost:3001`

### 5. Acessar Admin Panel
```
Abra no navegador: http://localhost:3001/admin
```

---

## ✔️ Verificação de Instalação

### 1. Verificar Dependências
```bash
npm list multer
# Deve retornar: multer@1.4.5-lts.1
```

### 2. Testar Arquivo de Upload
```bash
ls -la src/middlewares/upload.js
# Deve existir
```

### 3. Testar Pasta de Uploads
```bash
ls -la uploads/
# Deve estar vazia ou com arquivos antigos
```

### 4. Testar Banco de Dados
```sql
-- No MySQL:
DESCRIBE arquivos;
-- Deve retornar 9+ colunas incluindo:
-- - nome_arquivo
-- - caminho_arquivo
-- - tipo_arquivo
-- - tamanho_arquivo
```

### 5. Testar API
```bash
# Registrar
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"nome_usuario":"test","email":"test@test.com","password":"test"}'

# Se retornar status 201, ✅ API está funcionando
```

---

## 🧪 Teste de Upload

### Teste 1: Upload Simples ✅

```bash
# 1. Login e pegar token
TOKEN=$(curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# 2. Criar arquivo de teste
echo "Conteúdo do teste" > teste.txt

# 3. Fazer upload
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer $TOKEN" \
  -F "arquivo=@teste.txt" \
  -F "id_meuprojeto=1" \
  -F "resumo=Teste"

# Esperado: 201 Created com mensagem "Arquivo criado com sucesso"
```

### Teste 2: Arquivo Inválido ❌

```bash
# Criar arquivo com extensão não permitida
echo "conteúdo" > script.exe

# Tentar upload (deve falhar)
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer $TOKEN" \
  -F "arquivo=@script.exe" \
  -F "id_meuprojeto=1"

# Esperado: 500 com erro sobre tipo não permitido
```

### Teste 3: Via Admin Panel

1. Abra http://localhost:3001/admin
2. Aba: **📋 Outros**
3. Selecione: **📁 Arquivos (com upload)**
4. Método: **POST - Criar novo**
5. Escolha um arquivo PDF/JPG/DOCX
6. Preencha o JSON:
```json
{
  "id_meuprojeto": 1,
  "resumo": "Teste via admin",
  "justificativa": "Teste",
  "objetivo": "Teste",
  "sumario": "Teste",
  "introducao": "Teste",
  "bibliografia": "Teste"
}
```
7. Clique **Enviar**
8. Esperado: `{ "message": "Arquivo criado com sucesso", "id": ..., "arquivo": {...} }`

---

## 🐛 Troubleshooting

### Problema: `Cannot find module 'multer'`
```bash
# Solução:
npm install multer@1.4.5-lts.1
```

### Problema: `EACCES: permission denied` na pasta uploads
```bash
# Solução:
chmod 755 uploads
chmod 755 .
```

### Problema: `ER_BAD_FIELD_ERROR` no banco
```sql
-- Solução: As colunas não existem
-- Execute todos os ALTER TABLE acima
```

### Problema: `401 Unauthorized` ao fazer upload
```bash
# Solução:
# 1. Registre um usuário via /register
# 2. Faça login via /login
# 3. Use o token na requisição
```

### Problema: `413 Payload Too Large`
```bash
# Solução: Arquivo > 50 MB
# Comprima ou divida o arquivo
```

---

## 📊 Estrutura Final

Após instalação, você terá:

```
backend/
├── uploads/                    ← Arquivos são salvos aqui
│   └── documento-123456-789.pdf
├── src/
│   ├── middlewares/
│   │   └── upload.js          ← Configuração Multer
│   ├── controles/
│   │   └── CT_insert.js       ← Handler customizado
│   ├── modelos/
│   │   └── arquivos.js        ← Modelo atualizado
│   ├── router.js              ← Rota com middleware
│   └── app.js                 ← Rota de download
├── public/
│   └── admin.html             ← UI atualizada
├── package.json               ← multer adicionado
├── FILE_UPLOAD_GUIDE.md       ← Guia de uso
└── UPLOAD_CHANGES.md          ← Detalhes de mudanças
```

---

## 📚 Documentação

Após instalação, consulte:

1. **FILE_UPLOAD_GUIDE.md** - Como usar
2. **UPLOAD_CHANGES.md** - O que mudou
3. **UPLOAD_README.md** - Visão geral
4. **ADMIN_SETUP.md** - Setup geral

---

## ✨ Pronto!

Após completar os passos acima, você pode:

- ✅ Fazer upload de arquivos
- ✅ Consultar uploads no banco
- ✅ Baixar arquivos
- ✅ Testar via Admin Panel ou cURL

**Status**: ✅ Installação Completa

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o Node.js está instalado: `node -v`
2. Verifique se MySQL está rodando: `mysql -u root -p -e "SELECT 1"`
3. Verifique logs: `npm run dev` (modo desenvolvimento)
4. Consulte a documentação em `FILE_UPLOAD_GUIDE.md`
