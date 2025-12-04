-- Migration: add tipo_projeto VARCHAR field to projetos table
ALTER TABLE projetos
    ADD COLUMN tipo_projeto VARCHAR(100) DEFAULT 'Integrador' AFTER matricula_alunos;
