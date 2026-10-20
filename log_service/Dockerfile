FROM node:24-alpine

WORKDIR /app

COPY package.json ./
COPY index.js ./

USER node

CMD ["node", "index.js"]
