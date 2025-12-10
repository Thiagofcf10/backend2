-- Migration: add relatorio TEXT column to registros
ALTER TABLE registros
    ADD COLUMN relatorio TEXT DEFAULT NULL;
