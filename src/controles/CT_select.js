const select_aluno = require('../modelos/select/select_aluno'); {
    
}

const getAlunos = async (req, res) => {
    const selecaluno = select_aluno.getAlunos; // Importa a função getAlunos do módulo select_aluno

    return res.status(200).json({
        message: 'Dados dos alunos obtidos com sucesso',
        data: await selecaluno(req, res) // Chama a função getAlunos e aguarda o resultado
    });
};
module.exports = {getAlunos} ; // Exporta a função para ser usada em outras partes do aplicativo