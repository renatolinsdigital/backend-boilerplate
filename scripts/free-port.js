const { exec } = require('child_process');
const port = process.argv[2] || 3000;

console.log(`Attempting to free port ${port}...`);

const isWindows = process.platform === 'win32';

if (isWindows) {
  // Windows: Find and kill process using port
  exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
    if (error || !stdout) {
      console.log(`No process found on port ${port}`);
      return;
    }

    // Extract PID from netstat output
    const lines = stdout.trim().split('\n');
    const pids = new Set();

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    });

    if (pids.size === 0) {
      console.log(`No process found on port ${port}`);
      return;
    }

    pids.forEach((pid) => {
      exec(`taskkill /PID ${pid} /F`, (killError, killStdout) => {
        if (killError) {
          console.error(`Failed to kill process ${pid}:`, killError.message);
        } else {
          console.log(`✓ Killed process ${pid} on port ${port}`);
        }
      });
    });
  });
} else {
  // Unix/Linux/Mac: Find and kill process using port
  exec(`lsof -ti:${port}`, (error, stdout) => {
    if (error || !stdout) {
      console.log(`No process found on port ${port}`);
      return;
    }

    const pids = stdout.trim().split('\n');

    pids.forEach((pid) => {
      exec(`kill -9 ${pid}`, (killError) => {
        if (killError) {
          console.error(`Failed to kill process ${pid}:`, killError.message);
        } else {
          console.log(`✓ Killed process ${pid} on port ${port}`);
        }
      });
    });
  });
}
