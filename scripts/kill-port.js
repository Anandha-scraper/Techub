import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPort5000() {
  try {
    console.log('🔍 Checking for processes on port 5000...');
    
    // Get processes using port 5000
    const { stdout } = await execAsync('netstat -ano | findstr :5000');
    
    if (!stdout.trim()) {
      console.log('✅ No processes found on port 5000');
      return;
    }
    
    // Extract PIDs from netstat output
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }
    
    if (pids.size === 0) {
      console.log('✅ No valid PIDs found on port 5000');
      return;
    }
    
    // Kill each process
    for (const pid of pids) {
      try {
        console.log(`🔪 Killing process ${pid}...`);
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Process ${pid} terminated`);
      } catch (error) {
        console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
      }
    }
    
    console.log('✅ Port 5000 is now free');
    
  } catch (error) {
    console.error('❌ Error checking port 5000:', error.message);
    process.exit(1);
  }
}

killPort5000();
