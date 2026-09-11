// Uses Bilibili's own public API directly — no yt-dlp binary needed.
// This makes it work on Vercel's serverless functions (which can't run
// system binaries), with zero server storage and zero cost.

function isBilibiliUrl(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();
    return (
      host === 'b23.tv' ||
      host === 'www.b23.tv' ||
      host === 'bilibili.com' ||
      host === 'www.bilibili.com' ||
      host.endsWith('.bilibili.com')
    );
  } catch {
    return false;
  }
}

// b23.tv links are short redirects — follow them to get the real
// bilibili.com URL that contains the BV id.
async function resolveBvid(inputUrl) {
  let url = inputUrl;
  const host = new URL(url).hostname.toLowerCase();

  if (host === 'b23.tv' || host === 'www.b23.tv') {
    const resp = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    url = resp.url;
  }

  const match = url.match(/BV[0-9A-Za-z]{10}/);
  return match ? match[0] : null;
}

export default async function handler(req, res) {
  const url = req.method === 'POST' ? req.body?.url : req.query.url;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ success: false, error: 'Please enter a Bilibili URL.' });
  }

  const trimmedUrl = url.trim();

  if (!isBilibiliUrl(trimmedUrl)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid Bilibili or b23.tv URL.' });
  }

  try {
    const bvid = await resolveBvid(trimmedUrl);

    if (!bvid) {
      return res.status(200).json({
        success: false,
        error: 'Could not find a video id in that link.',
      });
    }

    const viewResp = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://www.bilibili.com/',
        },
      }
    );
    const viewJson = await viewResp.json();

    if (viewJson.code !== 0 || !viewJson.data) {
      return res.status(200).json({
        success: false,
        error: 'Could not fetch video details. The video may be private, deleted, or region-locked.',
      });
    }

    const { title, pic: thumbnail, duration } = viewJson.data;

    return res.status(200).json({
      success: true,
      title: title || 'Bilibili Video',
      thumbnail: thumbnail || null,
      duration: duration || null,
      bvid,
    });
  } catch (error) {
    console.error('[BiliSave] Parse error:', error);
    return res.status(200).json({
      success: false,
      error: 'Could not fetch video details. The video may be private, deleted, or region-locked.',
    });
  }
}
