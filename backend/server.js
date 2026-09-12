const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 10000);

const jobs = new Map();

const MAX_JOBS = 1;
const JOB_TTL_MS = 30 * 60 * 1000;
const STALE_MS = 90 * 60 * 1000;
const DOWNLOAD_TIMEOUT_MS = 15 * 60 * 1000;

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

function removeFiles(job) {
  if (!job || !job.filePath) return;

  fsp.rm(job.filePath, { force: true }).catch(() => {});
  fsp.rm(`${job.filePath}.part`, { force: true }).catch(() => {});
}

function cleanupJob(job, reason = 'cleanup') {
  if (!job) return;

  console.log(`[JOB ${job.id}] cleanup: ${reason}`);

  if (job.timeout) {
    clearTimeout(job.timeout);
    job.timeout = null;
  }

  if (job.process && !job.process.killed) {
    try {
      job.process.kill('SIGTERM');
    } catch {}
  }

  removeFiles(job);
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

function updateProgress(job, text) {
  const matches = [
    ...String(text).matchAll(/(\d+(?:\.\d+)?)%/g)
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
}

function startJob(job) {
  job.status = 'downloading';
  job.message = 'Downloading video and audio...';

  console.log(`[JOB ${job.id}] START`);
  console.log(`[JOB ${job.id}] URL: ${job.url}`);
  console.log(`[JOB ${job.id}] Output: ${job.filePath}`);

  const runAttempt = (args, attemptName) => {
    return new Promise((resolve) => {
      console.log(
        `[JOB ${job.id}] ${attemptName} START`
      );

      const child = spawn(
        'yt-dlp',
        args,
        {
          stdio: ['ignore', 'pipe', 'pipe']
        }
      );

      job.process = child;

      let output = '';

      const recordOutput = (chunk) => {
        const text = chunk.toString();

        output += text;

        if (output.length > 16000) {
          output = output.slice(-16000);
        }

        updateProgress(job, text);

        console.log(
          `[JOB ${job.id}] ${text.trimEnd()}`
        );
      };

      child.stdout.on('data', recordOutput);
      child.stderr.on('data', recordOutput);

      child.on('error', (error) => {
        job.process = null;

        console.error(
          `[JOB ${job.id}] ${attemptName} PROCESS ERROR:`,
          error
        );

        resolve({
          code: -1,
          output
        });
      });

      child.on('close', (code, signal) => {
        job.process = null;

        console.log(
          `[JOB ${job.id}] ${attemptName} CLOSE code=${code} signal=${signal || 'none'}`
        );

        resolve({
          code,
          signal,
          output
        });
      });
    });
  };

  // First attempt:
  // Best available separate video + audio streams.
  const firstAttempt = [
    '--no-playlist',
    '--newline',
    '--retries',
    '5',
    '--fragment-retries',
    '5',
    '--socket-timeout',
    '30',
    '--http-chunk-size',
    '5M',
    '--force-ipv4',
    '--concurrent-fragments',
    '4',
    '--merge-output-format',
    'mp4',
    '-f',
    'bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b',
    '-o',
    job.filePath,
    job.url
  ];

  // Fallback:
  // Try a progressive/single-file MP4 instead of
  // separately downloading video and audio.
  const fallbackAttempt = [
    '--no-playlist',
    '--newline',
    '--retries',
    '8',
    '--fragment-retries',
    '8',
    '--socket-timeout',
    '30',
    '--force-ipv4',
    '--merge-output-format',
    'mp4',
    '-f',
    'b[ext=mp4]/b',
    '-o',
    job.filePath,
    job.url
  ];

  const finishSuccess = async () => {
    try {
      const stat = await fsp.stat(job.filePath);

      if (!stat.size) {
        throw new Error(
          'Downloaded file is empty.'
        );
      }

      job.size = stat.size;
      job.status = 'done';
      job.progress = 100;
      job.message = 'Ready to download.';
      job.finishedAt = Date.now();

      console.log(
        `[JOB ${job.id}] DONE size=${stat.size} bytes`
      );

    } catch (error) {
      job.status = 'error';
      job.error = error.message;
      job.message = 'Download failed.';
      job.finishedAt = Date.now();

      console.error(
        `[JOB ${job.id}] FILE ERROR:`,
        error
      );

      removeFiles(job);
    }
  };

  const failJob = (output) => {
    job.status = 'error';
    job.error =
      'yt-dlp could not download this video.';
    job.debug = String(output || '').slice(-4000);
    job.message = 'Download failed.';
    job.finishedAt = Date.now();

    console.error(
      `[JOB ${job.id}] DOWNLOAD FAILED`
    );

    console.error(
      `[JOB ${job.id}] DEBUG: ${job.debug}`
    );

    removeFiles(job);
  };

  const run = async () => {
    const timeoutPromise = new Promise((resolve) => {
      job.timeout = setTimeout(() => {
        if (job.status === 'downloading') {
          console.error(
            `[JOB ${job.id}] TIMEOUT after 15 minutes`
          );

          job.status = 'error';
          job.error =
            'Download timed out. Please try again.';
          job.message = 'Download timed out.';
          job.finishedAt = Date.now();
          job.timedOut = true;

          if (
            job.process &&
            !job.process.killed
          ) {
            try {
              job.process.kill('SIGTERM');
            } catch {}
          }

          resolve('timeout');
        }
      }, DOWNLOAD_TIMEOUT_MS);
    });

    const downloadPromise = (async () => {
      // Attempt 1: best quality
      const first = await runAttempt(
        firstAttempt,
        'HIGH QUALITY'
      );

      if (first.code === 0) {
        return 'success';
      }

      if (job.timedOut || job.cleaned) {
        return 'stopped';
      }

      console.log(
        `[JOB ${job.id}] HIGH QUALITY FAILED`
      );

      console.log(
        `[JOB ${job.id}] Trying fallback MP4 format...`
      );

      // Remove failed/partial first attempt
      // before starting fallback.
      removeFiles(job);

      job.progress = 0;
      job.message =
        'High quality stream unavailable. Trying compatible MP4...';

      // Attempt 2: progressive/single-file MP4
      const fallback = await runAttempt(
        fallbackAttempt,
        'FALLBACK MP4'
      );

      if (fallback.code === 0) {
        return 'success';
      }

      if (job.timedOut || job.cleaned) {
        return 'stopped';
      }

      failJob(
        fallback.output || first.output
      );

      return 'failed';
    })();

    const result = await Promise.race([
      downloadPromise,
      timeoutPromise
    ]);

    if (job.timeout) {
      clearTimeout(job.timeout);
      job.timeout = null;
    }

    if (result === 'success') {
      await finishSuccess();
    }
  };

  run().catch((error) => {
    if (job.timeout) {
      clearTimeout(job.timeout);
      job.timeout = null;
    }

    if (job.cleaned) return;

    job.status = 'error';
    job.error =
      error.message || 'Download failed.';
    job.message = 'Download failed.';
    job.finishedAt = Date.now();

    console.error(
      `[JOB ${job.id}] UNEXPECTED ERROR:`,
      error
    );

    removeFiles(job);
  });
}

async function handleStart(req, res) {
  console.log('[HTTP] POST /start');

  if (countActiveJobs() >= MAX_JOBS) {
    console.log(
      '[HTTP] /start rejected: downloader busy'
    );

    return json(res, 429, {
      success: false,
      error:
        'Downloader is busy. Please try again in a moment.'
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

  console.log(
    `[HTTP] /start URL=${url}`
  );

  if (!url) {
    return json(res, 400, {
      success: false,
      error: 'URL is required.'
    });
  }

  if (!isBilibiliUrl(url)) {
    return json(res, 400, {
      success: false,
      error:
        'Only Bilibili URLs are supported.'
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
    timeout: null,
    cleaned: false,
    timedOut: false,
    size: 0,
    error: null,
    debug: ''
  };

  jobs.set(id, job);

  console.log(
    `[JOB ${id}] QUEUED`
  );

  startJob(job);

  return json(res, 200, {
    success: true,
    jobId: id
  });
}

function handleStatus(req, res, url) {
  const id =
    url.searchParams.get('id');

  const job = jobs.get(id);

  console.log(
    `[HTTP] GET /status id=${id || 'missing'}`
  );

  if (!job || job.cleaned) {
    return json(res, 404, {
      success: false,
      error:
        'Job not found or expired.'
    });
  }

  return json(res, 200, {
    success: true,
    jobId: job.id,
    status: job.status,
    progress: Math.round(
      job.progress || 0
    ),
    message: job.message,
    error:
      job.status === 'error'
        ? job.error
        : undefined
  });
}

async function handleFile(req, res, url) {
  const id =
    url.searchParams.get('id');

  const job = jobs.get(id);

  console.log(
    `[HTTP] GET /file id=${id || 'missing'}`
  );

  if (!job || job.cleaned) {
    return json(res, 404, {
      success: false,
      error:
        'Job not found or expired.'
    });
  }

  if (job.status !== 'done') {
    return json(res, 409, {
      success: false,
      error:
        'Video is not ready yet.'
    });
  }

  try {
    const stat = await fsp.stat(
      job.filePath
    );

    const filename =
      safeTitle(job.title);

    const encoded =
      encodeURIComponent(filename)
        .replace(/'/g, '%27');

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
  'attachment; filename="BiliSave-Video.mp4"'
);
    res.setHeader(
      'Cache-Control',
      'no-store'
    );

    const stream =
      fs.createReadStream(
        job.filePath
      );

    let completed = false;

    stream.on(
      'error',
      async (error) => {
        console.error(
          `[JOB ${id}] FILE STREAM ERROR:`,
          error
        );

        if (!res.headersSent) {
          json(res, 500, {
            success: false,
            error:
              'Could not read downloaded file.'
          });
        }

        cleanupJob(
          job,
          'file stream error'
        );

        jobs.delete(id);
      }
    );

    stream.on('end', () => {
      completed = true;

      console.log(
        `[JOB ${id}] FILE SENT`
      );
    });

    stream.on(
      'close',
      async () => {
        await fsp
          .rm(job.filePath, {
            force: true
          })
          .catch(() => {});

        await fsp
          .rm(
            `${job.filePath}.part`,
            { force: true }
          )
          .catch(() => {});

        job.cleaned = true;

        jobs.delete(id);
      }
    );

    res.on('close', () => {
      if (!completed) {
        stream.destroy();
      }
    });

    stream.pipe(res);

  } catch (error) {
    console.error(
      `[JOB ${id}] FILE NOT FOUND:`,
      error
    );

    return json(res, 404, {
      success: false,
      error:
        'Downloaded file has expired.'
    });
  }
}

const server =
  http.createServer(
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
            service:
              'BiliSave downloader'
          });
        }

        if (
          req.method === 'POST' &&
          url.pathname === '/start'
        ) {
          return handleStart(
            req,
            res
          );
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
        console.error(
          '[SERVER ERROR]',
          error
        );

        if (!res.headersSent) {
          json(res, 500, {
            success: false,
            error:
              'Internal downloader error.'
          });
        }
      }
    }
  );

server.requestTimeout = 0;
server.timeout = 0;
server.headersTimeout = 0;

const cleanupTimer =
  setInterval(() => {
    const now = Date.now();

    for (
      const [id, job]
      of jobs
    ) {
      const age =
        now - job.createdAt;

      const doneAge =
        job.finishedAt
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
        cleanupJob(
          job,
          'expired'
        );

        jobs.delete(id);
      }
    }
  }, 10 * 60 * 1000);

cleanupTimer.unref();

function shutdown() {
  console.log(
    '[SERVER] shutting down'
  );

  for (
    const job
    of jobs.values()
  ) {
    cleanupJob(
      job,
      'server shutdown'
    );
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(
    () => process.exit(0),
    5000
  ).unref();
}

process.on(
  'SIGTERM',
  shutdown
);

process.on(
  'SIGINT',
  shutdown
);

server.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `BiliSave downloader listening on 0.0.0.0:${PORT}`
    );
  }
);
