import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

async function buildProduction() {
  try {
    console.log('🚀 Starting production build...');
    
    // Clean previous build
    console.log('🧹 Cleaning previous build...');
    try {
      await execAsync('rmdir /s /q dist 2>nul || rm -rf dist');
    } catch (error) {
      // Ignore errors if dist doesn't exist
    }
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    await execAsync('npm ci --only=production');
    
    // Build the application
    console.log('🔨 Building application...');
    await execAsync('npm run build');
    
    // Verify build
    if (fs.existsSync('dist/public/index.html')) {
      console.log('✅ Build completed successfully!');
      console.log('📁 Build output: dist/public/');
    } else {
      throw new Error('Build failed - index.html not found');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildProduction();
