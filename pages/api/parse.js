import axios from 'axios';

export default async function handler(req, res) {
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    let targetUrl = url.trim();

    // 1. b23.tv short link ni handle cheyadam
    if (targetUrl.includes('b23.tv')) {
      try {
        const redirectRes = await axios.get(targetUrl, {
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 403,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com'
          }
        });
        targetUrl = redirectRes.request?.res?.responseUrl || redirectRes.config?.url || targetUrl;
      } catch (err) {
        // Redirect fail ayina original URL vadukovachu
      }
    }

    // 2. BV id extract cheyadam
    const bvidMatch = targetUrl.match(/BV[a-zA-Z0-9]+/);
    if (!bvidMatch) {
      return res.status(400).json({ success: false, error: 'Could not find valid Bilibili ID from URL' });
    }
    const bvid = bvidMatch[0];

    // 3. Bilibili View API call with proper headers
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Cookie': 'buvid3=infoc'
      }
    });

    if (!viewRes.data || viewRes.data.code !== 0 || !viewRes.data.data) {
      return res.status(404).json({ success: false, error: 'Video details not found or video is private/deleted.' });
    }

    const videoData = viewRes.data.data;
    const cid = videoData.cid;
    const title = videoData.title;
    const thumbnail = videoData.pic;

    // 4. Playurl API call for direct MP4 stream
    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=0&fnver=0&fourk=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Cookie': 'buvid3=infoc'
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
    return res.status(500).json({ success: false, error: 'Failed to process video. Please try again.' });
  }
}
