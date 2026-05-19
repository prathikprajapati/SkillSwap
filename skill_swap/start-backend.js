#!/usr/bin/env node

/**
 * SkillSwap Backend Development Server
 * Runs backend (Express + WebSocket)
 * 
 * Usage:
 *   node start-backend.js
 */

import { spawn } from 'child_process';
import { platform } from 'os';
import { createInterface } from 'readline';

const isWindows = platform() === 'win32';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const prefixes = {
  backend: `${colors.green}[BACKEND]${colors.reset}`,
  system: `${colors.yellow}[SYSTEM]${colors.reset}`,
  error: `${colors.red}[ERROR]${colors.reset}`,
};

const processes = {
  backend: null,
};

function log(prefix, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix} ${message}`);
}

function spawnProcess(name, command, args, cwd, env = {}) {
  const shell = isWindows;
  
  const child = spawn(command, args, {
    cwd,
    shell,
    stdio: 'pipe',
    env: { ...process.env, ...env },
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        log(prefixes[name], line);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        log(prefixes.error, `[${name.toUpperCase()}] ${line}`);
      }
    });
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(prefixes.error, `${name} process exited with code ${code}`);
    } else {
      log(prefixes.system, `${name} process stopped`);
    }
  });

  child.on('error', (err) => {
    log(prefixes.error, `Failed to start ${name}: ${err.message}`);
  });

  return child;
}

function startBackend() {
  log(prefixes.system, 'Starting backend server (Express + WebSocket)...');
  
  const env = {
    FORCE_COLOR: 'true',
    NODE_ENV: 'development',
  };

  processes.backend = spawnProcess(
    'backend',
    'npm',
    ['run', 'dev'],
    'backend',
    env
  );

  log(prefixes.system, 'Backend server starting on http://localhost:3000');
  log(prefixes.system, 'WebSocket server starting on ws://localhost:3000');
}

function stopAll() {
  log(prefixes.system, 'Shutting down backend server...');
  
  if (processes.backend) {
    processes.backend.kill();
    processes.backend = null;
  }
  
  log(prefixes.system, 'Server stopped');
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
process.on('exit', stopAll);

if (isWindows) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    stopAll();
  });
}

console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.cyan}║${colors.reset}           ${colors.bright}SkillSwap Backend Server${colors.reset}                    ${colors.cyan}║${colors.reset}
${colors.cyan}╠════════════════════════════════════════════════════════════╣${colors.reset}
${colors.cyan}║${colors.reset}  Backend:  ${colors.green}http://localhost:3000${colors.reset}                        ${colors.cyan}║${colors.reset}
${colors.cyan}║${colors.reset}  WebSocket: ${colors.magenta}ws://localhost:3000${colors.reset}                       ${colors.cyan}║${colors.reset}
${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

startBackend();

setInterval(() => {}, 1000);
