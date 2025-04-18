export default async function handler(req, res) {
    try {
        // Fetch IP data from ip-api
        const ipRes = await fetch('https://ip-api.com/json/');
        const ipData = await ipRes.json();

        // EmailJS configuration
        const serviceID = 'service_x25rs8q';  // Replace with your EmailJS service ID
        const templateID = 'template_3mgw9je'; // Replace with your EmailJS template ID
        const userID = '4ItP8f4Z88r0-9S1M'; // Replace with your EmailJS user ID

        // Prepare the data
        const emailParams = {
            to_email: 'boriszarkov4@gmail.com',
            ip_address: ipData.query,
            provider: ipData.org + " (" + ipData.as + ")",
            timezone: ipData.timezone,
            country: ipData.country,
            city: ipData.city,
            zip: ipData.zip,
            latitude: ipData.lat,
            longitude: ipData.lon
        };

        // Send email using fetch (Vercel's built-in fetch)
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: serviceID,
                template_id: templateID,
                user_id: userID,
                template_params: emailParams,
            }),
        });

        const responseText = await response.text(); // Read raw response as text
        console.log('Raw response from EmailJS:', responseText);

        if (response.ok) {
            res.status(200).json({ message: 'IP info sent to your email.' });
        } else {
            res.status(500).json({ error: `EmailJS error: ${responseText}` });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
}
