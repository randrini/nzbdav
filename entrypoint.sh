#!/bin/sh

wait_either() {
    local pid1=$1
    local pid2=$2

    while true; do
        if ! kill -0 "$pid1" 2>/dev/null; then
            wait "$pid1"
            EXITED_PID=$pid1
            REMAINING_PID=$pid2
            return $?
        fi

        if ! kill -0 "$pid2" 2>/dev/null; then
            wait "$pid2"
            EXITED_PID=$pid2
            REMAINING_PID=$pid1
            return $?
        fi

        sleep 0.5
    done
}

# Use env vars or default to 1000
PUID=${PUID:-1000}
PGID=${PGID:-1000}

# Create group if it doesn't exist
if ! getent group appgroup >/dev/null; then
    addgroup -g "$PGID" appgroup
fi

# Create user if it doesn't exist
if ! id appuser >/dev/null 2>&1; then
    adduser -D -H -u "$PUID" -G appgroup appuser
fi

# Set environment variables
if [ -z "${BACKEND_URL}" ]; then
    export BACKEND_URL="http://localhost:8080"
fi

if [ -z "${FRONTEND_BACKEND_API_KEY}" ]; then
    export FRONTEND_BACKEND_API_KEY=$(head -c 32 /dev/urandom | hexdump -ve '1/1 "%.2x"')
fi

# Change permissions on /config directory to the given PUID and GUID
chown $PUID:$GUID /config

# Run backend as appuser in background
cd /app/backend
su-exec appuser ./NzbWebDAV &
BACKEND_PID=$!

# Wait for backend health check
echo "Waiting for backend to start."
MAX_RETRIES=30
RETRY_DELAY=1
i=0
while true; do
    echo "Checking backend health: $BACKEND_URL/health ..."
    if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "^200$"; then
        echo "Backend is healthy."
        break
    fi

    i=$((i+1))
    if [ "$i" -ge "$MAX_RETRIES" ]; then
        echo "Backend failed health check after $MAX_RETRIES retries. Exiting."
        kill $BACKEND_PID
        wait $BACKEND_PID
        exit 1
    fi

    sleep "$RETRY_DELAY"
done

# Run frontend as appuser in background
cd /app/frontend
su-exec appuser npm run start &
FRONTEND_PID=$!

# Wait for either to exit
wait_either $BACKEND_PID $FRONTEND_PID
EXIT_CODE=$?

# Determine which process exited
if [ "$EXITED_PID" -eq "$FRONTEND_PID" ]; then
    echo "The web-frontend has exited. Shutting down the web-backend..."
else
    echo "The web-backend has exited. Shutting down the web-frontend..."
fi

# Kill the remaining process
kill $REMAINING_PID

# Exit with the code of the process that died first
exit $EXIT_CODE