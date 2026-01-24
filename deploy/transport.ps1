$ErrorActionPreference = "Stop"
$SERVER = "ubuntu@api.marwandev.com"
$TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
$REMOTE_TMP = "/tmp/weather-deploy-$TIMESTAMP"

Write-Host "Creating remote tmp dir..."
ssh $SERVER "mkdir -p $REMOTE_TMP"

Write-Host "Uploading artifacts..."
scp -r "artifact_manual\*" "${SERVER}:${REMOTE_TMP}"
scp "deploy\release.sh" "${SERVER}:${REMOTE_TMP}/release.sh"
scp "deploy\weather-backend.service" "${SERVER}:${REMOTE_TMP}/"
scp "deploy\nginx-api.conf" "${SERVER}:${REMOTE_TMP}/"

Write-Host "Triggering release..."
$SCRIPT = @"
chmod +x $REMOTE_TMP/release.sh
mkdir -p $REMOTE_TMP/deploy
mv $REMOTE_TMP/release.sh $REMOTE_TMP/deploy/
mv $REMOTE_TMP/weather-backend.service $REMOTE_TMP/deploy/
mv $REMOTE_TMP/nginx-api.conf $REMOTE_TMP/deploy/
$REMOTE_TMP/deploy/release.sh "/var/www/weather-backend/releases/$TIMESTAMP"
rm -rf $REMOTE_TMP
"@

$SCRIPT | ssh $SERVER "bash -s"

Write-Host "Done!"
