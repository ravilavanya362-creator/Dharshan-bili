import axios from 'axios';

export default async function handler(req, res) {
  // POST లేదా GET ఏ పద్ధతిలో రిక్వెస్ట్ వచ్చినా హ్యాండ్ చేయడానికి
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    // 1. b23.tv short link ని ఫుల్ URL కి రిసాల్వ్ చేయడం
    let targetUrl = url.trim();
    if (targetUrl.includes('b23.tv')) {
      const redirectRes = await axios.get(targetUrl, {
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      targetUrl = redirectRes.request.res.responseUrl || targetUrl;
    }

    // 2. BV ID ఎక్స్‌ట్రాక్ట్ చేయడం
    const bvidMatch = targetUrl.match(/BV[a-zA-Z0-9]+/);
    if (!bvidMatch) {
      return res.status(400).json({ success: false, error: 'Could not find BV ID from URL' });
    }
    const bvid = bvidMatch[0];

    // 3. Bilibili View API ద్వారా వీడియో టైటిల్, తంబ్‌నెయిల్, cid తీసుకోవడం
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (viewRes.data.code !== 0 || !viewRes.data.data) {
      return res.status(404).json({ success: false, error: 'Video details not found' });
    }

    const videoData = viewRes.data.data;
    const cid = videoData.cid;
    const title = videoData.title;
    const thumbnail = videoData.pic;

    // 4. ప్లేయిల్ API ద్వారా డైరెక్ట్ డౌన్‌లోడ్ లింక్ తీసుకోవడం (fnval=0 అంటే సింగిల్ MP4 ఫార్మాట్)
    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=0&fnver=0&fourk=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    let videoUrl = '';
    if (playRes.data.code === 0 && playRes.data.data?.durl?.length > 0) {
      videoUrl = playRes.data.data.durl[0].url;
    }

    if (!videoUrl) {
      return res.status(500).json({ success: false, error: 'No downloadable video stream found.' });
    }

    return res.status(200).json({
      success: true,
      title,
      thumbnail,
      bvid,
      videoUrl
    });

  } catch (error) {
    console.error('Parse error:', error.message);
    return res.status(500).json({ success: false, error: 'Could not fetch video details. The video may be private or region-locked.' });
  }
}

