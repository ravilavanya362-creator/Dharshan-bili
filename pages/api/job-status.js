import { jobs } from '../../lib/jobs';

export default function handler(req, res) {
  const { id } = req.query;
  const job = jobs.get(id);
  if (!job) {
    return res.status(404).json({ status: 'not_found' });
  }
  return res.status(200).json({ status: job.status, progress: job.progress || 0, message: job.message || null });
}

