-- Migration: add codigo_matricula_pro table and alter matricula columns types
-- Create table for valid professor matricula codes
CREATE TABLE IF NOT EXISTS codigo_matricula_pro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    codigo VARCHAR(32) UNIQUE NOT NULL,
    matricula_valida TINYINT(1) DEFAULT 1
);

-- Alter existing columns to hold alphanumeric codes and preserve data
ALTER TABLE IF EXISTS professores
    MODIFY COLUMN matricula_professor VARCHAR(15) NOT NULL;

ALTER TABLE IF EXISTS alunos
    MODIFY COLUMN matricula_aluno VARCHAR(11) NOT NULL;

-- Optional: add sample valid code (remove/comment in production)
INSERT IGNORE INTO codigo_matricula_pro (codigo, matricula_valida) VALUES ('PROF-CODE-EXAMPLE-001', 1);
