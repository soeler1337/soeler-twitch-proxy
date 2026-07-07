// Latest video from a YouTube channel via RSS (no API key needed)
const CHANNELS = {
  soelers_ecke: "UCv-uO54XMvAvW42rY5IxYFQ",
  soeler1337: null // add channel ID here if needed later
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const key = req.query.channel || "soelers_ecke";
  const channelId = CHANNELS[key];
  if (!channelId) {
    return res.status(400).json({ error: "unknown channel" });
  }

  try {
    const feedRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    if (!feedRes.ok) throw new Error("feed fetch failed");
    const xml = await feedRes.text();

    const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/);
    if (!entry) return res.status(200).json({ video: null });

    const videoId = entry[1].match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || null;
    const title = entry[1].match(/<title>([^<]+)<\/title>/)?.[1] || "";
    const published = entry[1].match(/<published>([^<]+)<\/published>/)?.[1] || null;
    const link = entry[1].match(/<link rel="alternate" href="([^"]+)"/)?.[1] || null;
    const isShort = link ? link.includes("/shorts/") : false;

    res.status(200).json({
      video: videoId
        ? {
            id: videoId,
            title,
            published,
            url: link,
            isShort,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          }
        : null
    });
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Laden des Videos" });
  }
}
