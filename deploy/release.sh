#!/bin/bash
set -e

# Arguments
# $1: The full path to the new release directory (e.g., /var/www/weather-backend/releases/20231010120000)

NEW_RELEASE_PATH="$1"
DEPLOY_ROOT="/var/www/weather-backend"
CURRENT_PATH="$DEPLOY_ROOT/current"

if [ -z "$NEW_RELEASE_PATH" ]; then
    echo "Error: No release path provided."
    exit 1
fi

echo "Starting release process for: $NEW_RELEASE_PATH"

# 1. Install production dependencies
cd "$NEW_RELEASE_PATH"
if [ -f "package.json" ]; then
    echo "Installing production dependencies..."
    npm ci --production --ignore-scripts
else
    echo "Warning: package.json not found, skipping npm install."
fi

# 2. Update symlink to point to the new release
echo "Updating 'current' symlink..."
ln -sfn "$NEW_RELEASE_PATH" "$CURRENT_PATH"

# 3. Restart the systemd service
echo "Restarting weather-backend service..."
sudo systemctl restart weather-backend

# 4. Optional: Clean up old releases (keep last 5)
echo "Cleaning up old releases..."
cd "$DEPLOY_ROOT/releases"
ls -dt * | tail -n +6 | xargs -r rm -rf

echo "Release successfully deployed."
