export default async function handler(req, res) {
   // CORS Header setzen
  res.setHeader('Access-Control-Allow-Origin', '*'); // Für Sicherheit: später Domain eintragen
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const bearer = process.env.TWITCH_BF_BEARER;
  const clientId = process.env.TWITCH_BF_CLIENT_ID;
  res.status(200).json({ access_token: bearer, clientId: clientId });
}
