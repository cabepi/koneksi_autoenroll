import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateConstraints() {
  const client = await pool.connect();
  try {
    console.log('Dropping valid_enrollment_status constraint...');
    await client.query('ALTER TABLE koneksi_autoenroll.doctor_enrollment_requests DROP CONSTRAINT IF EXISTS valid_enrollment_status;');
    
    console.log('Adding new valid_enrollment_status constraint...');
    await client.query(`
      ALTER TABLE koneksi_autoenroll.doctor_enrollment_requests 
      ADD CONSTRAINT valid_enrollment_status 
      CHECK (status IN ('PENDING_CONFIRMATION', 'OBSERVED', 'CONFIRMED', 'REJECTED', 'CORRECTED'));
    `);

    console.log('Let us also check the history table constraints...');
    await client.query('ALTER TABLE koneksi_autoenroll.enrollment_request_status_history DROP CONSTRAINT IF EXISTS chk_status;');
    await client.query('ALTER TABLE koneksi_autoenroll.enrollment_request_status_history DROP CONSTRAINT IF EXISTS valid_enrollment_status;');

    await client.query(`
      ALTER TABLE koneksi_autoenroll.enrollment_request_status_history 
      ADD CONSTRAINT valid_enrollment_status 
      CHECK (status IN ('PENDING_CONFIRMATION', 'OBSERVED', 'CONFIRMED', 'REJECTED', 'CORRECTED'));
    `);

    console.log('Running the test again inside the script...');
    const id = 'a124b5ba-87e8-4d78-8e7f-c8d2f97971e2';
    await client.query(`
      UPDATE koneksi_autoenroll.doctor_enrollment_requests 
      SET full_name = $1, medical_license = $2, registration_date = $3, 
          specialties = $4, email = $5, email_verified = $6, phone = $7, 
          team_members = $8, medical_centers = $9, ars_providers = $10,
          status = 'CORRECTED', evaluation_reason_id = NULL, evaluation_notes = NULL
      WHERE id = $11
    `, ['Test Name', '123', '', JSON.stringify([]), 'test@test.com', false, '1234567890', JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), id]);
    console.log('Test UPDATE passed!');

  } catch (error) {
    console.error('Error updating constraints:', error);
  } finally {
    client.release();
    pool.end();
  }
}

updateConstraints();
