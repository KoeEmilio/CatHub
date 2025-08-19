FROM node:22.16.0-alpine3.22 AS base

# All deps stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npm run build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY ace.js ace.js
COPY package.json package.json
COPY .env.prod .env
EXPOSE 3333
CMD ["node", "ace.js", "serve", "--hmr"]