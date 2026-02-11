#!/bin/bash

# Start docker-compose services
echo "Starting docker-compose services..."

# Set timeout for all health checks
timeout=60

# fail silently
docker-compose -f ../docker-compose.dev.yml down >/dev/null 2>&1 || true
docker-compose -f ../docker-compose.test.yml up -d

# Wait for Mailpit to be ready
echo "Waiting for Mailpit to be ready..."
counter=0
while ! curl -f http://localhost:8025 >/dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo "Timeout waiting for Mailpit"
    exit 1
  fi
  counter=$((counter + 1))
  sleep 1
done

# Wait for PocketBase to be ready
echo "Waiting for PocketBase to be ready..."
counter=0
while ! curl -f http://localhost:8090/api/health >/dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo "Timeout waiting for PocketBase"
    exit 1
  fi
  counter=$((counter + 1))
  sleep 1
done

# Wait for app to be ready
echo "Waiting for app to be ready..."
counter=0
while ! curl -f http://localhost:3000 >/dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo "Timeout waiting for app"
    exit 1
  fi
  counter=$((counter + 1))
  sleep 1
done

echo "All services are ready!"

# Keep the script running to satisfy Playwright's webServer
while true; do
  sleep 1
  # Check if services are still running
  if ! docker-compose -f ../docker-compose.test.yml ps | grep -q "Up"; then
    echo "Services stopped, exiting..."
    exit 1
  fi
done
