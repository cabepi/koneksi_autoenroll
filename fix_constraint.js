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
    console.log('Dropping chk_status constraint...');
    await client.query('ALTER TABLE koneksi_autoenroll.doctor_enrollment_requests DROP CONSTRAINT IF EXISTS chk_status;');
    
    console.log('Adding new chk_status constraint...');
    await client.query(`
      ALTER TABLE koneksi_autoenroll.doctor_enrollment_requests 
      ADD CONSTRAINT chk_status 
      CHECK (status IN ('PENDING_CONFIRMATION', 'OBSERVED', 'CONFIRMED', 'REJECTED', 'CORRECTED'));
    `);

    console.log('Constraints updated successfully!');
  } catch (error) {
    console.error('Error updating constraints:', error);
  } finally {
    client.release();
    pool.end();
  }
}

updateConstraints();
