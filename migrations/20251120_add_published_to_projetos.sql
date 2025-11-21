-- Migration: add published and published_at columns to projetos
-- Run this against your repo_ifpa database using your MySQL client.

ALTER TABLE projetos
  ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN published_at DATETIME DEFAULT NULL;

-- Optional: set published_at for already published records if you have a rule
-- UPDATE projetos SET published = 1, published_at = NOW() WHERE <your_condition>;

-- Verify columns
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projetos' AND COLUMN_NAME IN ('published', 'published_at');
