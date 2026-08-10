# Build stage
FROM node:26.7-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /workspace

# Copy root-level files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy app package.json and source
COPY app/ ./app/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN pnpm run -C app build

# Runtime stage: only the built bundle is required
FROM node:26.7-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /workspace/app/build ./build

# Set environment variable with default
ENV NODE_ENV=production
ENV PUBLIC_POCKETBASE_URL=http://localhost:8090

# Expose port (adjust if needed)
EXPOSE 3000

# Run the application
CMD ["node", "build/index.js"]
