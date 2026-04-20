export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { usernames } = req.body;
  if (!Array.isArray(usernames) || usernames.length === 0)
    return res.status(400).json({ error: 'Invalid usernames' });

  const clientId = process.env.TWITCH_BF_CLIENT_ID;
  const clientSecret = process.env.TWITCH_BF_CLIENT_SECRET;

  const tokenRes = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error('Twitch token error:', tokenRes.status, tokenData.message);
    return res.status(502).json({ error: 'Twitch auth failed', streams: [] });
  }

  const headers = {
    'Client-ID': clientId,
    'Authorization': `Bearer ${tokenData.access_token}`,
  };

  const chunks = [];
  for (let i = 0; i < usernames.length; i += 100) chunks.push(usernames.slice(i, i + 100));

  let allStreams = [];
  for (const chunk of chunks) {
    const params = chunk.map(u => `user_login=${encodeURIComponent(u)}`).join('&');
    const twitchRes = await fetch(`https://api.twitch.tv/helix/streams?${params}`, { headers });
    const data = await twitchRes.json();
    if (!twitchRes.ok || data.error) { console.error('Twitch API error:', data); continue; }
    if (Array.isArray(data.data)) allStreams = allStreams.concat(data.data);
  }

  res.status(200).json({ streams: allStreams });
}