# ✅ Upload de Arquivos - Implementação Completa

## 📋 Resumo das Mudanças

Foram adicionadas funcionalidades completas de **upload de arquivos** para a rota `/inserirarquivo`. Aqui está tudo o que foi implementado:

---

## 📁 Arquivos Modificados

### 1. **package.json**
- ✅ Adicionada dependência `multer` (^1.4.5-lts.1)

```json
"dependencies": {
  "multer": "^1.4.5-lts.1"
}
```

### 2. **src/DBmysql/DB.sql**
- ✅ Adicionadas 4 novas colunas na tabela `arquivos`:
  - `created_at` - Timestamp automático
  - `nome_arquivo` - Nome original do arquivo
  - `caminho_arquivo` - Caminho completo no servidor
  - `tipo_arquivo` - MIME type do arquivo
  - `tamanho_arquivo` - Tamanho em bytes

### 3. **src/middlewares/upload.js** (NOVO)
- ✅ Arquivo criado com configuração do Multer:
  - Armazenamento em `/uploads`
  - Nomes únicos com timestamp
  - Filtro de tipos permitidos (PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, WEBP)
  - Limite de 50 MB por arquivo

### 4. **src/modelos/arquivos.js**
- ✅ Função `inserirArquivo` atualizada para incluir:
  - `nome_arquivo`
  - `caminho_arquivo`
  - `tipo_arquivo`
  - `tamanho_arquivo`

### 5. **src/controles/CT_insert.js**
- ✅ Função `inserirArquivo` reescrita como custom handler:
  - Extrai informações do arquivo do Multer
  - Adiciona dados ao banco
  - Limpa arquivo se houver erro

### 6. **src/router.js**
- ✅ Importada middleware de upload
- ✅ Rota `/inserirarquivo` atualizada:
  ```javascript
  router.post('/inserirarquivo', authenticateToken, upload.single('arquivo'), CT_insert.inserirArquivo);
  ```

### 7. **src/app.js**
- ✅ Adicionada rota de download:
  ```javascript
  app.get('/downloadarquivo/:filename', ...)
  ```

### 8. **public/admin.html**
- ✅ Input file adicionado na seção "Outros"
- ✅ Função `updateOutrosResource()` criada
- ✅ Função `sendRequest()` atualizada para suportar FormData
- ✅ Validações e visibilidade condicional do upload

### 9. **uploads/** (NOVO)
- ✅ Diretório criado para armazenar arquivos

### 10. **FILE_UPLOAD_GUIDE.md** (NOVO)
- ✅ Documentação completa sobre como usar o upload

---

## 🚀 Como Usar

### Instalação
```bash
cd /home/thiag/repo_ifpa/backend
npm install  # Instala multer automaticamente
```

### Iniciar servidor
```bash
npm start
# ou para desenvolvimento
npm run dev
```

### Via Interface Web

1. Abra http://localhost:3001/admin
2. Selecione aba **"📋 Outros"**
3. Configure:
   - Recurso: **📁 Arquivos (com upload)**
   - Método: **POST - Criar novo**
4. Selecione arquivo e preencha JSON
5. Clique **Enviar**

### Via cURL

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"nome_usuario":"user","email":"user@test.com","password":"123"}'

# 2. Fazer login
TOKEN=$(curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123"}' | jq -r '.token')

# 3. Upload de arquivo
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer $TOKEN" \
  -F "arquivo=@documento.pdf" \
  -F "id_meuprojeto=1" \
  -F "resumo=Meu resumo"
```

### Via JavaScript

```javascript
const formData = new FormData();
formData.append('arquivo', fileInput.files[0]);
formData.append('id_meuprojeto', 1);
formData.append('resumo', 'Resumo do arquivo');

const response = await fetch('/inserirarquivo', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## ✅ Validações

### Tipos Permitidos
- `.pdf` → application/pdf
- `.doc` / `.docx` → Microsoft Word
- `.xls` / `.xlsx` → Microsoft Excel
- `.txt` → Texto simples
- `.jpg` / `.jpeg` / `.png` / `.gif` / `.webp` → Imagens

### Limites
- **Tamanho**: Máximo 50 MB
- **Autenticação**: Obrigatório JWT válido

---

## 📊 Estrutura de Dados

### Requisição POST (FormData)
```
arquivo: <File object>
id_meuprojeto: 1
resumo: string
justificativa: string
objetivo: string
sumario: string
introducao: string
bibliografia: string
```

### Resposta (201 Created)
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

### Banco de Dados
```sql
SELECT * FROM arquivos;
-- id | created_at | id_meuprojeto | resumo | nome_arquivo | caminho_arquivo | tipo_arquivo | tamanho_arquivo
```

---

## 🔐 Segurança Implementada

1. ✅ **Autenticação JWT**: Obrigatória
2. ✅ **Validação de tipo**: MIME + extensão
3. ✅ **Limite de tamanho**: 50 MB máximo
4. ✅ **Nomes únicos**: Previne sobrescrita
5. ✅ **Path traversal protection**: Verificação de diretório em download

---

## 📁 Estrutura de Arquivos

```
backend/
├── uploads/                          (NOVO - armazena arquivos)
│   ├── documento-123456789-111.pdf
│   ├── relatorio-123456790-222.docx
│   └── imagem-123456791-333.jpg
├── src/
│   ├── middlewares/
│   │   ├── upload.js                (NOVO - configuração Multer)
│   │   └── paginacao.js
│   ├── modelos/
│   │   └── arquivos.js              (MODIFICADO)
│   ├── controles/
│   │   ├── CT_insert.js             (MODIFICADO)
│   │   └── ...
│   ├── DBmysql/
│   │   └── DB.sql                   (MODIFICADO)
│   ├── app.js                       (MODIFICADO - rota download)
│   └── router.js                    (MODIFICADO - middleware upload)
├── public/
│   └── admin.html                   (MODIFICADO - UI upload)
├── package.json                     (MODIFICADO - multer)
├── FILE_UPLOAD_GUIDE.md             (NOVO - documentação)
└── UPLOAD_CHANGES.md                (NOVO - este arquivo)
```

---

## 🧪 Testes Recomendados

### 1. Upload Simples
```bash
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer TOKEN" \
  -F "arquivo=@test.pdf" \
  -F "id_meuprojeto=1" \
  -F "resumo=Teste"
```

### 2. Arquivo Inválido (deve falhar)
```bash
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer TOKEN" \
  -F "arquivo=@script.exe" \
  -F "id_meuprojeto=1"
```

### 3. Arquivo Muito Grande (deve falhar)
```bash
dd if=/dev/zero of=large.bin bs=1M count=100
curl -X POST http://localhost:3001/inserirarquivo \
  -H "Authorization: Bearer TOKEN" \
  -F "arquivo=@large.bin" \
  -F "id_meuprojeto=1"
```

### 4. Download do Arquivo
```bash
curl -X GET http://localhost:3001/downloadarquivo/documento-123456789-111.pdf \
  -o downloaded.pdf
```

---

## 🐛 Solução de Problemas

| Erro | Causa | Solução |
|------|-------|---------|
| `404 Not Found` | Arquivo não existe | Verifique o nome do arquivo em `/uploads` |
| `401 Unauthorized` | Token inválido | Faça login e use o token correto |
| `413 Payload Too Large` | Arquivo > 50 MB | Comprima ou divida o arquivo |
| `415 Unsupported Media Type` | Tipo não permitido | Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF ou WEBP |
| `500 Internal Server Error` | Erro no servidor | Verifique logs: `npm run dev` |

---

## 📝 Próximos Passos Opcionais

- [ ] Adicionar rota DELETE que deleta arquivo físico também
- [ ] Implementar compressão de imagens
- [ ] Adicionar antivírus scan
- [ ] Suportar múltiplos arquivos por upload
- [ ] Gerar thumbnails para imagens
- [ ] Implementar sistema de quotas por usuário
- [ ] Adicionar versionamento de arquivos

---

## 💡 Notas Importantes

1. **Permissões da pasta**: Certifique-se que `/uploads` tem permissão de escrita (755)
   ```bash
   chmod 755 uploads
   ```

2. **Tokens JWT**: Obrigatórios para upload
   - Registre um usuário em `/register`
   - Faça login em `/login`
   - Use o token em `Authorization: Bearer TOKEN`

3. **Banco de dados**: Importante executar o schema SQL atualizado
   - Se já tem a tabela, execute:
   ```sql
   ALTER TABLE arquivos ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
   ALTER TABLE arquivos ADD COLUMN nome_arquivo VARCHAR(255);
   ALTER TABLE arquivos ADD COLUMN caminho_arquivo VARCHAR(500);
   ALTER TABLE arquivos ADD COLUMN tipo_arquivo VARCHAR(100);
   ALTER TABLE arquivos ADD COLUMN tamanho_arquivo INT;
   ```

---

## 📚 Documentação Relacionada

- Ver `FILE_UPLOAD_GUIDE.md` para guia completo de uso
- Ver `ADMIN_SETUP.md` para outras APIs
- Ver `src/middlewares/upload.js` para configurações Multer

---

**Status**: ✅ Implementação completa
**Data**: 2024
**Autor**: Sistema de Upload
