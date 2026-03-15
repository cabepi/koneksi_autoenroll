const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runTest() {
  const client = await pool.connect();
  const id = 'a124b5ba-87e8-4d78-8e7f-c8d2f97971e2';
  try {
    console.log('Testing UPDATE...');
    await client.query(`
      UPDATE koneksi_autoenroll.doctor_enrollment_requests 
      SET full_name = $1, medical_license = $2, registration_date = $3, 
          specialties = $4, email = $5, email_verified = $6, phone = $7, 
          team_members = $8, medical_centers = $9, ars_providers = $10,
          status = 'CORRECTED', evaluation_reason_id = NULL, evaluation_notes = NULL
      WHERE id = $11
    `, ['Test Name', '123', '', JSON.stringify([]), 'test@test.com', false, '1234567890', JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), id]);
    console.log('UPDATE success');

    console.log('Testing INSERT history...');
    await client.query(`
      INSERT INTO koneksi_autoenroll.enrollment_request_status_history (request_id, status, changed_by_email)
      VALUES ($1, $2, $3)
    `, [id, 'CORRECTED', 'test@test.com']);
    console.log('INSERT history success');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}
runTest();
