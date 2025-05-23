# Base Layer
FROM node:18-alpine AS base

ENV SERVER_APP=gateway
ENV SERVER_PORT=3002
ENV NODE_ENV=dev

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Dependencies Layer
FROM base as deps
RUN apk add g++ make py3-pip
RUN yarn install --frozen-lockfile

# Build Layer
FROM deps as build

# Copy libs and app source
COPY libs ./libs
COPY apps/gateway ./apps/gateway

# Build the application
RUN yarn build gateway

# Production Layer
FROM base as prod
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/apps/gateway/tsconfig.app.json ./dist/apps/gateway/tsconfig.app.json
COPY --from=build /app/tsconfig.json ./dist/tsconfig.json

# Copy environment files if they exist
COPY .env* ./

EXPOSE $SERVER_PORT

CMD ["node", "dist/apps/gateway/src/main.js"]
