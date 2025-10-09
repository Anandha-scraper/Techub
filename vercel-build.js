import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Vercel build process...');

// 1. Build the frontend
console.log('Building frontend...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Ensure server files are copied to the right location for Vercel
console.log('Preparing server files for Vercel...');

const serverDir = path.join(__dirname, 'server');
const distServerDir = path.join(__dirname, 'dist', 'server');

// Create dist/server directory if it doesn't exist
if (!fs.existsSync(distServerDir)) {
  fs.mkdirSync(distServerDir, { recursive: true });
}

// Copy server files to dist/server
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(serverDir, distServerDir);

// 3. Copy shared files
const sharedDir = path.join(__dirname, 'shared');
const distSharedDir = path.join(__dirname, 'dist', 'shared');

if (fs.existsSync(sharedDir)) {
  copyDir(sharedDir, distSharedDir);
}

console.log('Vercel build completed successfully!');
