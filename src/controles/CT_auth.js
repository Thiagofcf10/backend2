const auth = require('../autenticacao/auth');

/**
 * POST /login - Fazer login
 * Body: { email, password }
 * Response: { token, user }
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    // fetch user row
    const connection = require('../DBmysql/conectaraoDB');
    const bcrypt = require('bcryptjs');
    const [rows] = await connection.execute('SELECT id, nome_usuario, email, password, ativo FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
    const user = rows[0];
    if (!user.ativo) return res.status(403).json({ error: 'Usuário inativo' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    // If 2FA is required (default true), generate & send OTP and require verification
    const require2FA = (process.env.REQUIRE_2FA || 'true') === 'true';
    if (require2FA) {
      // create OTP and send email (store hashed code to match CT_otp verification)
      const nodemailer = require('nodemailer');
      const crypto = require('crypto');
      const OTP_HASH_SALT = process.env.OTP_HASH_SALT || '';
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_TTL_MINUTES || '10', 10) * 60 * 1000));
      const hashed = crypto.createHash('sha256').update(code + OTP_HASH_SALT).digest('hex');
      await connection.execute('INSERT INTO otps (email, code, purpose, expires_at, used) VALUES (?, ?, ?, ?, 0)', [email, hashed, 'login', expiresAt]);

      // try to send email if SMTP configured
      const host = process.env.SMTP_HOST;
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
      if (host && port) {
        try {
          const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
          const from = process.env.FROM_EMAIL || process.env.SMTP_USER || `no-reply@${process.env.SMTP_HOST || 'localhost'}`;
          const ttl = process.env.OTP_TTL_MINUTES || 10;
          // build same email template as CT_otp
          const appName = process.env.APP_NAME || 'IFPA Projetos';
          const subject = process.env.OTP_SUBJECT || `${appName} — Código de verificação`;
          const purposeLabel = 'autenticação (login)';
          const support = process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || 'no-reply@local.test';
          const text = `${appName}\n\nOlá,\n\nSeu código de verificação para ${purposeLabel} é: ${code}\n\nValidade: ${ttl} minutos.\n\nSe você não solicitou este código, ignore esta mensagem ou entre em contato: ${support}`;
          const html = `
            <div style="font-family: Arial, sans-serif; color: #111; line-height:1.4">
              <h2 style="color:#0b5fff">${appName}</h2>
              <p>Olá,</p>
              <p>Seu código de verificação para <strong>${purposeLabel}</strong> é:</p>
              <p style="font-size:18px; font-weight:700; background:#f3f4f6; display:inline-block; padding:10px 14px; border-radius:6px">${code}</p>
              <p style="margin-top:12px">Validade: <strong>${ttl} minutos</strong></p>
              <hr style="border:none; border-top:1px solid #eee; margin:16px 0" />
              <p style="font-size:13px; color:#666">Se você não solicitou este código, ignore esta mensagem ou entre em contato: <a href="mailto:${support}">${support}</a></p>
            </div>`;

          try {
            await transporter.sendMail({ from, to: email, subject, text, html });
          } catch (mailErr) {
            console.error('Erro ao enviar email OTP (login):', mailErr);
            // SMTP failed: in non-production, write OTP to /tmp for developer convenience
            try {
              if ((process.env.NODE_ENV || 'development') !== 'production') {
                const fs = require('fs');
                const now = Date.now();
                const debugPath = `/tmp/otp_login_${email.replace(/[^a-z0-9@.\-]/gi, '_')}_${now}.txt`;
                fs.writeFileSync(debugPath, `OTP for ${email}: ${code}\nExpires: ${expiresAt.toISOString()}\n`);
                console.info('OTP (login) written to', debugPath);
              }
            } catch (writeErr) {
              console.warn('Não foi possível gravar OTP de login em arquivo temporário:', writeErr && writeErr.message ? writeErr.message : writeErr);
            }
          }
        } catch (errAll) {
          console.error('Erro ao preparar transporter SMTP (login OTP):', errAll && errAll.message ? errAll.message : errAll);
          // As fallback, write OTP to /tmp in development
          try {
            if ((process.env.NODE_ENV || 'development') !== 'production') {
              const fs = require('fs');
              const now = Date.now();
              const debugPath = `/tmp/otp_login_${email.replace(/[^a-z0-9@.\-]/gi, '_')}_${now}.txt`;
              fs.writeFileSync(debugPath, `OTP for ${email}: ${code}\nExpires: ${expiresAt.toISOString()}\n`);
              console.info('OTP (login) written to', debugPath);
            }
          } catch (writeErr) {
            console.warn('Não foi possível gravar OTP de login em arquivo temporário:', writeErr && writeErr.message ? writeErr.message : writeErr);
          }
        }
      } else {
        // No SMTP configured: write OTP to /tmp in development for convenience
        try {
          if ((process.env.NODE_ENV || 'development') !== 'production') {
            const fs = require('fs');
            const now = Date.now();
            const debugPath = `/tmp/otp_login_${email.replace(/[^a-z0-9@.\-]/gi, '_')}_${now}.txt`;
            fs.writeFileSync(debugPath, `OTP for ${email}: ${code}\nExpires: ${expiresAt.toISOString()}\n`);
            console.info('SMTP não configurado — OTP (login) escrito em', debugPath);
          }
        } catch (writeErr) {
          console.warn('Não foi possível gravar OTP de login em arquivo temporário:', writeErr && writeErr.message ? writeErr.message : writeErr);
        }
      }

      return res.status(200).json({ message: 'Two-factor code sent', twoFactorRequired: true, email });
    }

    // If not requiring 2FA, fall back to issuing token as before
    const result = await auth.login(email, password);
    return res.status(200).json({ message: 'Login realizado com sucesso', ...result });
  } catch (err) {
    console.error('Erro no login:', err.message || err);
    const statusCode = err.message === 'Usuário não encontrado' || err.message === 'Senha incorreta' ? 401 : 400;
    return res.status(statusCode).json({ error: err.message || String(err) });
  }
};

/**
 * POST /register - Registrar novo usuário
 * Body: { nome_usuario, email, password }
 * Response: { user }
 */
const registerController = async (req, res) => {
  try {
    const { nome_usuario, email, password } = req.body;
    
    if (!nome_usuario || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const user = await auth.register(nome_usuario, email, password);
    
    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user
    });
  } catch (err) {
    console.error('Erro no registro:', err.message);
    const statusCode = err.message === 'Email já registrado' ? 409 : 400;
    return res.status(statusCode).json({ error: err.message });
  }
};

/**
 * POST /guest-token - Gerar token temporário para convidados (sem necessidade de autenticação)
 * Body (opcional): { expiry: '1h' }
 * Response: { token }
 */
const guestTokenController = (req, res) => {
  try {
    const { expiry } = req.body || {};
    const result = auth.generateGuestToken ? auth.generateGuestToken(expiry) : auth.generateGuestToken(expiry);
    return res.status(200).json({ message: 'Guest token gerado', token: result.token });
  } catch (err) {
    console.error('Erro ao gerar guest token:', err);
    return res.status(500).json({ error: 'Erro ao gerar guest token' });
  }
};

/**
 * GET /verify - Verificar se token é válido
 * Header: Authorization: Bearer <token>
 * Response: { user }
 */
const verifyController = async (req, res) => {
  // The middleware authenticateToken already verified the token and ensured
  // the user is present and active when token includes an id.
  try {
    const connection = require('../DBmysql/conectaraoDB');
    // If req.user contains only decoded token info, try to fetch freshest user data
    if (req.user && req.user.id) {
      const [rows] = await connection.execute('SELECT id, nome_usuario, email FROM usuarios WHERE id = ? LIMIT 1', [req.user.id]);
      if (!rows || rows.length === 0) {
        return res.status(403).json({ error: 'Usuário não encontrado' });
      }
      const user = rows[0];
      return res.status(200).json({ message: 'Token válido', user: { id: user.id, nome_usuario: user.nome_usuario, email: user.email, role: req.user.role } });
    }

    return res.status(200).json({ message: 'Token válido', user: req.user });
  } catch (err) {
    console.error('Erro em verifyController:', err && (err.message || err));
    return res.status(500).json({ error: 'Erro ao verificar token' });
  }
};

/**
 * POST /logout - Logout (apenas para frontend, backend não precisa fazer nada)
 */
const logoutController = (req, res) => {
  return res.status(200).json({
    message: 'Logout realizado. Remova o token do localStorage.'
  });
};

/**
 * POST /reset-password - reset password using OTP
 * Body: { email, code, newPassword }
 */
const resetPasswordController = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' });

    const connection = require('../DBmysql/conectaraoDB');
    // find matching OTP for password_reset
    await connection.execute(`CREATE TABLE IF NOT EXISTS otps (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL, code VARCHAR(32) NOT NULL, purpose VARCHAR(50) DEFAULT 'generic', expires_at DATETIME NOT NULL, used TINYINT(1) DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    const [rows] = await connection.execute('SELECT id FROM otps WHERE email = ? AND code = ? AND purpose = ? AND used = 0 AND expires_at >= NOW() ORDER BY id DESC LIMIT 1', [email, code, 'password_reset']);
    if (!rows || rows.length === 0) return res.status(400).json({ error: 'Código inválido ou expirado' });
    const otp = rows[0];

    // update user password
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    const [urows] = await connection.execute('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (!urows || urows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    const user = urows[0];
    await connection.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, user.id]);

    // mark otp used
    await connection.execute('UPDATE otps SET used = 1 WHERE id = ?', [otp.id]);

    return res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro ao resetar senha:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Erro ao resetar senha' });
  }
};

module.exports = {
  loginController,
  registerController,
  guestTokenController,
  verifyController,
  logoutController,
  resetPasswordController
};
