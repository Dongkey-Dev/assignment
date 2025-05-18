# Base Layer
FROM node:18-alpine AS base

ENV SERVER_APP=auth
ENV SERVER_PORT=3001
ENV NODE_ENV=dev

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Dependencies Layer
FROM base AS deps
RUN apk add g++ make py3-pip
RUN yarn install --frozen-lockfile

# Build Layer
FROM deps AS build

# Copy libs and app source
COPY libs ./libs
COPY apps/auth ./apps/auth

# Build the application
RUN yarn build auth

# Production Layer
FROM base AS prod
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/apps/auth/tsconfig.app.json ./dist/apps/auth/tsconfig.app.json
COPY --from=build /app/tsconfig.json ./dist/tsconfig.json

# Copy environment files if they exist
COPY .env* ./

EXPOSE $SERVER_PORT

CMD ["node", "dist/apps/auth/src/main.js"]
