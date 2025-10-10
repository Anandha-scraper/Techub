@echo off
echo Starting Techub Development Server...
echo.

REM Kill any existing processes on port 5000
echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a on port 5000...
    taskkill /PID %%a /F >nul 2>&1
)

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

REM Start the development server
echo Starting development server...
npm run dev

pause
