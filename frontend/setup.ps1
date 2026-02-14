Write-Host "Installing dependencies..." -ForegroundColor Green
& "C:\Program Files\nodejs\npm.cmd" "install"

Write-Host "`nStarting development server..." -ForegroundColor Green
& "C:\Program Files\nodejs\npm.cmd" "run" "dev"
