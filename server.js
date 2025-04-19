const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client (built into Render)
const app = express();
const PORT = process.env.PORT || 3000;

// Auto-configured on Render PostgreSQL databases
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Auto-create table on startup
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ip_logs (
        id SERIAL PRIMARY KEY,
        ip TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Table ready');
  } catch (err) {
    console.error('Table creation error:', err);
  }
})();

// Log IP endpoint
app.post('/log-ip', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const result = await pool.query(
      'INSERT INTO ip_logs (ip, user_agent) VALUES ($1, $2)',
      [ip.split(',')[0], req.headers['user-agent']]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/', (req, res) => res.send('IP Logger Running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
