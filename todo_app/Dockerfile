FROM oven/bun:1.4-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN bun run build

FROM oven/bun:1.4-alpine

WORKDIR /app

# Bundled asset paths resolve relative to the working directory
COPY --from=build /app/dist ./

ENV NODE_ENV=production

USER bun

CMD ["bun", "server.js"]
