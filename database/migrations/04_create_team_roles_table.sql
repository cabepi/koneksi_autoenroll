-- Migration: 04_create_team_roles_table.sql
-- Description: Creates the team_roles table and populates initial data for the medical assistants panel

CREATE TABLE IF NOT EXISTS koneksi_autoenroll.team_roles (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial team roles based on requirements
INSERT INTO koneksi_autoenroll.team_roles (code, name) VALUES 
('ASISTENTE_GENERAL', 'Asistente General'),
('SECRETARIA_RECEPCIONISTA', 'Secretaria / Recepcionista'),
('ENFERMERO_A', 'Enfermera/o'),
('ASISTENTE_MEDICO', 'Asistente Médico'),
('FACTURADOR_MEDICO', 'Facturador Médico')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, is_active = true;
