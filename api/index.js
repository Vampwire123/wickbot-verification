import admin from 'firebase-admin';
import fetch from 'node-fetch'; // Required for Vercel to fetch the IP data

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./config/firebase-credentials.json'); // Update path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com" // Replace with your Firebase URL
});

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    // Fetch IP data from ip-api
    const ipRes = await fetch('https://ip-api.com/json/');
    const ipData = await ipRes.json();

    // Prepare data to store in Firestore
    const ipInfo = {
      ip_address: ipData.query,       // The IP address
      provider: ipData.org + " (" + ipData.as + ")", // The provider info
      timezone: ipData.timezone,      // The timezone
      country: ipData.country,        // The country
      city: ipData.city,              // The city
      zip: ipData.zip,                // The zip code
      latitude: ipData.lat,           // The latitude
      longitude: ipData.lon,         // The longitude
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Automatically set the timestamp in Firestore
    };

    // Store the IP info in Firestore under the 'ipLogs' collection
    await db.collection('ipLogs').add(ipInfo);

    // Respond with success
    res.status(200).json({ message: 'IP info successfully stored in Firestore.' });
  } catch (error) {
    console.error('Error storing IP info:', error);
    res.status(500).json({ error: 'Failed to store IP information.' });
  }
}
