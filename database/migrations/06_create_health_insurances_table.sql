CREATE TABLE IF NOT EXISTS koneksi_autoenroll.health_insurances (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed initial records from mockups
INSERT INTO koneksi_autoenroll.health_insurances (code, name) VALUES
('UNIVERSAL', 'ARS Universal'),
('PRIMERA', 'ARS Primera'),
('SENASA', 'ARS SeNaSa'),
('HUMANO', 'ARS Humano'),
('MAPFRE', 'Mapfre Salud ARS'),
('MONUMENTAL', 'ARS Monumental'),
('YUNEN', 'ARS Yunen')
ON CONFLICT (code) DO NOTHING;
