const express = require('express');
const router = require('./router');
const cors = require('cors');
const path = require('path');

const app = express();

// Origem do frontend (use .env para configurar se preciso)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Configuração de CORS permitindo apenas a origem do frontend e credenciais
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-api-key'],
  credentials: true
}));

// Headers adicionais e política de segurança para permitir embedding (iframe)
app.use((req, res, next) => {
  // Forçar origem específica (evita usar '*') quando credentials = true
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // Permitir que a página /admin seja embutida pelo frontend
  res.header('Content-Security-Policy', `frame-ancestors 'self' ${FRONTEND_ORIGIN}`);

  // Preflight quick response
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API (prefixo opcional para melhor organização)
app.use('/api', router);

// Manter compatibilidade com rotas sem /api
app.use(router);

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rota amigável para abrir a página de administração
// Se o frontend estiver em desenvolvimento (ex: http://localhost:3000) redireciona
// para a rota /admin do frontend para usar a versão Next.js. Caso contrário,
// serve o admin.html estático (compatibilidade retroativa).
app.get('/admin', (req, res) => {
  try {
    const frontendOrigin = (typeof FRONTEND_ORIGIN === 'string' && FRONTEND_ORIGIN) ? FRONTEND_ORIGIN.replace(/\/$/, '') : '';
    const isLocalFrontend = frontendOrigin && (frontendOrigin.includes('localhost') || frontendOrigin.includes('127.0.0.1'));

    if (isLocalFrontend) {
      // Redireciona para o admin do frontend dev server
      return res.redirect(`${frontendOrigin}/admin`);
    }

    // Fallback: servir a versão estática embarcada
    return res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
  } catch (err) {
    console.error('Erro ao redirecionar /admin:', err);
    return res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
  }
});

// Rota para download de arquivos
app.get('/downloadarquivo/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '..', 'uploads', filename);
  
  // Segurança: verificar se o arquivo está dentro da pasta uploads
  const realPath = path.resolve(filepath);
  const uploadsDir = path.resolve(path.join(__dirname, '..', 'uploads'));
  
  if (!realPath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  res.download(filepath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'Arquivo não encontrado', filename });
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.send('API funcionando! Acesse <a href="/admin">página de admin</a> para testar.');
});

// Tratamento de rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', path: req.path, method: req.method });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
});

module.exports = app;