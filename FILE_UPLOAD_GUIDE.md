# 📤 Guia de Upload de Arquivos

## Visão Geral

A rota `/inserirarquivo` agora suporta **upload de arquivos** junto com metadados textuais. Os arquivos são salvos no diretório `/uploads` do servidor e as informações são registradas no banco de dados.

---

## 🛠️ Configuração

### Dependências Instaladas
- **multer** (^1.4.5-lts.1) — Middleware para processar multipart/form-data

### Diretório de Uploads
- Local: `/uploads` (raiz do projeto)
- Tamanho máximo: **50 MB** por arquivo
- Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, WEBP

### Estrutura do Banco de Dados
A tabela `arquivos` agora possui novas colunas:

```sql
ALTER TABLE arquivos ADD COLUMN (
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nome_arquivo VARCHAR(255),
    caminho_arquivo VARCHAR(500),
    tipo_arquivo VARCHAR(100),
    tamanho_arquivo INT
);
```

---

## 📋 Como Usar

### Opção 1: Via Admin Panel (Interface Web)

1. **Acesse a página admin:**
   ```
   http://localhost:3001/admin
   ```

2. **Selecione a aba "📋 Outros"**

3. **Configure o formulário:**
   - Recurso: `📁 Arquivos (com upload)`
   - Método: `POST - Criar novo`

4. **Preencha os campos:**
   - Selecione um arquivo no input `📤 Arquivo para upload`
   - Preencha o JSON com os dados do arquivo (veja exemplo abaixo)

5. **Clique em "Enviar"**

**Exemplo de JSON:**
```json
{
  "id_meuprojeto": 1,
  "resumo": "Resumo do trabalho acadêmico",
  "justificativa": "Justificativa do projeto",
  "objetivo": "Objetivo principal",
  "sumario": "Índice e sumário",
  "introducao": "Introdução do trabalho",
  "bibliografia": "Referências bibliográficas"
}
```

### Opção 2: Via cURL (Terminal)

```bash
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "arquivo=@/caminho/para/arquivo.pdf" \
  -F "id_meuprojeto=1" \
  -F "resumo=Resumo do arquivo" \
  -F "justificativa=Justificativa" \
  -F "objetivo=Objetivo" \
  -F "sumario=Sumário" \
  -F "introducao=Introdução" \
  -F "bibliografia=Bibliografia"
```

### Opção 3: Via JavaScript Fetch

```javascript
const formData = new FormData();
formData.append('arquivo', fileInputElement.files[0]);
formData.append('id_meuprojeto', 1);
formData.append('resumo', 'Resumo do arquivo');
formData.append('justificativa', 'Justificativa');
formData.append('objetivo', 'Objetivo');
formData.append('sumario', 'Sumário');
formData.append('introducao', 'Introdução');
formData.append('bibliografia', 'Bibliografia');

const token = localStorage.getItem('token'); // Assumindo que você armazena o JWT no localStorage

const response = await fetch('http://localhost:3001/inserirarquivo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## ✅ Validações

### Tipos de Arquivo Permitidos
| Extensão | MIME Type | Descrição |
|----------|-----------|-----------|
| `.pdf` | application/pdf | Documento PDF |
| `.doc` | application/msword | Word 97-2003 |
| `.docx` | application/vnd.openxmlformats-officedocument.wordprocessingml.document | Word 2007+ |
| `.xls` | application/vnd.ms-excel | Excel 97-2003 |
| `.xlsx` | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | Excel 2007+ |
| `.txt` | text/plain | Arquivo de texto |
| `.jpg` / `.jpeg` | image/jpeg | Imagem JPEG |
| `.png` | image/png | Imagem PNG |
| `.gif` | image/gif | Imagem GIF |
| `.webp` | image/webp | Imagem WebP |

### Limites
- **Tamanho máximo**: 50 MB
- **Nomeação**: Automática (timestamp + random suffix)
- **Autenticação**: Obrigatório JWT token válido

---

## 📊 Resposta da API

### Sucesso (201 Created)
```json
{
  "message": "Arquivo criado com sucesso",
  "id": 15,
  "arquivo": {
    "nome": "documento.pdf",
    "tamanho": 245632
  }
}
```

### Erro - Arquivo Inválido (500)
```json
{
  "error": "Tipo de arquivo não permitido: application/x-msdownload. Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, WEBP"
}
```

### Erro - Arquivo muito Grande (500)
```json
{
  "error": "File too large"
}
```

### Erro - Não Autenticado (401)
```json
{
  "error": "Token não fornecido ou inválido"
}
```

---

## 🔍 Estrutura de Arquivo no Servidor

Quando um arquivo é feito upload, ele é salvo com um nome único:

```
uploads/
├── documento-1731758342123-123456789.pdf
├── relatorio-1731758445789-987654321.docx
└── imagem-1731758567234-555555555.jpg
```

As informações são armazenadas no banco de dados:

| Campo | Exemplo |
|-------|---------|
| `nome_arquivo` | documento.pdf |
| `caminho_arquivo` | /home/thiag/repo_ifpa/backend/uploads/documento-1731758342123-123456789.pdf |
| `tipo_arquivo` | application/pdf |
| `tamanho_arquivo` | 245632 |

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| **"Token não fornecido"** | Certifique-se de fazer login antes. Use a aba "👤 Usuários" para registrar e fazer login. |
| **"Tipo de arquivo não permitido"** | Verifique se a extensão do arquivo está na lista permitida. |
| **"File too large"** | O arquivo excede 50 MB. Comprima ou divida o arquivo. |
| **"Arquivo criado mas caminho vazio"** | Verifique permissões da pasta `/uploads` (use `chmod 755 uploads`). |
| **Erro 405 Method Not Allowed** | Verifique se o CORS está configurado corretamente em `src/app.js`. |

---

## 🔐 Segurança

1. **Autenticação JWT**: Obrigatória para fazer upload
2. **Validação de tipo**: Verifica MIME type e extensão
3. **Limite de tamanho**: Máximo 50 MB
4. **Nome único**: Evita sobrescrita de arquivos
5. **Armazenamento fora do web root**: Arquivos em `/uploads` (não servidos diretamente)

---

## 📝 Exemplo Completo

### Passo a Passo

1. **Registre um usuário (se ainda não tiver):**
   ```bash
   curl -X POST http://localhost:3001/register \
     -H "Content-Type: application/json" \
     -d '{
       "nome_usuario": "usuario_teste",
       "email": "teste@example.com",
       "password": "senha123"
     }'
   ```

2. **Faça login:**
   ```bash
   curl -X POST http://localhost:3001/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teste@example.com",
       "password": "senha123"
     }'
   ```
   Copie o token da resposta.

3. **Faça upload do arquivo:**
   ```bash
   curl -X POST http://localhost:3001/inserirarquivo \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -F "arquivo=@documento.pdf" \
     -F "id_meuprojeto=1" \
     -F "resumo=Meu resumo"
   ```

4. **Verifique o arquivo no banco:**
   ```bash
   curl http://localhost:3001/selectarquivos
   ```

---

## 🎯 Próximos Passos Opcionais

- [ ] Adicionar rota GET para download de arquivos (`/downloadarquivo/:id`)
- [ ] Implementar deleção física de arquivo quando registro é deletado
- [ ] Adicionar compressão de imagens antes de salvar
- [ ] Implementar antivírus scan nos arquivos
- [ ] Adicionar suporte a vários arquivos por upload (multi-file)
