// Latest videos from a YouTube channel via RSS (no API key needed)
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

  const limit = Math.min(parseInt(req.query.limit, 10) || 3, 10);

  try {
    const feedRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    if (!feedRes.ok) throw new Error("feed fetch failed");
    const xml = await feedRes.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
    const videos = entries.slice(0, limit).map(function (m) {
      const e = m[1];
      const videoId = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || null;
      const title = e.match(/<title>([^<]+)<\/title>/)?.[1] || "";
      const published = e.match(/<published>([^<]+)<\/published>/)?.[1] || null;
      const link = e.match(/<link rel="alternate" href="([^"]+)"/)?.[1] || null;
      return {
        id: videoId,
        title,
        published,
        url: link,
        isShort: link ? link.includes("/shorts/") : false,
        thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null
      };
    }).filter(function (v) { return v.id; });

    res.status(200).json({
      video: videos[0] || null, // backwards compat
      videos
    });
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Laden der Videos" });
  }
}
