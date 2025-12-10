-- Migration: add 'destaque' column to projetos
ALTER TABLE projetos
ADD COLUMN destaque TINYINT(1) DEFAULT 0;
