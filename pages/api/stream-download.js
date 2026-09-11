// Streams video bytes straight from Bilibili's CDN to the user.
// No yt-dlp, no ffmpeg, no disk write — the file is never stored on the
// server, only passed through in-memory chunks (a proxy pass-through).
//
// Limitation: only works for qualities Bilibili serves as a single combined
// MP4 (qn=16 / 360p via the html5 platform param). Higher qualities are
// served as separate video+audio streams that need merging, which this
// zero-storage approach intentionally does not attempt.

import { Readable } from 'stream';

export const config = {
  api: { responseLimit: false },
};

function isValidBvid(value) {
  return typeof value === 'string' && /^BV[0-9A-Za-z]{10}$/.test(value);
}

function biliHeaders() {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Referer: 'https://www.bilibili.com/',
  };
}

export default async function handler(req, res) {
  const { bvid, title } = req.query;

  if (!isValidBvid(bvid)) {
    return res.status(400).json({ error: 'Invalid video id.' });
  }

  try {
    // Re-resolve aid/cid fresh each time (avoids passing a signed URL
    // between requests, which can go stale or get rejected).
    const viewResp = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      { headers: biliHeaders() }
    );
    const viewJson = await viewResp.json();

    if (viewJson.code !== 0 || !viewJson.data) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    const { aid, cid } = viewJson.data;

    const playResp = await fetch(
      `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=16&type=mp4&platform=html5&high_quality=1`,
      { headers: biliHeaders() }
    );
    const playJson = await playResp.json();

    const directUrl = playJson?.data?.durl?.[0]?.url;

    if (!directUrl) {
      return res.status(422).json({
        error:
          'This video only offers separate HD video/audio streams, which this downloader cannot merge without extra server storage. Please try a different video.',
      });
    }

    const videoResp = await fetch(directUrl, { headers: biliHeaders() });

    if (!videoResp.ok || !videoResp.body) {
      return res.status(502).json({ error: 'Could not fetch the video stream from Bilibili.' });
    }

    const rawTitle = (title || 'video').toString();
    const asciiName =
      rawTitle.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_').trim() || 'video';
    const encodedName = encodeURIComponent(rawTitle);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${encodedName}.mp4`
    );

    const contentLength = videoResp.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    Readable.fromWeb(videoResp.body).pipe(res);
  } catch (error) {
    console.error('[BiliSave] stream-download error:', error);
    return res.status(500).json({ error: 'Something went wrong while downloading.' });
  }
}

