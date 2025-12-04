-- Migration: add nome_autores to projetos
ALTER TABLE projetos
ADD COLUMN nome_autores TEXT DEFAULT NULL;
