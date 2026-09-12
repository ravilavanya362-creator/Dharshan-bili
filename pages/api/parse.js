import axios from 'axios';

export default async function handler(req, res) {
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    let targetUrl = url.trim();

    // ఒకవేళ షార్ట్ లింక్ ఇస్తే గనుక బ్రౌజర్-లైక్ మొబైల్ యూజర్ ఏజెంట్ తో హెడర్స్ పంపిస్తాం
    if (targetUrl.includes('b23.tv')) {
      try {
        const resp = await axios.get(targetUrl, {
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.55 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 400; // 모든 redirect లను అనుమతించు
          }
        });
        
        targetUrl = resp.request?.res?.responseUrl || resp.config?.url || targetUrl;
      } catch (e) {
        // ఒకవేళ axios గనుక ఆపితే, యూజర్ నేరుగా ఫుల్ లింక్ లేదా వేరే పద్ధతి వాడేలా ఛాన్స్ ఇస్తాం
      }
    }

    // URL నుండి BV ID ని వెతకడం (ఇది షార్ట్ లింక్ అయినా లేదా ఫుల్ లింక్ అయినా పట్టుకుంటుంది)
    let bvid = '';
    const match = targetUrl.match(/(BV[a-zA-Z0-9]+)/i);
    if (match) {
      bvid = match[1];
    }

    // ఒకవేళ BV ID దొరకపోతే, యూజర్ కి క్లియర్ గా ఒరిజినల్ లింక్ ఇవ్వమని చెబుతాం
    if (!bvid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please copy and paste the full Bilibili video link from the address bar instead of short link.' 
      });
    }

    // Bilibili View API
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (!viewRes.data || viewRes.data.code !== 0 || !viewRes.data.data) {
      return res.status(404).json({ success: false, error: 'Video not found or is private/restricted.' });
    }

    const { cid, title, pic: thumbnail } = viewRes.data.data;

    // Play URL API
    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=1&fnver=0&fourk=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://www.bilibili.com/video/${bvid}`
      }
    });

    let videoUrl = '';
    if (playRes.data && playRes.data.code === 0 && playRes.data.data?.durl?.length > 0) {
      videoUrl = playRes.data.data.durl[0].url;
    }

    if (!videoUrl) {
      return res.status(500).json({ success: false, error: 'Could not extract downloadable stream for this video.' });
    }

    return res.status(200).json({
      success: true,
      title,
      thumbnail,
      bvid,
      videoUrl
    });

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to process video. Please try again later.' });
  }
}
