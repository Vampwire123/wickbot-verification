const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// IP Logging Endpoint
app.post('/log-ip', async (req, res) => {
  try {
    // Get client IP from headers first (more reliable)
    const clientIP = req.headers['x-forwarded-for'] || req.ip;
    
    // Fetch IP data from ip-api
    const ipResponse = await axios.get(`http://ip-api.com/json/${clientIP}`);
    const ipData = ipResponse.data;

    // Insert into Supabase
    const { error } = await supabase
      .from('ip_logs')
      .insert([{
        ip_address: ipData.query,
        provider: ipData.org || 'Unknown',
        country: ipData.country || 'Unknown',
        city: ipData.city || 'Unknown',
        timezone: ipData.timezone || 'UTC',
        user_agent: req.headers['user-agent'] || 'Unknown',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    
    res.status(200).json({ 
      success: true,
      message: 'IP logged successfully',
      ip: ipData.query
    });
  } catch (err) {
    console.error('IP logging error:', err);
    res.status(500).json({ 
      error: 'Failed to log IP',
      details: err.message 
    });
  }
});

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'WickBot IP Logger',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`IP logging endpoint: http://localhost:${PORT}/log-ip`);
});
