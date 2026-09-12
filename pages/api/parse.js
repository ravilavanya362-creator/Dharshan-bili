import axios from 'axios';

export default async function handler(req, res) {
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    let targetUrl = url.trim();

    if (targetUrl.includes('b23.tv')) {
      const resp = await axios.get(targetUrl, { maxRedirects: 5 });
      targetUrl = resp.request?.res?.responseUrl || resp.config?.url || targetUrl;
    }

    const match = targetUrl.match(/(BV[a-zA-Z0-9]+)/i);
    if (!match) {
      return res.status(400).json({ success: false, error: 'BV ID not found in: ' + targetUrl });
    }
    const bvid = match[1];

    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    
    // అసలు Bilibili ఏమి రిటర్న్ చేస్తుందో ఇక్కడ క్లియర్ గా తెలుస్తుంది
    if (!viewRes.data || viewRes.data.code !== 0) {
      return res.status(500).json({ 
        success: false, 
        error: `Bilibili API Error: Code ${viewRes.data?.code} - ${viewRes.data?.message || 'Unknown'}` 
      });
    }

    const { cid, title, pic: thumbnail } = viewRes.data.data;

    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=1`);
    
    if (!playRes.data || playRes.data.code !== 0 || !playRes.data.data?.durl?.length) {
      return res.status(500).json({ 
        success: false, 
        error: `PlayURL API Error: Code ${playRes.data?.code} - ${playRes.data?.message || 'No stream found'}` 
      });
    }

    const videoUrl = playRes.data.data.durl[0].url;

    return res.status(200).json({
      success: true,
      title,
      thumbnail,
      bvid,
      videoUrl
    });

  } catch (error) {
    // అసలైన టెక్నికల్ ఎర్రర్ మెసేజ్ నేరుగా స్క్రీన్ మీదకి పంపిస్తాం
    return res.status(500).json({ 
      success: false, 
      error: 'CATCH ERROR: ' + (error.response?.data ? JSON.stringify(error.response.data) : error.message) 
    });
  }
}
