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

# 2.5 Setup Shared Env and Configs
echo "Configuring Environment and Services..."
mkdir -p "$DEPLOY_ROOT/shared"
# Move the .env file uploaded by SCP to the shared location
if [ -f "$NEW_RELEASE_PATH/../backend/.env" ]; then
    mv "$NEW_RELEASE_PATH/../backend/.env" "$DEPLOY_ROOT/shared/backend.env"
elif [ -f "$NEW_RELEASE_PATH/.env" ]; then
    mv "$NEW_RELEASE_PATH/.env" "$DEPLOY_ROOT/shared/backend.env"
fi

# 3. Systemd Setup
echo "Configuring Systemd..."
# Check if service file exists in release
if [ -f "$NEW_RELEASE_PATH/deploy/weather-backend.service" ]; then
    sudo cp "$NEW_RELEASE_PATH/deploy/weather-backend.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable weather-backend
fi

# 4. Nginx Setup
echo "Configuring Nginx..."
if [ -f "$NEW_RELEASE_PATH/deploy/nginx-api.conf" ]; then
    sudo cp "$NEW_RELEASE_PATH/deploy/nginx-api.conf" /etc/nginx/sites-available/api.marwandev.com
    # Link only if not exists or force it? Force it to ensure it points to available.
    sudo ln -sf /etc/nginx/sites-available/api.marwandev.com /etc/nginx/sites-enabled/
    
    # Test Nginx before restart
    if sudo nginx -t; then
        sudo systemctl reload nginx
    else
        echo "WARNING: Nginx config check failed. Skipping reload."
    fi
fi

# 5. Restart the systemd service
echo "Restarting weather-backend service..."
sudo systemctl restart weather-backend

# 6. Optional: Clean up old releases (keep last 5)
echo "Cleaning up old releases..."
cd "$DEPLOY_ROOT/releases"
ls -dt * | tail -n +6 | xargs -r rm -rf

echo "Release successfully deployed."
