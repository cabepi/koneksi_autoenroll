-- Add CHECK constraint to the status column of doctor_enrollment_requests
DO $$
BEGIN
    -- Remove the constraint if it already exists to avoid errors
    ALTER TABLE koneksi_autoenroll.doctor_enrollment_requests 
    DROP CONSTRAINT IF EXISTS valid_enrollment_status;
    
    -- Add the new constraint
    ALTER TABLE koneksi_autoenroll.doctor_enrollment_requests 
    ADD CONSTRAINT valid_enrollment_status 
    CHECK (status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED'));
END $$;
