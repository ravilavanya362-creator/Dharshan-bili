# Bilibili Video Downloader

A small Next.js (React + Node.js API routes) app that takes a bilibili.com
video link and returns a downloadable mp4.

## How it works

- `pages/index.js` — the React UI (paste a link, see the result).
- `pages/api/parse.js` — Node.js serverless function. Calls bilibili's
  public `view` and `playurl` endpoints to get the video's title, cover,
  and a direct stream URL (progressive mp4, no ffmpeg needed).
- `pages/api/download.js` — proxies that stream URL with the `Referer`
  header bilibili's CDN requires, so the browser can actually save it.

**Quality note:** without a logged-in bilibili session, the API caps
quality around 720p. Logged-in/1080p+ support would mean collecting a
`SESSDATA` cookie, which isn't included here by default.

## 1. Run it locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: bilibili downloader"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 3. Deploy to Vercel (free tier)

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New → Project**, then select your repo.
3. Framework preset: Vercel auto-detects **Next.js** — no config needed.
4. Click **Deploy**. You'll get a live URL like `your-app.vercel.app`.

Any time you push to `main`, Vercel redeploys automatically.

### A note on Vercel's free tier

Serverless functions on the Hobby plan have execution time limits
(10s by default, extendable to 60s). Short clips download fine; very
long videos may time out on `/api/download`. If that becomes an issue,
you have two options:
- Upgrade to Vercel Pro for longer function timeouts, or
- Have `/api/parse` return the raw stream URL only, and run the proxy
  step on a separate small Node server (e.g. Render, Railway, or a VPS)
  instead of as a Vercel function.

## Legal note

This tool is for personal, non-commercial use — downloading videos you
own or have explicit permission to save. Respect bilibili's Terms of
Service and the rights of the original content creators; don't use this
to redistribute copyrighted material.


## BiliSave downloader architecture

The Next.js app is intended to run as a Docker web service with `yt-dlp` and FFmpeg installed. `/api/parse` only returns JSON metadata; `/api/download` downloads the original Bilibili URL and streams the resulting MP4. This avoids treating an MP4 response as JSON and avoids Unicode `Content-Disposition` header errors.
