import axios from 'axios';

export default async function handler(req, res) {
  const { url, title } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Range': req.headers.range || 'bytes=0-'
      }
    });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.pipe(res);
  } catch (error) {
    console.error('Download proxy error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream video for download.' });
    }
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
