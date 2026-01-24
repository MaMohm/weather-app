$ErrorActionPreference = "Stop"

# Configuration
$SERVER_USER = "ubuntu"
$SERVER_HOST = "api.marwandev.com"
$ROOT_DIR = Get-Location
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$ARTIFACT_DIR = Join-Path $ROOT_DIR "artifact_manual"
$TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
$REMOTE_TMP = "/tmp/weather-deploy-$TIMESTAMP"

Write-Host "🚀 Starting Manual Deployment to $SERVER_HOST..." -ForegroundColor Cyan
Write-Host "📂 Root Dir: $ROOT_DIR" -ForegroundColor Gray

# 1. Build Backend
Write-Host "📦 Building Backend in $BACKEND_DIR..." -ForegroundColor Yellow
if (!(Test-Path $BACKEND_DIR)) { throw "Backend directory not found at $BACKEND_DIR" }
Set-Location $BACKEND_DIR
npm ci
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# 2. Prepare Artifact
Write-Host "🗂 Preparing Artifacts in $ARTIFACT_DIR..." -ForegroundColor Yellow
if (Test-Path $ARTIFACT_DIR) { Remove-Item $ARTIFACT_DIR -Recurse -Force }
New-Item -ItemType Directory -Path $ARTIFACT_DIR | Out-Null
Copy-Item "package.json", "package-lock.json" -Destination $ARTIFACT_DIR
Copy-Item "dist" -Destination $ARTIFACT_DIR -Recurse

# 3. Create .env
Write-Host "📝 Creating temporary .env file..." -ForegroundColor Yellow
$EnvContent = "PORT=3002`nNODE_ENV=production"
Set-Content -Path (Join-Path $ARTIFACT_DIR ".env") -Value $EnvContent

# 4. Copy to Server (Using SCP)
Write-Host "📤 Uploading to Server (You may be prompted for password)..." -ForegroundColor Yellow
Set-Location $ROOT_DIR
# Copy artifact content
scp -r "$ARTIFACT_DIR\*" "$SERVER_USER@${SERVER_HOST}:$REMOTE_TMP"
# Copy release script
scp "deploy\release.sh" "$SERVER_USER@${SERVER_HOST}:$REMOTE_TMP/release.sh"
# Copy service and nginx
scp "deploy\weather-backend.service" "$SERVER_USER@${SERVER_HOST}:$REMOTE_TMP/"
scp "deploy\nginx-api.conf" "$SERVER_USER@${SERVER_HOST}:$REMOTE_TMP/"

# 5. Execute Release Script
Write-Host "🔧 Executing Release Script on Server..." -ForegroundColor Yellow
$RemoteScript = @"
    chmod +x $REMOTE_TMP/release.sh
    # Reconstruct expected structure for release script
    mkdir -p $REMOTE_TMP/deploy
    mv $REMOTE_TMP/release.sh $REMOTE_TMP/deploy/
    mv $REMOTE_TMP/weather-backend.service $REMOTE_TMP/deploy/
    mv $REMOTE_TMP/nginx-api.conf $REMOTE_TMP/deploy/
    
    # Run it
    $REMOTE_TMP/deploy/release.sh "/var/www/weather-backend/releases/$TIMESTAMP"
    
    # Cleanup
    rm -rf $REMOTE_TMP
"@

ssh "$SERVER_USER@$SERVER_HOST" $RemoteScript

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
