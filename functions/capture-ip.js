const express = require('express');
const { Pool } = require('pg'); // Replace Supabase client
const axios = require('axios'); // Keep for IP geolocation
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (keep these)
app.use(cors());
app.use(express.json());

// PostgreSQL Client (new)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render
});

// Auto-create table on startup (new)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ip_logs (
        id SERIAL PRIMARY KEY,
        ip_address TEXT NOT NULL,
        provider TEXT,
        country TEXT,
        city TEXT,
        timezone TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Table ready');
  } catch (err) {
    console.error('Table creation error:', err);
  }
})();

// Updated IP Logging Endpoint
app.post('/log-ip', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.ip;
    const ipResponse = await axios.get(`http://ip-api.com/json/${clientIP}`);
    const ipData = ipResponse.data;

    // Insert with PostgreSQL (modified)
    await pool.query(
      `INSERT INTO ip_logs (
        ip_address, provider, country, 
        city, timezone, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        ipData.query,
        ipData.org || 'Unknown',
        ipData.country || 'Unknown',
        ipData.city || 'Unknown',
        ipData.timezone || 'UTC',
        req.headers['user-agent'] || 'Unknown'
      ]
    );

    res.status(200).json({ 
      success: true,
      ip: ipData.query
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Failed to log IP',
      details: err.message 
    });
  }
});

// Keep health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: process.env.DATABASE_URL ? 'Connected' : 'Disconnected'
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
