export default async function handler(req, res) {
    // Fetch IP data from ip-api
    const ipRes = await fetch('https://ip-api.com/json/');
    const ipData = await ipRes.json();

    // EmailJS configuration
    const serviceID = 'service_x25rs8q';  // Replace with your EmailJS service ID
    const templateID = 'template_3mgw9je'; // Replace with your EmailJS template ID
    const userID = '4ItP8f4Z88r0-9S1M';   // Replace with your EmailJS public key

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

    // Prepare the POST request body
    const body = JSON.stringify({
        service_id: serviceID,
        template_id: templateID,
        user_id: userID,
        template_params: emailParams
    });

    // Send the data to EmailJS API using a POST request
    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Email sent successfully:', result);
            res.status(200).json({ message: 'IP info sent to your email.' });
        } else {
            throw new Error(result.error || 'Failed to send email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
}
