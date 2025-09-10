const connection = require('../../app.js');

function inserirAluno({ nome_aluno, id_matricula_aluno, id_curso, telefone }, callback) {
    const query = `
        INSERT INTO alunos (nome_aluno, id_matricula_aluno, id_curso, telefone)
        VALUES ('thg2', '1', '1', '52535')
    `;
    connection.query(
        query,
        [nome_aluno, id_matricula_aluno, id_curso, telefone],
        (error, results) => {
            callback(error, results);
        }
    );
}

module.exports = inserirAluno;