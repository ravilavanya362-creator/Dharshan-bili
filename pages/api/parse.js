// Uses yt-dlp itself to fetch video metadata (title/thumbnail/duration)
// instead of calling Bilibili's API directly. yt-dlp already handles
// Bilibili's anti-bot / signing requirements internally — this is the
// same tool that already works for the actual download, so metadata
// fetching now uses the same reliable path instead of a separate one
// that gets blocked.

import { spawn } from 'child_process';

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

function getMetadata(url) {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', [
      '--no-warnings',
      '--no-playlist',
      '--skip-download',
      '--dump-single-json',
      url,
    ]);

    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    ytdlp.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ytdlp.on('error', (err) => {
      reject(err);
    });

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.slice(0, 500) || 'yt-dlp exited with an error.'));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
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
    const info = await getMetadata(trimmedUrl);

    return res.status(200).json({
      success: true,
      title: info.title || 'Bilibili Video',
      thumbnail: info.thumbnail || null,
      duration: info.duration || null,
    });
  } catch (error) {
    console.error('[BiliSave] Parse error:', error.message || error);
    return res.status(200).json({
      success: false,
      error: 'Could not fetch video details. The video may be private, deleted, or region-locked.',
    });
  }
  }
