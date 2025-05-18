# Base Layer
FROM node:18-alpine AS base

ENV SERVER_APP=event
ENV SERVER_PORT=3003
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
COPY apps/event ./apps/event

# Build the application
RUN yarn build event

# Production Layer
FROM base as prod
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Copy environment files if they exist
COPY .env* ./

EXPOSE $SERVER_PORT

CMD ["node", "dist/apps/event/main.js"]
