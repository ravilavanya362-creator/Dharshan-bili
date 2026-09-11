// Proven approach: let yt-dlp do the entire download + merge itself
// (it re-fetches fresh signed CDN URLs at download time and handles all
// headers/redirects internally). Avoids passing Bilibili's short-lived
// signed URLs between separate requests.
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { url, title } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  const id = crypto.randomBytes(6).toString('hex');
  const outTemplate = path.join(os.tmpdir(), `${id}.%(ext)s`);
  const finalPath = path.join(os.tmpdir(), `${id}.mp4`);

  const ytdlp = spawn('yt-dlp', [
  '--no-warnings',
  '--no-playlist',

  // FAST DOWNLOAD
  '--concurrent-fragments', '16',

  // Faster network buffering
  '--buffer-size', '16K',

  // Retry only when actually needed
  '--retries', '3',
  '--fragment-retries', '3',

  // Prevent stuck connections
  '--socket-timeout', '15',

  // MP4-compatible formats
  '-f',
  req.body.hd === true
    ? 'bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b'
    : 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/bv*[height<=720]+ba/b[height<=720]',

  '--merge-output-format', 'mp4',

  '-o', outTemplate,
  url,
]);
  let stderr = '';
  ytdlp.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  ytdlp.on('error', (err) => {
    console.error('Failed to start yt-dlp:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start downloader.' });
    }
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error(stderr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed.', details: stderr.slice(0, 500) });
      }
      return;
    }

    if (!fs.existsSync(finalPath)) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Downloaded file not found.' });
      }
      return;
    }

    const rawTitle = (title || 'video').toString();
    // ASCII fallback filename (older clients) plus RFC 5987-encoded
    // filename* for browsers that support full Unicode titles.
    let asciiName = rawTitle.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_').trim();
    if (!asciiName) asciiName = 'video';
    const encodedName = encodeURIComponent(rawTitle).replace(/['()]/g, escape).replace(/\*/g, '%2A');

    const stat = fs.statSync(finalPath);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${encodedName}.mp4`
    );
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(finalPath);
    stream.pipe(res);
    stream.on('close', () => {
      fs.unlink(finalPath, () => {});
    });
    stream.on('error', (err) => {
      console.error(err);
      fs.unlink(finalPath, () => {});
    });
  });
}
