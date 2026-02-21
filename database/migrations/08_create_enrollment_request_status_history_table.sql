CREATE TABLE IF NOT EXISTS koneksi_autoenroll.enrollment_request_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES koneksi_autoenroll.doctor_enrollment_requests(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    changed_by_email VARCHAR(150) NOT NULL,
    changed_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Santo_Domingo')
);
