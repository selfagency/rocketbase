#!/bin/bash

# Start docker-compose services
echo "Starting docker-compose services..."

# Set timeout for all health checks
timeout=60

# fail silently
docker-compose -f ../docker-compose.dev.yml down >/dev/null 2>&1 || true
docker-compose -f ../docker-compose.test.yml up -d --build

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

# Configure PocketBase settings (SMTP -> mailpit, app meta, etc.)
echo "Configuring PocketBase settings..."
PB_TOKEN=$(curl -sf http://localhost:8090/api/collections/_superusers/auth-with-password \
  -X POST -H "Content-Type: application/json" \
  -d '{"identity":"admin@example.com","password":"test1234567890"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

if [ -n "$PB_TOKEN" ]; then
  curl -sf http://localhost:8090/api/settings -X PATCH \
    -H "Authorization: Bearer $PB_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "smtp": {"enabled":true,"port":1025,"host":"mailpit","username":"","authMethod":"PLAIN","tls":false,"localName":""},
      "meta": {"appName":"RocketBase","appURL":"http://localhost:3000","senderName":"RocketBase","senderAddress":"no-reply@rocketbase.local","hideControls":false},
      "rateLimits": {"enabled":false},
      "batch": {"enabled":true,"maxRequests":50,"timeout":3,"maxBodySize":0},
      "logs": {"maxDays":5,"minLevel":0,"logIP":true,"logAuthId":false}
    }' > /dev/null && echo "PocketBase settings configured." || echo "Warning: Failed to configure PocketBase settings"
else
  echo "Warning: Could not authenticate with PocketBase superuser"
fi

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
