# Builds the MiniDesk frontend and serves it with nginx.
# Build from the project root:
#   docker build -f frontend/Dockerfile --build-arg VITE_API_URL=https://your-api.example.com/api -t minidesk-web .

# Stage 1: build the static files.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Vite builds this address into the JavaScript, so it must be set when building, not when running.
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: a small web server with just the built files. No Node.js needed.
FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
