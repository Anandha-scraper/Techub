# Development Setup

## Quick Start

### Option 1: Use the clean start script (Recommended)
```bash
npm run dev:clean
```
This will automatically kill any processes on port 5000 and start the server.

### Option 2: Use the batch file (Windows)
```bash
start-dev.bat
```

### Option 3: Use the PowerShell script (Windows)
```powershell
.\start-dev.ps1
```

### Option 4: Manual start
```bash
npm run dev
```

## Port Conflict Resolution

The server now automatically handles port conflicts by:
1. Trying to start on port 5000
2. If port 5000 is busy, automatically trying port 5001, 5002, etc.
3. Displaying the actual port being used

## Troubleshooting

If you still encounter port conflicts:

1. **Kill all Node.js processes:**
   ```bash
   taskkill /f /im node.exe
   ```

2. **Kill processes on specific port:**
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

3. **Use a different port:**
   ```bash
   set PORT=3000 && npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:clean` - Kill port 5000 processes and start server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Preview production build

## Server Features

- **Automatic Port Detection**: Server automatically finds available port
- **MongoDB Connection**: Connects to MongoDB Atlas
- **Hot Reload**: Vite development server with hot module replacement
- **API Endpoints**: RESTful API for student management
- **PDF Export**: jsPDF integration for attendance reports
