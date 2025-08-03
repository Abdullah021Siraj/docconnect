FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Build the application
FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate && \
    npm run build

# Run the application
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env ./.env

EXPOSE 3000

ENV PORT=3000
ENV AUTH_TRUST_HOST=true

CMD ["node", "server.js"]