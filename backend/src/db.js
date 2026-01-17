const { Pool } = require('pg');
require('dotenv').config();

// SSL Configuration for cloud databases (Render, Railway, etc.)
// rejectUnauthorized: false allows self-signed certificates
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig
});

// Test connection on startup
pool.on('connect', () => {
  console.log('📦 Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};