FROM node:22-alpine AS deps

WORKDIR /app

COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm install -g pnpm
RUN pnpm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]


# 食用方法
# docker build -t xiwuio .
# docker run --rm --name xio -p 3000:3000 xiwuio
# docker run -itd --rm --name xio -p 3000:3000 xiwuio
# docker run -itd --name xio -p 3000:3000 xiwuio
