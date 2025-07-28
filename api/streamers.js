export default async function handler(req, res) {
   // CORS Header setzen
  res.setHeader('Access-Control-Allow-Origin', '*'); // Für Sicherheit: später Domain eintragen
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { usernames } = req.body;
  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: 'Invalid usernames' });
  }
  const bearer = process.env.TWITCH_BF_BEARER;
  const clientId = process.env.TWITCH_BF_CLIENT_ID;
  const headers = {
    'Client-ID': clientId,
    'Authorization': `Bearer ${bearer}`
  }; 
  // Twitch erlaubt max. 100 user_logins → ggf. splitten
  const chunks = [];
  for (let i = 0; i < usernames.length; i += 100) {
    chunks.push(usernames.slice(i, i + 100));
  }

  let allStreams = [];
  for (const chunk of chunks) {
    const params = chunk.map(u => `user_login=${encodeURIComponent(u)}`).join('&');
    const res = await fetch(`https://api.twitch.tv/helix/streams?${params}`, { headers });
    const data = await res.json();
    allStreams = allStreams.concat(data.data);
  }

  res.status(200).json({ streams: allStreams });
}


  

