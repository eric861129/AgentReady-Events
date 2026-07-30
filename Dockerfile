FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ARG VCS_REF
ARG BUILD_DATE
ARG VERSION=1.0.0
LABEL org.opencontainers.image.title="AgentReady Events" \
      org.opencontainers.image.description="WebMCP Agent-ready events reference application" \
      org.opencontainers.image.source="https://github.com/eric861129/AgentReady-Events" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.created="$BUILD_DATE" \
      org.opencontainers.image.version="$VERSION"
WORKDIR /app
ENV NODE_ENV=production \
    APP_COMMIT=$VCS_REF \
    APP_BUILD_DATE=$BUILD_DATE \
    APP_VERSION=$VERSION
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-dist ./server-dist
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server-dist/server.js"]
