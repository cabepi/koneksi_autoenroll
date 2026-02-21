CREATE TABLE IF NOT EXISTS koneksi_autoenroll.otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santo_Domingo'),
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS otps_identifier_idx ON koneksi_autoenroll.otps (identifier);
