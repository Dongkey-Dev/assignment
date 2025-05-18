FROM node:18-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Copy libs
COPY libs ./libs

# Copy auth app
COPY apps/auth ./apps/auth

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the application
RUN yarn build auth

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/auth/main.js"]
