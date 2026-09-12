import axios from 'axios';

export default async function handler(req, res) {
  const { url, title } = req.query;

  if (!url) {
    return res.status(400).send('Download URL is required');
  }

  try {
    const filename = `${encodeURIComponent(title || 'bilibili-video')}.mp4`;

    // Bilibili స్ట్రీమ్ లింక్ నుండి డేటాని ఫెచ్ చేసి క్లైంట్‌కి పైప్ చేయడం
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Range': req.headers.range || 'bytes=0-'
      },
      validateStatus: (status) => status >= 200 && status < 403
    });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.pipe(res);
  } catch (error) {
    console.error('Download stream error:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Failed to download video stream.');
    }
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
