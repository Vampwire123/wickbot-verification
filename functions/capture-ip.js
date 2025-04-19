const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqqkhciwhoikpnwgenqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcWtoY2l3aG9pa3Bud2dlbnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDczMjcsImV4cCI6MjA2MDU4MzMyN30.mhI3FsZwcuy0NdsF0cbjtQ9zoGeeh0ZodH6blCsdH6s';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  try {
    // Get client IP from headers (more reliable than ip-api)
    const clientIp = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || event.clientIp;
    
    // If we have client IP, use that instead of ip-api
    if (clientIp) {
      const ipRes = await axios.get(`http://ip-api.com/json/${clientIp}`);
      const ipData = ipRes.data;

      const ipInfo = {
        ip_address: ipData.query,
        provider: ipData.org,
        country: ipData.country,
        city: ipData.city,
        timezone: ipData.timezone,
        user_agent: event.headers['user-agent'],
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ip_logs')
        .insert([ipInfo]);

      if (error) throw error;

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'IP successfully stored in Supabase.' }),
      };
    }

    throw new Error('Could not determine client IP');
  } catch (error) {
    console.error('Error storing IP info:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to store IP information.',
        details: error.message 
      }),
    };
  }
};
