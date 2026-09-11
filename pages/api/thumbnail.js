// Bilibili's image CDN (hdslb.com) rejects requests that don't carry a
// bilibili.com Referer header, which is why <img src="..."> pointed
// directly at it shows a broken image. This proxies the request
// server-side with the right header, then streams the image back.
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string' || !/hdslb\.com/.test(url)) {
    return res.status(400).json({ error: 'Invalid thumbnail URL' });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Referer: 'https://www.bilibili.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Thumbnail proxy error:', error);
    return res.status(500).end();
  }
}

