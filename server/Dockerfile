FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src
COPY templates ./templates

RUN npm run build && npm prune --omit=dev && npm cache clean --force

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
