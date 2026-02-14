# PowerShell script to load environment variables and run the application

Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and fill in your credentials." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run: Copy-Item .env.example .env" -ForegroundColor Green
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    # Skip empty lines and comments
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''
        
        # Set environment variable for current process
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        Write-Host "Loaded: $key" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Cyan
Write-Host ""

# Run the application
mvn spring-boot:run

Read-Host "Press Enter to exit"
