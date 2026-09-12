import axios from 'axios';

export default async function handler(req, res) {
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    let targetUrl = url.trim();

    // 1. b23.tv షార్ట్ లింక్‌ని పర్ఫెక్ట్ గా రిసాల్వ్ చేయడానికి Native Fetch వాడుతున్నాం
    if (targetUrl.includes('b23.tv')) {
      try {
        const redirectResponse = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow', // ఇది ఆటోమేటిక్‌గా ఫుల్ లింక్ కి తీసుకెళ్తుంది
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        targetUrl = redirectResponse.url; // ఇక్కడ మనకు ఫుల్ URL (BV ID తో సహా) వస్తుంది
      } catch (err) {
        console.error('Redirect resolve error:', err);
      }
    }

    // 2. ఫుల్ URL నుంచి BV ID ని ఎక్స్‌ట్రాక్ట్ చేయడం
    const bvidMatch = targetUrl.match(/BV[a-zA-Z0-9]+/i);
    if (!bvidMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not find valid Bilibili ID from URL' 
      });
    }
    const bvid = bvidMatch[0];

    // 3. Bilibili View API (వీడియో డీటెయిల్స్ కోసం)
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (!viewRes.data || viewRes.data.code !== 0 || !viewRes.data.data) {
      return res.status(404).json({ success: false, error: 'Video details not found or private.' });
    }

    const { cid, title, pic: thumbnail } = viewRes.data.data;

    // 4. Play URL (వీడియో డౌన్‌లోడ్ లింక్ కోసం)
    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=1&fnver=0&fourk=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com'
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
