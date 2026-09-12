export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Video URL is required.',
    });
  }

  try {
    const videoUrl = decodeURIComponent(url);

    const parsed = new URL(videoUrl);
    const host = parsed.hostname.toLowerCase();

    const allowed =
      host === 'bilibili.com' ||
      host.endsWith('.bilibili.com') ||
      host.endsWith('.hdslb.com') ||
      host.endsWith('.bilivideo.com') ||
      host.endsWith('.mcdn.bilivideo.cn');

    if (!allowed) {
      return res.status(400).json({
        error: 'Invalid Bilibili video URL.',
      });
    }

    // Direct redirect:
    // Vercel does NOT download or store the video.
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', videoUrl);

    return res.status(307).end();

  } catch (error) {
    console.error(
      '[BiliSave] Redirect error:',
      error?.message || error
    );

    return res.status(500).json({
      error: 'Unable to start the download.',
    });
  }
}
