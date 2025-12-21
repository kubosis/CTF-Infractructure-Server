# --- Stage 1: Build the React Application ---
FROM node:22-slim AS builder

WORKDIR /project/app/frontend

ENV VITE_API_URL=""
ENV VITE_API_BASE_URL=""

# only npm files
COPY app/frontend/package.json app/frontend/package-lock.json* ./
RUN npm ci

# ONLY the content of frontend (not the catalogue)
COPY app/frontend/. .

RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

COPY --from=builder /project/app/frontend/dist /usr/share/nginx/html
COPY app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
