import { spawn } from 'child_process';

export const config = {
  api: {
    responseLimit: false,
  },
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
  const url = req.method === 'POST'
    ? req.body?.url
    : req.query.url;

  const title = req.method === 'POST'
    ? req.body?.title
    : req.query.title;

  const hd = req.method === 'POST'
    ? req.body?.hd === true
    : req.query.hd === 'true';

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      error: 'Please provide a Bilibili URL.',
    });
  }

  const trimmedUrl = url.trim();

  if (!isBilibiliUrl(trimmedUrl)) {
    return res.status(400).json({
      error: 'Please provide a valid Bilibili or b23.tv URL.',
    });
  }

  const format = hd
    ? 'bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b'
    : 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/bv*[height<=720]+ba/b[height<=720]';

  const rawTitle = (title || 'Bilibili Video').toString();

  const asciiName =
    rawTitle
      .replace(/[^\x20-\x7E]/g, '_')
      .replace(/["\\]/g, '_')
      .trim() || 'video';

  const encodedName = encodeURIComponent(rawTitle)
    .replace(/['()]/g, escape)
    .replace(/\*/g, '%2A');

  const ytdlp = spawn('yt-dlp', [
    '--no-warnings',
    '--no-playlist',

    '--concurrent-fragments',
    '8',

    '--retries',
    '5',
    '--fragment-retries',
    '5',
    '--socket-timeout',
    '30',

    '-f',
    format,

    '--merge-output-format',
    'mp4',

    '--postprocessor-args',
    'Merger+ffmpeg_o:-movflags frag_keyframe+empty_moov',

    '-o',
    '-',

    trimmedUrl,
  ]);

  let stderr = '';
  let started = false;

  ytdlp.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  ytdlp.stdout.on('data', (chunk) => {
    if (!started) {
      started = true;

      res.statusCode = 200;

      res.setHeader(
        'Content-Type',
        'video/mp4'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${encodedName}.mp4`
      );

      res.setHeader(
        'Cache-Control',
        'no-store'
      );

      res.setHeader(
        'X-Content-Type-Options',
        'nosniff'
      );
    }

    if (!res.writableEnded) {
      res.write(chunk);
    }
  });

  ytdlp.on('error', (err) => {
    console.error(
      '[BiliSave] yt-dlp spawn error:',
      err
    );

    if (!started && !res.headersSent) {
      res.status(500).json({
        error: 'Failed to start downloader.',
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error(
        '[BiliSave] yt-dlp failed:',
        stderr.slice(0, 1000)
      );

      if (!started && !res.headersSent) {
        res.status(422).json({
          error:
            'Could not download this video. It may be private, deleted, region-locked, or temporarily unavailable.',
        });
      } else if (!res.writableEnded) {
        res.end();
      }

      return;
    }

    if (!res.writableEnded) {
      res.end();
    }
  });

  req.on('close', () => {
    if (!res.writableEnded && !ytdlp.killed) {
      ytdlp.kill('SIGKILL');
    }
  });
}
