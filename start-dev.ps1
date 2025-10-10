Write-Host "Starting Techub Development Server..." -ForegroundColor Green
Write-Host ""

# Kill any existing processes on port 5000
Write-Host "Checking for existing processes on port 5000..." -ForegroundColor Yellow
$processes = netstat -ano | Select-String ":5000" | ForEach-Object {
    $parts = $_ -split '\s+'
    $pid = $parts[-1]
    if ($pid -match '^\d+$') {
        try {
            Write-Host "Killing process $pid on port 5000..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Could not kill process $pid" -ForegroundColor Red
        }
    }
}

# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
