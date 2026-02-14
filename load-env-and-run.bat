@echo off
echo Loading environment variables from .env file...
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and fill in your credentials.
    echo.
    echo Run: copy .env.example .env
    echo.
    pause
    exit /b 1
)

REM Load environment variables from .env file
for /f "usebackq tokens=*" %%a in (".env") do (
    REM Skip empty lines and comments
    echo %%a | findstr /r "^[^#]" >nul
    if not errorlevel 1 (
        set %%a
    )
)

echo Environment variables loaded successfully!
echo.
echo Starting Spring Boot application...
echo.

REM Run the application
mvn spring-boot:run

pause
