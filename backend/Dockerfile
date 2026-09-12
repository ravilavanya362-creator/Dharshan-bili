FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --break-system-packages --no-cache-dir yt-dlp

WORKDIR /app

COPY server.js /app/server.js

ENV NODE_ENV=production

EXPOSE 10000

CMD ["node", "server.js"]
