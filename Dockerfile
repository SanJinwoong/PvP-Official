FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

# Runtime environment variables (set these in Dokploy Environment Settings)
ENV VITE_SUPABASE_URL=""
ENV VITE_SUPABASE_ANON_KEY=""

EXPOSE 3000

CMD ["node", "build/index.js"]
