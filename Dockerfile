FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV DATA_DIR=/data

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.mjs ./
COPY --from=build /app/dist ./dist

RUN mkdir -p /data

EXPOSE 80
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/api/health >/dev/null || exit 1

CMD ["node", "server.mjs"]
