export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Video URL is required.',
    });
  }

  try {
    // Next.js already gives us the decoded query value.
    // Do NOT call decodeURIComponent again.
    const videoUrl = url.trim();

    const parsed = new URL(videoUrl);
    const host = parsed.hostname.toLowerCase();

    const allowed =
      host === 'bilibili.com' ||
      host.endsWith('.bilibili.com') ||
      host === 'hdslb.com' ||
      host.endsWith('.hdslb.com') ||
      host === 'bilivideo.com' ||
      host.endsWith('.bilivideo.com') ||
      host === 'bilivideo.cn' ||
      host.endsWith('.bilivideo.cn');

    if (!allowed) {
      console.error(
        '[BiliSave] Blocked CDN host:',
        host
      );

      return res.status(400).json({
        error: 'Invalid Bilibili video URL.',
      });
    }

    // Direct download:
    // Vercel does NOT download or store the video.
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', videoUrl);

    return res.status(307).end();

  } catch (error) {
    console.error(
      '[BiliSave] Redirect error:',
      error?.message || error
    );

    return res.status(400).json({
      error: 'Invalid video URL.',
    });
  }
}
