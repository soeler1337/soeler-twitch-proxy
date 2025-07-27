export default async function handler(req, res) {
  // Lies die Umgebungsvariablen aus Vercel (in Vercel Dashboard definiert)
  const clientId = process.env.TWITCH_BF_CLIENT_ID;
  const clientSecret = process.env.TWITCH_BF_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Client ID oder Secret fehlt' });
  }

  try {
    // Zugriffstoken anfordern
    const tokenRes = await fetch(
      'https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials',
      { method: 'POST' }
    );

    if (!tokenRes.ok) {
      const error = await tokenRes.json();
      return res.status(tokenRes.status).json(error);
    }

    const tokenData = await tokenRes.json();
    res.status(200).json({ access_token: tokenData.access_token });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Abrufen des Tokens', details: err.message });
  }
}
