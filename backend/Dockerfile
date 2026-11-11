# Builds the MiniDesk API into a container image.
# Build from the project root:
#   docker build -f backend/Dockerfile -t minidesk-api .

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/backend

# Only production packages, so the image is smaller and has less that could be attacked.
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend/src ./src

# Run as an ordinary user rather than root, to limit the damage if the app were compromised.
USER node
EXPOSE 5000

# Lets Docker check that the server is really responding, not just running.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
