CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS koneksi_autoenroll.doctor_enrollment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_CONFIRMATION',

    -- Step 1: Professional data
    identification_number VARCHAR(20),
    full_name VARCHAR(200),
    medical_license VARCHAR(50),
    registration_date VARCHAR(20),
    specialties JSONB DEFAULT '[]',
    email VARCHAR(150),
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(30),
    biometric_image_url TEXT,

    -- Step 2: Team & Centers
    team_members JSONB DEFAULT '[]',
    medical_centers JSONB DEFAULT '[]',

    -- Step 3: ARS
    ars_providers JSONB DEFAULT '[]',

    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Santo_Domingo'),
    updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Santo_Domingo'),
    CONSTRAINT chk_status CHECK (status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED'))
);
