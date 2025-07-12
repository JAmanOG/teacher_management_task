// Create a test-db-connection.js file
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
// user: process.env.DB_USER,
// host: process.env.DB_HOST,
// database: process.env.DB_NAME,
// password: String(process.env.DB_PASSWORD), // Ensure it's a string
// port: process.env.DB_PORT,
// ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection test failed:', err);
  } else {
    console.log('Connection successful! Current time:', res.rows[0].now);
  }
  pool.end();
});