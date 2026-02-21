import { Pool } from 'pg';
import { EnrollmentRequestRepository } from './src/data/repositories/EnrollmentRequestRepository.js';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const repository = new EnrollmentRequestRepository(pool);

async function run() {
  try {
    const payload = {
      identificationNumber: '12345678901',
      fullName: 'Test Doctor',
      medicalLicense: '12345',
      registrationDate: '2020-01-01',
      specialties: [{ id: '1', name: 'Cardiology' }],
      email: 'testdoctor@example.com',
      emailVerified: true,
      phone: '8091234567',
      biometricImageUrl: null,
      teamMembers: [],
      medicalCenters: [],
      arsProviders: []
    };

    console.log("Creating request...");
    const id = await repository.create(payload);
    console.log("Created ID:", id);

    console.log("Inserting status history...");
    await repository.insertStatusHistory(id, 'PENDING_CONFIRMATION', payload.email);
    console.log("Status history inserted");

  } catch (e) {
    console.error("Caught error:", e);
  } finally {
    await pool.end();
  }
}
run();
