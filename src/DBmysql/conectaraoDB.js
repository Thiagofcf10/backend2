const mysql = require('mysql2/promise');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env



// Prefer non-colliding env var names so we don't pick up the OS user (e.g. process.env.USER)
const DB_HOST = process.env.DB_HOST || process.env.HOST || 'repo_ifpa';
const DB_USER = process.env.DB_USER || process.env.USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.PASSWORD || '112233';
const DB_NAME = process.env.DB_NAME || process.env.DATABASE || 'repo_ifpa';

if (!process.env.DB_USER && process.env.USER) {
    console.warn('Warning: using process.env.USER for DB user. Consider renaming your .env entries to DB_USER/DB_PASSWORD/DB_NAME to avoid clobbering by OS env vars.');
}

const connection = mysql.createPool({
    host: DB_HOST,      // Host do MySQL
    user: DB_USER,      // Usuário MySQL
    password: DB_PASSWORD,  // Senha MySQL
    database: DB_NAME   // Banco de dados
});


connection.getConnection()
    .then(() => {
        console.log('Conectado ao MySQL!');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MySQL:', err.message);
    });
// Exporte a conexão para usar em outros arquivos
module.exports = connection;