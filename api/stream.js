export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const username = "soeler1337";

  try {
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('Twitch token error:', JSON.stringify(tokenData));
      return res.status(502).json({ error: 'Twitch auth failed' });
    }

    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${tokenData.access_token}`
      }
    });

    const data = await response.json();
    const stream = data.data[0] || null;

    res.status(200).json({
      live: !!stream,
      title: stream?.title || "Offline",
      viewer_count: stream?.viewer_count || 0
    });
  } catch (err) {
    console.error("Fehler beim Twitch-Fetch:", err);
    res.status(500).json({ error: "API call failed" });
  }
}
