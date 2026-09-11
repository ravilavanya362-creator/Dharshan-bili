// Starts yt-dlp in the background and returns immediately.
// Long downloads continue while the client polls job-status.

import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { jobs } from '../../lib/jobs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, title } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  const jobId = crypto.randomBytes(8).toString('hex');

  const outTemplate = path.join(
    os.tmpdir(),
    `${jobId}.%(ext)s`
  );

  const finalPath = path.join(
    os.tmpdir(),
    `${jobId}.mp4`
  );

  jobs.set(jobId, {
    status: 'processing',
    progress: 0,
    title: title || 'video',
    createdAt: Date.now()
  });

  const format = req.body.hd === true
    ? 'bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b'
    : 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/bv*[height<=720]+ba/b[height<=720]';

  const ytdlp = spawn('yt-dlp', [
    '--no-warnings',
    '--no-playlist',

    // Parallel fragment downloading
    '--concurrent-fragments',
    '16',

    // Better progress output
    '--newline',

    // Retry temporary CDN failures
    '--retries',
    '5',

    '--fragment-retries',
    '5',

    // Give slow CDN connections more time
    '--socket-timeout',
    '30',

    // Prefer MP4-compatible streams
    '-f',
    format,

    // Merge video + audio into MP4
    '--merge-output-format',
    'mp4',

    '-o',
    outTemplate,

    url
  ]);

  let stderr = '';

  ytdlp.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  ytdlp.stdout.on('data', (chunk) => {
    const text = chunk.toString();

    const lines = text.split('\n');

    for (const line of lines) {

      // Example:
      // [download] 45.2% of 66.61MiB at 1.20MiB/s ETA 00:14

      const match = line.match(
        /\[download\]\s+([\d.]+)%/
      );

      if (match) {
        const pct = parseFloat(match[1]);

        const current = jobs.get(jobId) || {};

        jobs.set(jobId, {
          ...current,
          status: 'processing',
          progress: pct
        });
      }

      if (
        line.includes('[Merger]') ||
        line.includes('Merging formats')
      ) {
        const current = jobs.get(jobId) || {};

        jobs.set(jobId, {
          ...current,
          status: 'merging',
          progress: 100
        });
      }
    }
  });

  ytdlp.on('error', (err) => {
    console.error('yt-dlp error:', err);

    jobs.set(jobId, {
      status: 'error',
      message: err.message || 'Failed to start downloader.'
    });
  });

  ytdlp.on('close', (code) => {

    if (code !== 0) {
      console.error('yt-dlp failed:', stderr);

      jobs.set(jobId, {
        status: 'error',
        message:
          stderr.slice(0, 500) ||
          'Download failed.'
      });

      return;
    }

    if (!fs.existsSync(finalPath)) {

      jobs.set(jobId, {
        status: 'error',
        message: 'Downloaded file not found.'
      });

      return;
    }

    jobs.set(jobId, {
      status: 'done',
      progress: 100,
      filePath: finalPath,
      title: title || 'video'
    });
  });

  // Return immediately.
  // Download continues in background.
  return res.status(200).json({
    jobId
  });
}
