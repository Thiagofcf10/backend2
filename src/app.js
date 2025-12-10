const express = require('express');
const router = require('./router');
const cors = require('cors');
const path = require('path');

const app = express();

// Suporta múltiplas origens via FRONTEND_ORIGINS (vírgula-separado) ou fallback FRONTEND_ORIGIN
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS && process.env.FRONTEND_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
) || (process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : ['http://repo_ifpa-nginx-1:80', 'http://frontrepo:3000']);

// If no explicit FRONTEND_ORIGINS or FRONTEND_ORIGIN provided, allow any origin
const ALLOW_ANY_ORIGIN = !(process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN);

// Configuração de CORS com whitelist dinâmica. Usa função para validar origem e manter 'credentials: true'.
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // During development, allow any localhost origin variants (convenience)
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (isDev && (/localhost|127\.0\.0\.1|::1/).test(origin)) return callback(null, true);

    // If explicitly allowed to accept any origin, permit and echo later
    if (ALLOW_ANY_ORIGIN) return callback(null, true);

    if (FRONTEND_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-api-key'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Headers adicionais e política de segurança para permitir embedding (iframe)
app.use((req, res, next) => {
  // Ajustar cabeçalhos CORS dinamicamente com base no origin permitido
  const reqOrigin = req.headers.origin;
  if (reqOrigin && FRONTEND_ORIGINS.indexOf(reqOrigin) !== -1) {
    res.header('Access-Control-Allow-Origin', reqOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Content-Security-Policy', `frame-ancestors 'self' ${reqOrigin}`);
  } else if (reqOrigin) {
    // Helpful warning for debugging CORS in development
    console.warn(`CORS: origin not in whitelist: ${reqOrigin} (allowed: ${FRONTEND_ORIGINS.join(',')})`);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

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
    const isLocalFrontend = frontendOrigin && (frontendOrigin.includes('localhost') || frontendOrigin.includes('127.0.0.1') || frontendOrigin.includes('frontrepo'));

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

// Debug: mostrar as origens permitidas e se a origem da requisição é aceita
app.get('/debug/cors', (req, res) => {
  try {
    const FRONTENDS = FRONTEND_ORIGINS || [];
    const origin = req.headers.origin || null;
    const isAllowed = origin ? (FRONTENDS.indexOf(origin) !== -1 || ((process.env.NODE_ENV || 'development') === 'development' && (/localhost|127\.0\.0\.1|::1/).test(origin))) : false;
    return res.status(200).json({ allowedOrigins: FRONTENDS, requestOrigin: origin, isAllowed });
  } catch (err) {
    return res.status(500).json({ error: 'erro ao verificar cors', message: err.message });
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