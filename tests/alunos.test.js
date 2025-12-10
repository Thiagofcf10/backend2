// Mock the DB connection before requiring the model
jest.mock('../src/DBmysql/conectaraoDB', () => {
  return {
    execute: jest.fn((query, params) => {
      // Simple query-based responses for tests
      if (/SELECT \* FROM alunos/i.test(query)) {
        return Promise.resolve([[{ id: 1, nome_aluno: 'Aluno Teste', matricula_aluno: 20230001 }]]);
      }
      if (/SELECT COUNT\(\*\) as total/i.test(query)) {
        return Promise.resolve([[{ total: 1 }]]);
      }
      if (/INSERT INTO alunos/i.test(query)) {
        return Promise.resolve([{ insertId: 1234 }]);
      }
      if (/DELETE FROM alunos/i.test(query)) {
        return Promise.resolve([{}]);
      }
      if (/UPDATE alunos SET/i.test(query)) {
        return Promise.resolve([{}]);
      }
      // Default
      return Promise.resolve([[]]);
    })
  };
});

const alunos = require('../src/modelos/alunos');

describe('Model alunos', () => {
  test('getAlunos returns an array of rows', async () => {
    const rows = await alunos.getAlunos(10, 0);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].nome_aluno).toBe('Aluno Teste');
  });

  test('getAlunosTotal returns a number', async () => {
    const total = await alunos.getAlunosTotal();
    expect(typeof total).toBe('number');
    expect(total).toBe(1);
  });

  test('inserirAluno returns insertId', async () => {
    const result = await alunos.inserirAluno({ nome_aluno: 'Novo', matricula_aluno: 1 });
    expect(result).toHaveProperty('insertId');
    expect(result.insertId).toBe(1234);
  });

  test('deleteAluno resolves without throwing', async () => {
    await expect(alunos.deleteAluno(1)).resolves.not.toThrow();
  });

  test('atualizarAluno resolves without throwing', async () => {
    await expect(alunos.atualizarAluno(1, { nome_aluno: 'X', telefone: '', id_curso: 1 })).resolves.not.toThrow();
  });
});
