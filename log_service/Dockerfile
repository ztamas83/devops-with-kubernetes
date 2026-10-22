FROM oven/bun:1.4-alpine

WORKDIR /app

COPY package.json ./
COPY index.js ./

USER bun

CMD ["bun", "index.js"]
