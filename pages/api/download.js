import { spawn } from 'child_process';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  // సర్వర్ మీద ఫైల్ డౌన్‌లోడ్ చేయకుండా కేవలం yt-dlp ద్వారా డైరెక్ట్ మీడియా లింక్ తీసుకుంటాం (Zero Server Load)
  const ytdlp = spawn('yt-dlp', [
    '--get-url',
    '-f', 'best[ext=mp4]/best',
    url,
  ]);

  let output = '';
  let stderr = '';

  ytdlp.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });

  ytdlp.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  ytdlp.on('error', (err) => {
    console.error('Failed to start yt-dlp:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch video link.' });
    }
  });

  ytdlp.on('close', (code) => {
    if (code !== 0 || !output.trim()) {
      console.error(stderr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Could not fetch video URL.', details: stderr.slice(0, 300) });
      }
      return;
    }

    const videoUrls = output.trim().split('\n');
    const directUrl = videoUrls[0]; // డైరెక్ట్ వీడియో లింక్

    // క్లయింట్‌కి డైరెక్ట్ లింక్ పంపిస్తాం, సర్వర్ క్రాష్ అవ్వదు
    return res.status(200).json({ downloadUrl: directUrl });
  });
}

