# Builds the MiniDesk API into a container image.
# Build from the project root:
#   docker build -f backend/Dockerfile -t minidesk-api .

# Stage 1: compile TypeScript. This stage needs development tools.
FROM node:22-bookworm-slim AS build
WORKDIR /app/backend
# The temporary test database isn't needed in an image, so skip downloading it.
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 2: the image that actually runs. Only production packages and compiled code,
# so it's smaller and has less that could be attacked.
FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/backend/dist ./dist

# Run as an ordinary user rather than root, to limit the damage if the app were compromised.
USER node
EXPOSE 5000

# Lets Docker check that the server is really responding, not just running.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
