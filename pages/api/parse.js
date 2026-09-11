// Simple, proven approach: yt-dlp only fetches metadata here (title,
// thumbnail, duration). The actual download+merge happens in download.js,
// where yt-dlp itself (not a hand-rolled ffmpeg+headers reconstruction)
// re-fetches fresh signed CDN URLs and merges streams. This avoids passing
// Bilibili's short-lived signed URLs between separate requests, which is
// what caused 403 Forbidden errors in the previous approach.
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
    const { stdout } = await execFileAsync(
      'yt-dlp',
      ['--no-warnings', '--dump-json', '--no-playlist', trimmedUrl],
      { timeout: 60000, maxBuffer: 1024 * 1024 * 20 }
    );

    const firstLine = stdout.trim().split('\n')[0];
    const info = JSON.parse(firstLine);

    const title = info.title || 'Bilibili Video';

    return res.status(200).json({
      success: true,
      title,
      thumbnail: info.thumbnail || null,
      duration: info.duration || null,
      videoUrl: trimmedUrl,
    });
  } catch (error) {
    console.error('[BiliSave] Parse error:', error);
    return res.status(200).json({
      success: false,
      error: 'Could not fetch video details. The video may be private, deleted, or region-locked.',
    });
  }
}
