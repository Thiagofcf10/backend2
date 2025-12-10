-- Add fields to control who can edit 'relatorio' and until when
ALTER TABLE registros
  ADD COLUMN relatorio_edit_deadline DATETIME DEFAULT NULL,
  ADD COLUMN relatorio_edit_allowed TEXT DEFAULT NULL;
