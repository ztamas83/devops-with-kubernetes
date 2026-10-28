FROM node:24-alpine

# pg_dump must be at least the server's major version (postgres:18-alpine)
RUN apk add --no-cache postgresql18-client

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.js ./

USER node

CMD ["node", "index.js"]
