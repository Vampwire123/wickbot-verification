const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://hqqkhciwhoikpnwgenqo.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcWtoY2l3aG9pa3Bud2dlbnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDczMjcsImV4cCI6MjA2MDU4MzMyN30.mhI3FsZwcuy0NdsF0cbjtQ9zoGeeh0ZodH6blCsdH6s'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  try {
    // Fetch IP data using ip-api
    const ipRes = await axios.get('http://ip-api.com/json/');
    const ipData = ipRes.data;

    // Prepare data to store
    const ipInfo = {
      ip_address: ipData.query,       // IP address
      provider: ipData.org,           // Provider
      country: ipData.country,        // Country
      city: ipData.city,              // City
      timezone: ipData.timezone,      // Timezone
    };

    // Insert the IP data into Supabase database
    const { data, error } = await supabase
      .from('ip_logs')
      .insert([ipInfo]);

    if (error) {
      throw error;
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'IP successfully stored in Supabase.' }),
    };
  } catch (error) {
    console.error('Error storing IP info:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to store IP information.' }),
    };
  }
};
