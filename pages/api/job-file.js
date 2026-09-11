// Streams the already-finished file. Since the file is fully ready by the
// time this is called, the transfer starts immediately - no silent
// multi-minute gap, so this request never risks an idle-connection timeout.
import fs from 'fs';
import { jobs } from '../../lib/jobs';

export const config = {
  api: { responseLimit: false },
};

export default function handler(req, res) {
  const { id } = req.query;
  const job = jobs.get(id);

  if (!job || job.status !== 'done' || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).json({ error: 'File not ready or not found.' });
  }

  const rawTitle = (job.title || 'video').toString();
  let asciiName = rawTitle.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_').trim();
  if (!asciiName) asciiName = 'video';
  const encodedName = encodeURIComponent(rawTitle).replace(/['()]/g, escape).replace(/\*/g, '%2A');

  const stat = fs.statSync(job.filePath);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${asciiName}.mp4"; filename*=UTF-8''${encodedName}.mp4`
  );
  res.setHeader('Content-Length', stat.size);

  const stream = fs.createReadStream(job.filePath);
  stream.pipe(res);
  stream.on('close', () => {
    fs.unlink(job.filePath, () => {});
    jobs.delete(id);
  });
  stream.on('error', (err) => {
    console.error(err);
    fs.unlink(job.filePath, () => {});
    jobs.delete(id);
  });
}
