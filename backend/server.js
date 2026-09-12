const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 10000);

const jobs = new Map();

const MAX_JOBS = 2;
const JOB_TTL_MS = 30 * 60 * 1000;
const STALE_MS = 90 * 60 * 1000;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, data) {
  cors(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function isBilibiliUrl(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();

    return (
      host === 'b23.tv' ||
      host === 'www.bilibili.com' ||
      host === 'bilibili.com' ||
      host.endsWith('.bilibili.com')
    );
  } catch {
    return false;
  }
}

function safeTitle(title) {
  const cleaned = String(title || 'Bilibili Video')
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (cleaned || 'Bilibili Video').slice(0, 180);
}

function cleanupJob(job) {
  if (!job) return;

  if (job.process && !job.process.killed) {
    try {
      job.process.kill('SIGTERM');
    } catch {}
  }

  if (job.filePath) {
    fsp.rm(job.filePath, { force: true }).catch(() => {});
    fsp.rm(`${job.filePath}.part`, { force: true }).catch(() => {});
  }

  job.cleaned = true;
}

function countActiveJobs() {
  let count = 0;

  for (const job of jobs.values()) {
    if (
      job.status === 'queued' ||
      job.status === 'downloading'
    ) {
      count++;
    }
  }

  return count;
}

function startJob(job) {
  job.status = 'downloading';
  job.message = 'Downloading and merging video...';

  const args = [
    '--no-playlist',
    '--newline',
    '--retries',
    '5',
    '--fragment-retries',
    '5',
    '--socket-timeout',
    '30',
    '--concurrent-fragments',
    '8',
    '--merge-output-format',
    'mp4',
    '-f',
    'bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b',
    '-o',
    job.filePath,
    job.url
  ];

  const child = spawn(
    'yt-dlp',
    args,
    {
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );

  job.process = child;

  let stderr = '';

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();

    const matches = [
      ...text.matchAll(/(\d+(?:\.\d+)?)%/g)
    ];

    if (matches.length) {
      const value = Number(
        matches[matches.length - 1][1]
      );

      if (Number.isFinite(value)) {
        job.progress = Math.max(
          0,
          Math.min(100, value)
        );
      }
    }

    if (/Merging formats|Merging into/i.test(text)) {
      job.message = 'Merging video and audio...';
      job.progress = 100;
    }
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();

    if (stderr.length > 12000) {
      stderr = stderr.slice(-12000);
    }
  });

  child.on('error', (error) => {
    job.status = 'error';

    job.error =
      error.code === 'ENOENT'
        ? 'yt-dlp is not installed on the downloader server.'
        : error.message;

    job.message = 'Download failed.';
    job.finishedAt = Date.now();

    cleanupJob(job);
  });

  child.on('close', async (code) => {
    job.process = null;

    if (job.cleaned) return;

    if (code !== 0) {
      job.status = 'error';
      job.error = 'yt-dlp could not download this video.';
      job.debug = stderr.slice(-4000);
      job.message = 'Download failed.';
      job.finishedAt = Date.now();

      await fsp
        .rm(job.filePath, { force: true })
        .catch(() => {});

      await fsp
        .rm(`${job.filePath}.part`, { force: true })
        .catch(() => {});

      return;
    }

    try {
      const stat = await fsp.stat(job.filePath);

      if (!stat.size) {
        throw new Error('Downloaded file is empty.');
      }

      job.size = stat.size;
      job.status = 'done';
      job.progress = 100;
      job.message = 'Ready to download.';
      job.finishedAt = Date.now();

    } catch (error) {
      job.status = 'error';
      job.error = error.message;
      job.message = 'Download failed.';
      job.finishedAt = Date.now();

      await fsp
        .rm(job.filePath, { force: true })
        .catch(() => {});
    }
  });
}

async function handleStart(req, res) {
  if (countActiveJobs() >= MAX_JOBS) {
    return json(res, 429, {
      success: false,
      error: 'Downloader is busy. Please try again in a moment.'
    });
  }

  let body = '';

  for await (const chunk of req) {
    body += chunk;
  }

  let data;

  try {
    data = JSON.parse(body || '{}');
  } catch {
    return json(res, 400, {
      success: false,
      error: 'Invalid JSON.'
    });
  }

  const url =
    typeof data.url === 'string'
      ? data.url.trim()
      : '';

  const title = safeTitle(data.title);

  if (!url) {
    return json(res, 400, {
      success: false,
      error: 'URL is required.'
    });
  }

  if (!isBilibiliUrl(url)) {
    return json(res, 400, {
      success: false,
      error: 'Only Bilibili URLs are supported.'
    });
  }

  const id = crypto.randomUUID();

  const filePath = path.join(
    os.tmpdir(),
    `bilisave-${id}.mp4`
  );

  const job = {
    id,
    url,
    title,
    filePath,
    status: 'queued',
    progress: 0,
    message: 'Starting downloader...',
    createdAt: Date.now(),
    finishedAt: null,
    process: null,
    cleaned: false
  };

  jobs.set(id, job);

  startJob(job);

  return json(res, 200, {
    success: true,
    jobId: id
  });
}

function handleStatus(req, res, url) {
  const id = url.searchParams.get('id');

  const job = jobs.get(id);

  if (!job || job.cleaned) {
    return json(res, 404, {
      success: false,
      error: 'Job not found or expired.'
    });
  }

  return json(res, 200, {
    success: true,
    jobId: job.id,
    status: job.status,
    progress: Math.round(job.progress || 0),
    message: job.message,
    error:
      job.status === 'error'
        ? job.error
        : undefined
  });
}

async function handleFile(req, res, url) {
  const id = url.searchParams.get('id');

  const job = jobs.get(id);

  if (!job || job.cleaned) {
    return json(res, 404, {
      success: false,
      error: 'Job not found or expired.'
    });
  }

  if (job.status !== 'done') {
    return json(res, 409, {
      success: false,
      error: 'Video is not ready yet.'
    });
  }

  try {
    const stat = await fsp.stat(job.filePath);

    const filename = safeTitle(job.title);

    const encoded = encodeURIComponent(
      filename
    ).replace(/'/g, '%27');

    cors(res);

    res.statusCode = 200;

    res.setHeader(
      'Content-Type',
      'video/mp4'
    );

    res.setHeader(
      'Content-Length',
      stat.size
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.mp4"; filename*=UTF-8''${encoded}.mp4`
    );

    res.setHeader(
      'Cache-Control',
      'no-store'
    );

    const stream = fs.createReadStream(
      job.filePath
    );

    let completed = false;

    stream.on('error', async () => {
      if (!res.headersSent) {
        json(res, 500, {
          success: false,
          error: 'Could not read downloaded file.'
        });
      }

      cleanupJob(job);
      jobs.delete(id);
    });

    stream.on('end', () => {
      completed = true;
    });

    stream.on('close', async () => {
      await fsp
        .rm(job.filePath, { force: true })
        .catch(() => {});

      await fsp
        .rm(`${job.filePath}.part`, { force: true })
        .catch(() => {});

      job.cleaned = true;

      jobs.delete(id);
    });

    res.on('close', () => {
      if (!completed) {
        stream.destroy();
      }
    });

    stream.pipe(res);

  } catch {
    return json(res, 404, {
      success: false,
      error: 'Downloaded file has expired.'
    });
  }
}

const server = http.createServer(
  async (req, res) => {
    cors(res);

    if (req.method === 'OPTIONS') {
      return res.end();
    }

    const url = new URL(
      req.url,
      `http://${req.headers.host || 'localhost'}`
    );

    try {
      if (
        req.method === 'GET' &&
        (
          url.pathname === '/' ||
          url.pathname === '/health'
        )
      ) {
        return json(res, 200, {
          ok: true,
          service: 'BiliSave downloader'
        });
      }

      if (
        req.method === 'POST' &&
        url.pathname === '/start'
      ) {
        return handleStart(req, res);
      }

      if (
        req.method === 'GET' &&
        url.pathname === '/status'
      ) {
        return handleStatus(
          req,
          res,
          url
        );
      }

      if (
        req.method === 'GET' &&
        url.pathname === '/file'
      ) {
        return handleFile(
          req,
          res,
          url
        );
      }

      return json(res, 404, {
        success: false,
        error: 'Not found.'
      });

    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        json(res, 500, {
          success: false,
          error: 'Internal downloader error.'
        });
      }
    }
  }
);

server.requestTimeout = 0;
server.timeout = 0;
server.headersTimeout = 0;

const cleanupTimer = setInterval(() => {
  const now = Date.now();

  for (const [id, job] of jobs) {
    const age = now - job.createdAt;

    const doneAge = job.finishedAt
      ? now - job.finishedAt
      : 0;

    if (
      age > STALE_MS ||
      (
        job.status === 'done' &&
        doneAge > JOB_TTL_MS
      ) ||
      (
        job.status === 'error' &&
        doneAge > JOB_TTL_MS
      )
    ) {
      cleanupJob(job);
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000);

cleanupTimer.unref();

function shutdown() {
  for (const job of jobs.values()) {
    cleanupJob(job);
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(0);
  }, 5000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `BiliSave downloader listening on 0.0.0.0:${PORT}`
    );
  }
);
