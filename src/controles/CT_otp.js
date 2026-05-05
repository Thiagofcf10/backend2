const connection = require('../DBmysql/conectaraoDB');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const auth = require('../autenticacao/auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Rate limit / security defaults (configuráveis via env)
const OTP_WINDOW_MINUTES = parseInt(process.env.OTP_WINDOW_MINUTES || '10', 10);
const OTP_PER_EMAIL_WINDOW = parseInt(process.env.OTP_PER_EMAIL_WINDOW || '3', 10);
const OTP_PER_IP_WINDOW = parseInt(process.env.OTP_PER_IP_WINDOW || '10', 10);
const VERIFY_ATTEMPTS_WINDOW_MINUTES = parseInt(process.env.VERIFY_ATTEMPTS_WINDOW_MINUTES || '15', 10);
const VERIFY_MAX_FAILED_ATTEMPTS = parseInt(process.env.VERIFY_MAX_FAILED_ATTEMPTS || '5', 10);
const OTP_HASH_SALT = process.env.OTP_HASH_SALT || '';

// Ensure otps table exists
const ensureOtpTable = async () => {
  const create = `
    CREATE TABLE IF NOT EXISTS otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(128) NOT NULL,
      purpose VARCHAR(50) DEFAULT 'generic',
      ip VARCHAR(100),
      expires_at DATETIME NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await connection.execute(create);
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) return null;

  // don't log credentials, but helpful to know whether SMTP config looks present
  console.info('SMTP config present; creating transporter', { host, port, secure: port === 465, hasAuth: !!(user && pass) });

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port, // true for 465, false for other ports
    auth: user && pass ? { user, pass } : undefined,
  });

  // Verify transporter connectivity asynchronously (best-effort)
  transport.verify().then(() => {
    console.info('SMTP transporter verified');
  }).catch((verifyErr) => {
    console.warn('SMTP transporter verify failed:', verifyErr && (verifyErr.message || verifyErr));
  });

  return transport;
};

// Build a consistent OTP email (text + html)
const buildOtpEmail = (code, purpose, ttl, to) => {
  const appName = process.env.APP_NAME || 'IFPA Projetos';
  const subject = process.env.OTP_SUBJECT || `${appName} — Código de verificação`;
  const purposeLabel = purpose === 'password_reset' ? 'recuperação de senha' : (purpose === 'login' ? 'autenticação (login)' : 'verificação');
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

  return { subject, text, html };
};

/**
 * POST /send-otp
 * Body: { email }
 */
const sendOtpController = async (req, res) => {
  try {
    const { email, purpose } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

    // Enforce sending to the user's registered email for sensitive purposes
    let toEmail = email;
    const sensitivePurposes = ['login', 'password_reset'];
    if (sensitivePurposes.includes((purpose || '').toLowerCase())) {
      const [users] = await connection.execute('SELECT id, email, ativo FROM usuarios WHERE email = ? LIMIT 1', [email]);
      if (!users || users.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      const user = users[0];
      if (!user.ativo) return res.status(403).json({ error: 'Usuário inativo' });
      toEmail = user.email;
    }

    await ensureOtpTable();
    // Ensure attempts/log table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otp_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        ip VARCHAR(100),
        action VARCHAR(50),
        success TINYINT(1),
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const ip = req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : (req.ip || (req.connection && req.connection.remoteAddress));
    const p = purpose || 'generic';

    // Rate limit checks (email)
    const [cntEmailRows] = await connection.execute(`SELECT COUNT(*) AS cnt FROM otps WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ${OTP_WINDOW_MINUTES} MINUTE)`, [toEmail]);
    const cntEmail = cntEmailRows && cntEmailRows[0] ? cntEmailRows[0].cnt : 0;
    if (cntEmail >= OTP_PER_EMAIL_WINDOW) {
      await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [email, ip, 'send', 0, 'rate_limited_email']);
      return res.status(429).json({ error: 'Muitas solicitações para este email. Tente novamente mais tarde.' });
    }

    // Rate limit checks (ip)
    const [cntIpRows] = await connection.execute(`SELECT COUNT(*) AS cnt FROM otps WHERE ip = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ${OTP_WINDOW_MINUTES} MINUTE)`, [ip]);
    const cntIp = cntIpRows && cntIpRows[0] ? cntIpRows[0].cnt : 0;
    if (cntIp >= OTP_PER_IP_WINDOW) {
      await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [email, ip, 'send', 0, 'rate_limited_ip']);
      return res.status(429).json({ error: 'Muitas solicitações desta origem. Tente novamente mais tarde.' });
    }

    // generate 6-digit numeric code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_TTL_MINUTES || '10', 10) * 60 * 1000));

    // hash the code before storing
    const hashed = crypto.createHash('sha256').update(code + OTP_HASH_SALT).digest('hex');

    await connection.execute('INSERT INTO otps (email, code, purpose, ip, expires_at, used) VALUES (?, ?, ?, ?, ?, 0)', [toEmail, hashed, p, ip, expiresAt]);

    // log the send
    await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [toEmail, ip, 'send', 1, `sent_purpose=${p}`]);

    // try to send email
    const transporter = createTransporter();
    let mailInfo = null;
    if (transporter) {
      const from = process.env.FROM_EMAIL || process.env.SMTP_USER || `no-reply@${process.env.SMTP_HOST || 'localhost'}`;
      const adminEmail = process.env.FROM_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER || `no-reply@${process.env.SMTP_HOST || 'localhost'}`;
      const ttl = process.env.OTP_TTL_MINUTES || 10;
      const mail = buildOtpEmail(code, p, ttl, toEmail);

      try {
        // For password reset, send the OTP both to the user's registered email and to the configured admin/from email.
        const recipients = [toEmail];
        if ((p || '').toLowerCase() === 'password_reset' && adminEmail && adminEmail !== toEmail) recipients.push(adminEmail);

        mailInfo = await transporter.sendMail({ from, to: recipients.join(', '), subject: mail.subject, text: mail.text, html: mail.html });
        console.info('OTP email send result:', { messageId: mailInfo && mailInfo.messageId, to: recipients });
      } catch (mailErr) {
        console.error('Erro ao enviar email OTP (full):', mailErr);
        if (mailErr && mailErr.response) console.error('SMTP response:', mailErr.response);
        // update log to reflect failure
        await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [toEmail, ip, 'send', 0, `mail_error:${mailErr && mailErr.message ? mailErr.message : String(mailErr)}`]);
        // In development, also write the plaintext OTP to a temp file to aid testing
        try {
          if ((process.env.NODE_ENV || 'development') !== 'production') {
            const fs = require('fs');
            const now = Date.now();
            const debugPath = `/tmp/otp_${toEmail.replace(/[^a-z0-9@.\-]/gi, '_')}_${now}.txt`;
            fs.writeFileSync(debugPath, `OTP for ${toEmail}: ${code}\nExpires: ${expiresAt.toISOString()}\n`);
            console.info('Fallback OTP written to', debugPath);
          }
        } catch (writeErr) {
          console.warn('Não foi possível gravar OTP em arquivo temporário após falha no envio:', writeErr && writeErr.message ? writeErr.message : writeErr);
        }
      }
    } else {
      console.warn('SMTP não configurado, OTP gerado mas não enviado por email');
      // In development, write the plaintext OTP to a temp file to aid testing.
      try {
        if ((process.env.NODE_ENV || 'development') !== 'production') {
          const fs = require('fs');
          const now = Date.now();
          const debugPath = `/tmp/otp_${toEmail.replace(/[^a-z0-9@.\-]/gi, '_')}_${now}.txt`;
          fs.writeFileSync(debugPath, `OTP for ${toEmail}: ${code}\nExpires: ${expiresAt.toISOString()}\n`);
          console.info('OTP written to', debugPath);
        }
      } catch (writeErr) {
        console.warn('Não foi possível gravar OTP em arquivo temporário:', writeErr && writeErr.message ? writeErr.message : writeErr);
      }
    }

    return res.status(200).json({ message: 'OTP gerado', emailSent: !!mailInfo });
  } catch (err) {
    console.error('Erro em sendOtpController:', err.message || err);
    return res.status(500).json({ error: 'Erro ao gerar OTP' });
  }
};

/**
 * POST /verify-otp
 * Body: { email, code }
 */
const verifyOtpController = async (req, res) => {
  try {
    const { email, code, purpose } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: 'Email e código são obrigatórios' });

    await ensureOtpTable();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otp_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        ip VARCHAR(100),
        action VARCHAR(50),
        success TINYINT(1),
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const ip = req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : (req.ip || (req.connection && req.connection.remoteAddress));

    // Rate-limit verification attempts per email (failed attempts)
    const [failedRows] = await connection.execute(`SELECT COUNT(*) AS cnt FROM otp_attempts WHERE email = ? AND action = 'verify' AND success = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL ${VERIFY_ATTEMPTS_WINDOW_MINUTES} MINUTE)`, [email]);
    const failedCnt = failedRows && failedRows[0] ? failedRows[0].cnt : 0;
    if (failedCnt >= VERIFY_MAX_FAILED_ATTEMPTS) {
      await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [email, ip, 'verify', 0, 'rate_limited_verify']);
      return res.status(429).json({ error: 'Muitas tentativas falhas. Tente novamente mais tarde.' });
    }

    // compute hashed code
    const hashed = crypto.createHash('sha256').update(String(code) + OTP_HASH_SALT).digest('hex');

    // find matching, unused, non-expired OTP
    let sql = 'SELECT id, email, code, expires_at, used, purpose FROM otps WHERE email = ? AND code = ? AND used = 0 AND expires_at >= NOW()';
    const params = [email, hashed];
    if (purpose) {
      sql += ' AND purpose = ?';
      params.push(purpose);
    }
    sql += ' ORDER BY id DESC LIMIT 1';
    const [rows] = await connection.execute(sql, params);

    if (!rows || rows.length === 0) {
      // log failed attempt
      await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [email, ip, 'verify', 0, 'invalid_or_expired']);
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }

    const otp = rows[0];

    // mark as used
    await connection.execute('UPDATE otps SET used = 1 WHERE id = ?', [otp.id]);

    // log success
    await connection.execute('INSERT INTO otp_attempts (email, ip, action, success, details) VALUES (?, ?, ?, ?, ?)', [email, ip, 'verify', 1, `purpose=${otp.purpose}`]);

    // Attempt to find a user with this email
    const [users] = await connection.execute('SELECT id, nome_usuario, email, ativo FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (users && users.length > 0) {
      const user = users[0];
      if (!user.ativo) return res.status(403).json({ error: 'Usuário inativo' });

      // determine role
      let role = 'usuario';
      try {
        const [profRows] = await connection.execute('SELECT id FROM professores WHERE usuario_id = ? LIMIT 1', [user.id]);
        if (profRows && profRows.length > 0) role = 'professor';
        else {
          const [alRows] = await connection.execute('SELECT id FROM alunos WHERE usuario_id = ? LIMIT 1', [user.id]);
          if (alRows && alRows.length > 0) role = 'aluno';
        }
      } catch (e) {
        // ignore
      }

      // If purpose is password_reset, issue a short-lived token so the frontend
      // can call the protected user update route (`PUT /atualizarusuario/:id`) to
      // change the password securely. This avoids creating an extra public route.
      if (purpose === 'password_reset') {
        const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome_usuario, role }, auth.SECRET_KEY, { expiresIn: auth.TOKEN_EXPIRY });
        return res.status(200).json({ success: true, message: 'OTP válido para password reset', token, user: { id: user.id, nome_usuario: user.nome_usuario, email: user.email, role } });
      }

      const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome_usuario, role }, auth.SECRET_KEY, { expiresIn: auth.TOKEN_EXPIRY });

      // Set HttpOnly cookie so browser clients remain authenticated without explicit storage
      try {
        const cookieMaxAge = parseInt(process.env.COOKIE_MAX_AGE_MS || String(24 * 60 * 60 * 1000), 10); // default 24h
        const cookieSecure = (process.env.COOKIE_SECURE === 'true') || (process.env.NODE_ENV === 'production');
        const cookieSameSite = process.env.COOKIE_SAMESITE || 'Lax';
        res.cookie('token', token, { httpOnly: true, secure: cookieSecure, sameSite: cookieSameSite, maxAge: cookieMaxAge });
      } catch (cookieErr) {
        console.warn('Não foi possível setar cookie de autenticação:', cookieErr && cookieErr.message ? cookieErr.message : cookieErr);
      }

      return res.status(200).json({ success: true, token, user: { id: user.id, nome_usuario: user.nome_usuario, email: user.email, role } });
    }

    // No associated user, return a guest token so frontend can proceed with limited access
    const guest = auth.generateGuestToken();
    try {
      const cookieMaxAge = parseInt(process.env.COOKIE_MAX_AGE_MS || String(2 * 60 * 60 * 1000), 10); // default 2h for guests
      const cookieSecure = (process.env.COOKIE_SECURE === 'true') || (process.env.NODE_ENV === 'production');
      const cookieSameSite = process.env.COOKIE_SAMESITE || 'Lax';
      res.cookie('token', guest.token, { httpOnly: true, secure: cookieSecure, sameSite: cookieSameSite, maxAge: cookieMaxAge });
    } catch (cookieErr) {
      console.warn('Não foi possível setar cookie de guest-token:', cookieErr && cookieErr.message ? cookieErr.message : cookieErr);
    }

    return res.status(200).json({ success: true, guestToken: guest.token, message: 'OTP válido, sem conta associada' });
  } catch (err) {
    console.error('Erro em verifyOtpController:', err.message || err);
    return res.status(500).json({ error: 'Erro ao verificar OTP' });
  }
};

module.exports = {
  sendOtpController,
  verifyOtpController
};
