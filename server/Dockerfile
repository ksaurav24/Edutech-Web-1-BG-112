FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY templates ./templates

RUN npm run build && npm prune --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["node", "dist/server.js"]
