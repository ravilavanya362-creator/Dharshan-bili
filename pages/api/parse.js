import axios from 'axios';

export default async function handler(req, res) {
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    let targetUrl = url.trim();

    // 1. axios ద్వారా b23.tv షార్ట్ లింక్ ని రిసాల్వ్ చేయడం
    if (targetUrl.includes('b23.tv')) {
      try {
        const response = await axios.get(targetUrl, {
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
          }
        });
        targetUrl = response.request.res.responseUrl || response.config.url || targetUrl;
      } catch (err) {
        // ఒకవేళ axios హెడర్ ఇబ్బంది పెట్టినా ఒరిజినల్ లింక్ తో ట్రై చేస్తుంది
      }
    }

    // 2. BV ID ఎక్స్‌ట్రాక్ట్ చేయడం
    const bvidMatch = targetUrl.match(/BV[a-zA-Z0-9]+/i);
    if (!bvidMatch) {
      return res.status(400).json({ success: false, error: 'Could not find valid Bilibili ID from URL. Please use a direct video link.' });
    }
    const bvid = bvidMatch[0];

    // 3. Bilibili View API
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (!viewRes.data || viewRes.data.code !== 0 || !viewRes.data.data) {
      return res.status(404).json({ success: false, error: 'Video details not found. It may be private or deleted.' });
    }

    const { cid, title, pic: thumbnail } = viewRes.data.data;

    // 4. Play URL API (fnval=1 for single mp4 stream)
    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=1&fnver=0&fourk=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': `https://www.bilibili.com/video/${bvid}`
      }
    });

    let videoUrl = '';
    if (playRes.data && playRes.data.code === 0 && playRes.data.data?.durl?.length > 0) {
      videoUrl = playRes.data.data.durl[0].url;
    }

    if (!videoUrl) {
      return res.status(500).json({ success: false, error: 'Could not extract video stream URL.' });
    }

    return res.status(200).json({
      success: true,
      title,
      thumbnail,
      bvid,
      videoUrl
    });

  } catch (error) {
    console.error('Parse execution error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to process video. Please check the link and try again.' });
  }
}
