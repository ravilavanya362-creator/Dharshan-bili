// True single-click streaming download: fetches fresh signed CDN URLs via
// yt-dlp right here (not reused from an earlier request, which caused 403s
// before), then pipes ffmpeg's output directly to the browser as it's
// produced - no waiting for the whole file, no separate job/poll step.
// Uses fragmented-mp4 flags so ffmpeg can write to a non-seekable stream
// (stdout -> HTTP response) instead of needing to seek back to write the
// moov atom at the end, which a normal mp4 mux requires.
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const config = {
  api: { responseLimit: false },
};

function getHeaders(format) {
  const raw = format?.http_headers || {};
  const allowed = {};
  for (const [key, value] of Object.entries(raw)) {
    const lower = key.toLowerCase();
    if (lower === 'user-agent' || lower === 'referer' || lower === 'origin' || lower === 'cookie') {
      allowed[key] = String(value);
    }
  }
  if (!allowed['User-Agent']) allowed['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36';
  if (!allowed['Referer']) allowed['Referer'] = 'https://www.bilibili.com/';
  if (!allowed['Origin']) allowed['Origin'] = 'https://www.bilibili.com';
  return allowed;
}

function headersToFFmpeg(headers) {
  return Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') + '\r\n';
}

export default async function handler(req, res) {
  const { url, title } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  let info;
  try {
    const { stdout } = await execFileAsync(
      'yt-dlp',
      ['--no-warnings', '--dump-json', '--no-playlist', url],
      { timeout: 60000, maxBuffer: 1024 * 1024 * 20 }
    );
    info = JSON.parse(stdout.trim().split('\n')[0]);
  } catch (err) {
    console.error('[BiliSave] yt-dlp info error:', err);
    return res.status(500).json({ error: 'Could not fetch video info.' });
  }

  const formats = info.formats || [];
  const combined = formats
    .filter((f) => f.url && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none' && (f.height || 0) <= 720)
    .sort((a, b) => (b.height || 0) - (a.height || 0))[0];
  const videoOnly = formats
    .filter((f) => f.url && f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none') && (f.height || 0) <= 720)
    .sort((a, b) => (b.height || 0) - (a.height || 0))[0];
  const audioOnly = formats
    .filter((f) => f.url && f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

  const rawTitle = (title || info.title || 'video').toString();
  let asciiName = rawTitle.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_').trim();
  if (!asciiName) asciiName = 'video';
  const encodedName = encodeURIComponent(rawTitle).replace(/['()]/g, escape).replace(/\*/g, '%2A');

  const ffmpegArgs = ['-hide_banner', '-loglevel', 'error'];

  if (combined) {
    ffmpegArgs.push('-headers', headersToFFmpeg(getHeaders(combined)), '-i', combined.url);
  } else if (videoOnly && audioOnly) {
    ffmpegArgs.push('-headers', headersToFFmpeg(getHeaders(videoOnly)), '-i', videoOnly.url);
    ffmpegArgs.push('-headers', headersToFFmpeg(getHeaders(audioOnly)), '-i', audioOnly.url);
    ffmpegArgs.push('-map', '0:v:0', '-map', '1:a:0');
  } else {
    return res.status(500).json({ error: 'No downloadable stream found for this video.' });
  }

  ffmpegArgs.push(
    '-c', 'copy',
    '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
    '-f', 'mp4',
    'pipe:1'
  );

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  let stderr = '';
  ffmpeg.stderr.on('data', (d) => {
    stderr += d.toString();
    if (stderr.length > 8000) stderr = stderr.slice(-8000);
  });

  let headersSent = false;
  ffmpeg.stdout.once('data', () => {
    if (!headersSent) {
      headersSent = true;
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${encodedName}.mp4`,
        'Cache-Control': 'no-store',
      });
    }
  });

  ffmpeg.stdout.pipe(res);

  ffmpeg.on('error', (err) => {
    console.error('[BiliSave] ffmpeg spawn error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Could not start ffmpeg.' });
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0 && !headersSent) {
      console.error(stderr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed.', details: stderr.slice(0, 500) });
      }
    }
  });

  req.on('close', () => {
    if (!ffmpeg.killed) ffmpeg.kill('SIGKILL');
  });
}

