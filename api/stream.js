export default async function handler(req, res) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const bearer = process.env.TWITCH_BEARER;

  const username = "soeler1337"; // Twitch-Username

  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${bearer}`
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
    res.status(500).json({ error: "API call failed" });
  }
}
