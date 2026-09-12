export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Download URL is required');
  }

  try {
    // Vercel టైమ్‌అవుట్ మరియు స్లో డౌన్‌లోడ్ సమస్య రాకుండా నేరుగా Bilibili CDN లింక్‌కి రీడైరెక్ట్ చేస్తాం
    return res.redirect(302, url);
  } catch (error) {
    console.error('Redirect error:', error.message);
    return res.status(500).send('Failed to redirect to video stream.');
  }
}
