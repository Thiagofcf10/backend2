const mysql = require('mysql2/promise');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env



const connection = mysql.createPool({
    host: process.env.HOST,      // Altere conforme necessário
    user: process.env.USER,    // Altere para seu usuário MySQL
    password: process.env.PASSWORD,  // Altere para sua senha MySQL
    database: process.env.DATABASE   // Altere para seu banco de dados
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