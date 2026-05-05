require('dotenv').config();
const connection = require('../src/DBmysql/conectaraoDB');

async function clear(email) {
  if (!email) {
    console.error('Usage: node clear_otp_attempts.js <email>');
    process.exit(1);
  }
  try {
    const dbName = process.env.DB_NAME || 'repo_ifpa';
    try {
      await connection.query(`USE ${dbName}`);
    } catch (useErr) {
      console.warn('Could not select database', dbName, useErr && useErr.message ? useErr.message : useErr);
    }
    await connection.execute('DELETE FROM otp_attempts WHERE email = ?', [email]);
    await connection.execute('DELETE FROM otps WHERE email = ?', [email]);
    console.log('Cleared otp_attempts and otps for', email);
    process.exit(0);
  } catch (err) {
    console.error('Error clearing otp records:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

clear(process.argv[2]);
