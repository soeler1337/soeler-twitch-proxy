export default async function handler(req, res) {
  const bearer = process.env.TWITCH_BF_BEARER;
  res.status(200).json({ access_token: bearer });
}
