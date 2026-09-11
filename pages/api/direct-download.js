// Streams yt-dlp's output directly to the HTTP response.
// The merged video is never written to disk as a persisted file —
// bytes flow: yt-dlp -> stdout -> this response -> user's browser.
// This is what actually prevents the server storage from filling up.

import { spawn } from 'child_process';

export const config = {
  api: { responseLimit: false },
};

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
  const title = req.method === 'POST' ? req.body?.title : req.query.title;
  const hd = req.method === 'POST' ? req.body?.hd : req.query.hd === 'true';

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Please provide a Bilibili URL.' });
  }

  const trimmedUrl = url.trim();

  if (!isBilibiliUrl(trimmedUrl)) {
    return res.status(400).json({ error: 'Please provide a valid Bilibili or b23.tv URL.' });
  }

  const format = hd === true
    ? 'bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b'
    : 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/bv*[height<=720]+ba/b[height<=720]';

  const rawTitle = (title || 'video').toString();
  const asciiName = rawTitle.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_').trim() || 'video';
  const encodedName = encodeURIComponent(rawTitle).replace(/['()]/g, escape).replace(/\*/g, '%2A');

  const ytdlp = spawn('yt-dlp', [
    '--no-warnings',
    '--no-playlist',

    '--concurrent-fragments',
    '16',

    '--retries',
    '5',

    '--fragment-retries',
    '5',

    '--socket-timeout',
    '30',

    '-f',
    format,

    // Merge video + audio into MP4, written straight to stdout ("-")
    // instead of a file on disk.
    '--merge-output-format',
    'mp4',

    // Since output is a live pipe (not a seekable file), ffmpeg can't
    // do the normal two-pass "faststart" metadata placement. Using
    // fragmented MP4 flags instead keeps metadata streaming-friendly,
    // which fixes thumbnail generation and playback in file managers.
    '--postprocessor-args',
    'Merger+ffmpeg_o:-movflags frag_keyframe+empty_moov',

    '-o',
    '-',

    trimmedUrl,
  ]);

  let stderr = '';
  let headersSent = false;

  ytdlp.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  ytdlp.stdout.once('data', (firstChunk) => {
    // Only commit to a 200 + streaming response once we know yt-dlp is
    // actually producing video bytes. If it fails before this point,
    // we still get to send a clean JSON error instead of a half-open
    // stream.
    if (!headersSent) {
      headersSent = true;
      res.status(200);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${encodedName}.mp4`
      );
    }
    res.write(firstChunk);
  });

  ytdlp.stdout.on('data', (chunk) => {
    if (headersSent) {
      res.write(chunk);
    }
  });

  ytdlp.on('error', (err) => {
    console.error('[BiliSave] yt-dlp spawn error:', err);
    if (!headersSent) {
      res.status(500).json({ error: 'Failed to start downloader.' });
    } else {
      res.end();
    }
  });

  ytdlp.on('close', (code) => {
    if (code !== 0 && !headersSent) {
      console.error('[BiliSave] yt-dlp failed:', stderr.slice(0, 500));
      res.status(422).json({
        error: 'Could not download this video. It may be private, deleted, region-locked, or need a format this downloader cannot merge on the fly.',
      });
      return;
    }
    res.end();
  });

  req.on('close', () => {
    // Client disconnected early — stop yt-dlp instead of letting it run
    // to completion for nothing.
    if (!ytdlp.killed) {
      ytdlp.kill('SIGKILL');
    }
  });
}

