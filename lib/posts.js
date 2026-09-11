// lib/posts.js
// Simple in-file blog content. Each entry is an original, short article.
// `emoji` + `gradient` drive the card thumbnail (no external images needed).

const posts = [
  {
    slug: "how-to-download-bilibili-videos-hd-complete-guide",
    title: "How to Download Bilibili Videos in HD: The Complete 2026 Guide",
    date: "2026-08-28",
    emoji: "📥",
    category: "Most Popular Guide",
    tagline: "Formats, quality, and safe sources",
    gradient: "linear-gradient(135deg, #1a0b2e 0%, #ff2a6d 55%, #ff5e3a 100%)",
    readTime: "7 min read",
    featured: true,
    keywords: [
      "download bilibili videos",
      "bilibili video downloader",
      "bilibili mp4 download",
      "save bilibili videos to phone",
      "bilibili downloader no watermark",
    ],
    excerpt:
      "A complete, step-by-step walkthrough for saving Bilibili videos in HD on any device — plus quality tips, common errors, and safety notes.",
    content: `
Bilibili has grown into one of the largest video communities in Asia, and plenty of
viewers outside China watch it too — for anime, gaming clips, music performances,
and commentary you simply won't find anywhere else. The catch is that Bilibili
doesn't offer an official "save for offline" button on the web, so if you want a
video available without an internet connection, you need a dedicated downloader.
This guide walks through the whole process end to end.

## Why people download Bilibili videos

The most common reason is simply patchy connectivity — mobile data on a commute,
airplane wifi, or a slow connection abroad all make streaming unreliable. Beyond
that, some viewers want a personal backup of a video before it's taken down or
region-locked, or want to watch content in an app that doesn't support in-browser
Bilibili playback. Whatever the reason, the process below is the same.

## Step-by-step: how to download a Bilibili video

### Step 1 — Copy the video link
Open the video on the Bilibili app or bilibili.com, tap the share icon, and choose
Copy Link. You can also just copy the URL straight out of your browser's address
bar — either a full bilibili.com/video/... link or a shortened b23.tv link works.

### Step 2 — Paste it into the downloader
Come back to this page, tap the input box at the top, and paste the link. If you
copied it just a moment ago, the Paste button will grab it automatically.

### Step 3 — Fetch the video details
Tap Download Video (MP4). The tool reads the video's title, cover image, and an
available stream URL directly from Bilibili's own public endpoints — the same data
your browser already loads to play the video normally.

### Step 4 — Save the MP4 file
Once the preview card appears, tap Save MP4 File. Your browser will download the
file to your usual downloads folder or camera roll, ready to watch offline.

## Getting the best possible quality

Bilibili adjusts the resolution it serves based on whether you're logged in and
what plan your account has. Without a logged-in session, most public streams top
out in the 480p–720p range, which is what a simple link-paste downloader can
retrieve. If a video looks softer than expected:

- Try the original, non-shortened bilibili.com/video/ link rather than a b23.tv
  redirect — it occasionally preserves slightly better metadata.
- Confirm the source video itself was uploaded in HD. A downloader can't add detail
  that was never in the original upload.
- For long videos, remember file size scales with both resolution and length — a
  20-minute 1080p video can easily be several times larger than the same clip at
  480p.

## Desktop vs. mobile: does it matter?

Not really. Because everything runs through the browser, the same paste-and-download
flow works identically on a laptop, an Android phone, or an iPhone — there's nothing
to install either way. The only practical difference is where the finished file
lands: desktop browsers typically save to a Downloads folder, while phones usually
save straight into your gallery or a Files app.

## Common errors and how to fix them

**"Failed to fetch video details."** This almost always means the link was copied
incorrectly, the video is private or region-restricted, or it's been removed. Double
check the link opens normally in a separate tab first.

**The download starts but the file won't play.** This usually points to an
interrupted download rather than a bad video — try again on a stable connection,
and avoid switching apps mid-download on mobile.

**Video plays but has no sound, or vice versa.** Some higher-quality Bilibili streams
split video and audio into separate tracks (a delivery method called DASH). A
downloader built around simple progressive links will sometimes need to fall back
to a lower quality tier that keeps both tracks together in one file.

## A quick word on doing this responsibly

Downloading a personal copy for offline viewing is very different from
re-uploading someone else's video elsewhere. Stick to content you have the rights
to, or that you're using for personal, non-commercial viewing, and never
redistribute a saved file as your own work. See our full [downloading responsibly
guide](/blog/downloading-responsibly-a-quick-guide) for more detail.

## Frequently asked questions

**Is this free to use?** Yes — there's no account, no subscription, and no limit on
how many links you can paste.

**Do I need to install an app?** No. Everything happens in the browser tab you're
already using.

**Will this work with b23.tv short links?** Yes, both full bilibili.com links and
shortened b23.tv links are supported.

**Can I download an entire series at once?** Not currently — paste one video link
at a time and repeat for each episode.
## More Bilibili Download Guides

You may also find these Bili Save guides useful:

- [How Video Quality Options Actually Work on Streaming Sites](/blog/how-video-quality-works-on-streaming-sites)
- [Progressive vs. DASH: Why Some Downloads Need Extra Steps](/blog/progressive-vs-dash-video-formats)
- [Downloading Videos Responsibly: A Quick Guide](/blog/downloading-responsibly-a-quick-guide)
- [Bilibili to MP3: How to Save Audio from Any Bilibili Video](/blog/bilibili-to-mp3-download-audio-guide)
    `,
  },
  {
    slug: "how-video-quality-works-on-streaming-sites",
    title: "How Video Quality Options Actually Work on Streaming Sites",
    date: "2026-07-02",
    emoji: "🎞️",
    category: "Quality Guide",
    tagline: "Resolution, bitrate, and bandwidth",
    readTime: "5 min read",
    gradient: "linear-gradient(135deg, #0d0b2e 0%, #7c5cfc 55%, #3e7bfa 100%)",
    excerpt:
      "A plain-language look at resolution, bitrate, and why 'HD' doesn't always mean what you think it means.",
    content: `
When a streaming site offers you a choice between 360p, 720p, or 1080p, it's really
offering a trade-off between three things: how sharp the picture looks, how big the
file is, and how much bandwidth is needed to play it smoothly.

Resolution (the "p" number) describes how many horizontal lines of pixels make up
the video frame. More lines generally means a sharper picture on a large screen, but
it isn't the whole story — bitrate matters just as much. Bitrate is how much data is
used per second of video. A 1080p video encoded at a low bitrate can actually look
worse than a well-encoded 720p video, because there isn't enough data to represent
fine detail and motion without visible blocky artifacts.

Most platforms automatically pick a quality level based on your current connection
speed, then let you override it manually. If you've ever noticed a video looking
blurry for the first few seconds before sharpening up, that's the player detecting
your bandwidth and stepping up the quality in real time — a technique called
adaptive bitrate streaming.

For downloads rather than live streaming, the calculation changes: you're trading
storage space for quality, since the whole file needs to live on your device rather
than trickle in as needed. A short clip in 1080p might be perfectly reasonable, while
a two-hour video at the same setting could easily run past a gigabyte.
## More Bilibili Download Guides

If you're downloading Bilibili videos, these related Bili Save guides may help:

- [How to Download Bilibili Videos in HD: The Complete 2026 Guide](/blog/how-to-download-bilibili-videos-hd-complete-guide)
- [Progressive vs. DASH: Why Some Downloads Need Extra Steps](/blog/progressive-vs-dash-video-formats)
- [Bilibili to MP3: How to Save Audio from Any Bilibili Video](/blog/bilibili-to-mp3-download-audio-guide)
    `,
  },
  {
    slug: "progressive-vs-dash-video-formats",
    title: "Progressive vs. DASH: Why Some Downloads Need Extra Steps",
    date: "2026-07-18",
    emoji: "🎬",
    category: "Formats Explained",
    tagline: "Two delivery methods, one clean file",
    readTime: "6 min read",
    gradient: "linear-gradient(135deg, #071b2e 0%, #3e7bfa 55%, #22c1a4 100%)",
    excerpt:
      "Ever wonder why some video downloads give you one file and others give you separate video and audio? Here's the difference.",
    content: `
Not all video delivery works the same way under the hood. Two common approaches are
progressive download and DASH (Dynamic Adaptive Streaming over HTTP), and the
difference explains a lot about why some downloader tools are simpler than others.

A progressive file is exactly what it sounds like: one file containing both video
and audio tracks muxed together, playable and downloadable as a single unit — much
like an older-style mp4 you'd save directly to a hard drive. It's simple to work
with, but it doesn't adapt well to changing network conditions and typically caps
out at more modest quality levels.

DASH splits things up. The video track and the audio track are stored and served as
separate streams, often further broken into small time-sliced chunks at multiple
quality levels. This is what lets a modern player switch resolution mid-playback
without a rebuffer, and it's how most high-quality streaming (1080p and above) is
delivered today.

The catch: if you want to save a DASH-delivered video as one normal mp4 file, the
video and audio streams need to be downloaded separately and then muxed (combined)
back together, usually with a tool like ffmpeg. That's an extra processing step
progressive downloads don't need — which is why many lightweight downloader tools
intentionally request the progressive version of a video when a site offers one,
trading a bit of maximum quality for a much simpler, faster download.
## More Bilibili Download Guides

For more practical Bilibili downloading tips, see these guides:

- [How to Download Bilibili Videos in HD: The Complete 2026 Guide](/blog/how-to-download-bilibili-videos-hd-complete-guide)
- [How Video Quality Options Actually Work on Streaming Sites](/blog/how-video-quality-works-on-streaming-sites)
- [Bilibili to MP3: How to Save Audio from Any Bilibili Video](/blog/bilibili-to-mp3-download-audio-guide)
    `,
  },
  {
    slug: "downloading-responsibly-a-quick-guide",
    title: "Downloading Videos Responsibly: A Quick Guide",
    date: "2026-08-05",
    emoji: "🛡️",
    category: "Safety & Ethics",
    tagline: "Know the do's and don'ts",
    readTime: "4 min read",
    gradient: "linear-gradient(135deg, #2e1b05 0%, #f5a524 55%, #fc5c8c 100%)",
    excerpt:
      "Saving a video for offline viewing is convenient — here's how to think about doing it the right way.",
    content: `
Offline video is genuinely useful: spotty train wifi, long flights, or just wanting
a local backup of something you don't want to lose are all legitimate reasons to
save a copy of a video you've watched online. But "you can" and "you should" aren't
always the same question, so it's worth a quick gut-check before hitting download.

The simplest rule of thumb: only save videos you made yourself, videos explicitly
marked as free to download by their creator, or videos you otherwise have clear
permission to keep a copy of. Most platforms' terms of service draw a hard line
between watching a video through their player and keeping a standalone copy of it —
even when the technical option to download exists somewhere.

A few practical habits help:
- Check for a creator's own download or "save offline" feature first — many
  platforms build this in for exactly the use case you have in mind.
- If you're downloading for research, archiving, or criticism, keep in mind that
  fair use / fair dealing exceptions are narrow and vary by country — they're not
  a blanket permission slip.
- Never redistribute a downloaded video as your own or re-upload it elsewhere.
  Saving a personal copy and republishing it are very different things legally.
- When in doubt, ask the creator. Most are happy to grant permission for
  reasonable personal use if you simply ask.

None of this is legal advice — just a sensible starting point for treating other
people's work the way you'd want your own treated.
## More Bilibili Download Guides

For more Bilibili video tips and tutorials, check these related guides:

- [How to Download Bilibili Videos in HD: The Complete 2026 Guide](/blog/how-to-download-bilibili-videos-hd-complete-guide)
- [How Video Quality Options Actually Work on Streaming Sites](/blog/how-video-quality-works-on-streaming-sites)
- [Progressive vs. DASH: Why Some Downloads Need Extra Steps](/blog/progressive-vs-dash-video-formats)
- [Bilibili to MP3: How to Save Audio from Any Bilibili Video](/blog/bilibili-to-mp3-download-audio-guide)
    `,
  },
  {
    slug: "bilibili-to-mp3-download-audio-guide",
    title: "Bilibili to MP3: How to Save Audio from Any Bilibili Video (2026)",
    date: "2026-09-01",
    emoji: "🎧",
    category: "Audio Guide",
    tagline: "Extract the audio track cleanly",
    gradient: "linear-gradient(135deg, #1a0b3e 0%, #d946ef 55%, #f472b6 100%)",
    readTime: "6 min read",
    featured: true,
    keywords: [
      "bilibili to mp3",
      "bilibili mp3 download",
      "bilibili audio download",
      "extract audio from bilibili video",
      "download bilibili music",
      "bilibili mp3 converter",
    ],
    excerpt:
      "Want just the audio from a Bilibili video — a song, a podcast-style stream, a lecture? Here's how the video-to-MP3 process actually works, and how to do it without losing quality.",
    content: `
A lot of what gets uploaded to Bilibili is really audio content wearing a video
wrapper — full song uploads with a static cover image, live performance
recordings, ASMR streams, lecture recordings, and podcast-style talk shows. If
what you actually want is the sound and not the picture, converting to MP3
saves storage space and makes the file easy to drop into any music app or
playlist.

## How a video-to-MP3 conversion actually works

Every video file already contains a separate audio track alongside the video
track — that's true whether the source is progressive or DASH-delivered (see
our [progressive vs. DASH explainer](/blog/progressive-vs-dash-video-formats)
for the difference). Converting "to MP3" doesn't create new audio out of
nothing; it simply extracts that existing audio track and re-encodes it into
the widely-supported MP3 format, then discards the video frames entirely. This
is why an MP3 pulled from a video is never higher quality than the audio that
was already baked into the original upload.

## Step-by-step: getting an MP3 from a Bilibili link

### Step 1 — Grab the video link
Copy the full bilibili.com/video/... URL or a shortened b23.tv link, the same
way you would for a normal video download.

### Step 2 — Download the source video first
Paste the link into the downloader and save the MP4 as usual. Even if you only
want the audio, you need the underlying video file as a starting point, since
that's where the audio track lives.

### Step 3 — Extract and convert the audio
Run the saved MP4 through an audio extractor or converter tool to pull out the
audio track and save it as a standalone .mp3 file. Desktop tools like ffmpeg,
or lightweight browser-based MP4-to-MP3 converters, both handle this in a
single step.

### Step 4 — Check the tags and trim if needed
Once you have the MP3, most converters let you edit the title, artist, and
album tags before saving — worth doing if you're adding it to a personal music
library. If the upload has extra talking or an intro before the song starts,
this is also the point to trim the file down to just the part you want.

## Why the result sounds the way it does

MP3 quality after conversion depends on two separate ceilings: the bitrate of
the audio track inside the original Bilibili upload, and the bitrate you
choose for the MP3 encode itself. Converting a low-bitrate source at a high
MP3 setting doesn't add detail back in — it just makes a bigger file with the
same limitations. For music specifically, look for uploads explicitly labeled
as official audio or a studio release rather than a phone recording of a live
show; the source quality difference is usually obvious once you compare.

## Common issues when converting to MP3

**The exported file has no sound.** This almost always means the video itself
downloaded incompletely. Re-download the source MP4 and confirm it plays with
sound before converting.

**Audio and video are out of sync in the source file.** DASH-delivered videos
occasionally have this issue if the video and audio streams were muxed
incorrectly. Since MP3 conversion only cares about the audio track, sync
issues in the picture won't carry over to the extracted MP3.

**The MP3 sounds noticeably worse than expected.** Check the bitrate setting
used during conversion — anything below 128kbps will sound thin for music.
192kbps or 320kbps preserves noticeably more detail for the same source
material.

## A note on what's appropriate to convert

The same rule from our [downloading responsibly
guide](/blog/downloading-responsibly-a-quick-guide) applies here, and arguably
matters more for music: converting a copyrighted commercial song upload to MP3
for personal offline listening is a different situation than redistributing
that file to other people. Stick to personal use, and favor content that's
explicitly free to download or that you created yourself.

## Frequently asked questions

**Do I need special software to convert to MP3?** No — a browser-based
video-to-MP3 tool or a free desktop converter is enough for a single file.

**Will the MP3 be higher quality than streaming the video?** No. Converting
never adds quality beyond what was already present in the original audio
track.

**Can I convert a whole playlist at once?** Not with a simple link-paste
workflow — convert one video at a time.

**Does converting to MP3 remove the video permanently?** No, the original MP4
file stays exactly as it was; conversion creates a new, separate audio file
alongside it.
## More Bilibili Download Guides

Explore these related Bili Save guides:

- [How to Download Bilibili Videos in HD: The Complete 2026 Guide](/blog/how-to-download-bilibili-videos-hd-complete-guide)
- [How Video Quality Options Actually Work on Streaming Sites](/blog/how-video-quality-works-on-streaming-sites)
- [Progressive vs. DASH: Why Some Downloads Need Extra Steps](/blog/progressive-vs-dash-video-formats)
- [Downloading Videos Responsibly: A Quick Guide](/blog/downloading-responsibly-a-quick-guide)
    `,
  },
];

export function getAllPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

export default posts;

