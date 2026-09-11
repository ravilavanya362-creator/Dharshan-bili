import axios from 'axios';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 1. b23.tv short link ni full bilibili.com URL ki resolve cheyadam
    let targetUrl = url;
    if (url.includes('b23.tv')) {
      const redirectRes = await axios.get(url, {
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      targetUrl = redirectRes.request.res.responseUrl || url;
    }

    // 2. BV id extract cheyadam
    const bvidMatch = targetUrl.match(/BV[a-zA-Z0-9]+/);
    if (!bvidMatch) {
      return res.status(400).json({ error: 'Could not find BV ID from URL' });
    }
    const bvid = bvidMatch[0];

    // 3. Video basic info (cid, title, pic) kosam view API call
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (viewRes.data.code !== 0 || !viewRes.data.data) {
      return res.status(404).json({ error: 'Video details not found' });
    }

    const videoData = viewRes.data.data;
    const cid = videoData.cid;
    const title = videoData.title;
    const pic = videoData.pic;

    // 4. MP4 direct download link kosam playurl API (fnval=0 isthae single combined MP4 stream vasthundi)
    const playRes = await axios.get(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=0&fnver=0&fourk=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    let downloadUrl = '';
    if (playRes.data.code === 0 && playRes.data.data?.durl?.length > 0) {
      downloadUrl = playRes.data.data.durl[0].url;
    }

    return res.status(200).json({
      title,
      pic,
      bvid,
      downloadUrl,
      // streaming proxy link
      streamUrl: `/api/stream-download?url=${encodeURIComponent(downloadUrl)}`
    });

  } catch (error) {
    console.error('Parse error:', error.message);
    return res.status(500).json({ error: 'Could not fetch video details. The video may be private, deleted, or region-locked.' });
  }
}
