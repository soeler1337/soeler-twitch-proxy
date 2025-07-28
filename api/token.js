export default async function handler(req, res) {
   // CORS Header setzen
  res.setHeader('Access-Control-Allow-Origin', '*'); // Für Sicherheit: später Domain eintragen
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const bearer = process.env.TWITCH_BF_BEARER;
  res.status(200).json({ access_token: bearer });
}
