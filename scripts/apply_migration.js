const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connection = require('../src/DBmysql/conectaraoDB');

async function applyMigration(file) {
  try {
    const dbName = process.env.DB_NAME || 'repo_ifpa';
    try {
      await connection.query(`USE ${dbName}`);
      console.log('Using database', dbName);
    } catch (useErr) {
      console.warn('Could not select database', dbName, useErr && useErr.message ? useErr.message : useErr);
    }
    const sql = fs.readFileSync(file, 'utf8');
    // split statements on semicolon followed by newline to avoid splitting inside defs
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
        console.log('Executed:', stmt.split('\n')[0]);
      } catch (err) {
        console.error('Failed statement:', stmt.split('\n')[0], err && err.message ? err.message : err);
      }
    }
    console.log('Migration applied from', file);
  } catch (err) {
    console.error('Error applying migration:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

const migrationFile = path.join(__dirname, '..', 'migrations', process.argv[2] || '20251218_resize_matriculas.sql');
applyMigration(migrationFile).then(() => process.exit(0)).catch(() => process.exit(1));
