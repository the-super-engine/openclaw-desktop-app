/**
 * Star Office UI - Backend lifecycle management
 * Installs via ClawHub, spawns Flask backend, manages process
 */
import { spawn, ChildProcess } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { getOpenClawSkillsDir } from './paths';
import { getUvMirrorEnv } from './uv-env';
import { logger } from './logger';
import { quoteForCmd, needsWinShell } from './paths';

const SKILL_SLUG = 'star-office-ui';
const DEFAULT_PORT = 19000;
const HEALTH_URL = `http://127.0.0.1:${DEFAULT_PORT}/health`;

function getSkillDir(): string {
  return join(getOpenClawSkillsDir(), SKILL_SLUG);
}

function getBundledUvPath(): string {
  const platform = process.platform;
  const arch = process.arch;
  const target = `${platform}-${arch}`;
  const binName = platform === 'win32' ? 'uv.exe' : 'uv';
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', binName);
  }
  return join(process.cwd(), 'resources', 'bin', target, binName);
}

function getUvBin(): string {
  const bundled = getBundledUvPath();
  if (existsSync(bundled)) return bundled;
  return 'uv';
}

let backendProcess: ChildProcess | null = null;

export function isStarOfficeInstalled(): boolean {
  const skillDir = getSkillDir();
  const appPy = join(skillDir, 'backend', 'app.py');
  return existsSync(appPy);
}

export function ensureStateJson(skillDir: string): void {
  const statePath = join(skillDir, 'state.json');
  const samplePath = join(skillDir, 'state.sample.json');
  if (!existsSync(statePath) && existsSync(samplePath)) {
    copyFileSync(samplePath, statePath);
    logger.info('Star Office: initialized state.json from state.sample.json');
  }
}

export async function ensureBackendDeps(skillDir: string): Promise<void> {
  const uvBin = getUvBin();
  const reqPath = join(skillDir, 'backend', 'requirements.txt');
  if (!existsSync(reqPath)) {
    throw new Error('Star Office backend requirements.txt not found');
  }
  const venvDir = join(skillDir, '.venv');
  const uvEnv = await getUvMirrorEnv();
  const useShell = needsWinShell(uvBin);

  if (!existsSync(venvDir)) {
    await new Promise<void>((resolve, reject) => {
      const args = ['venv', '.venv', '--python', '3.12'];
      const child = spawn(useShell ? quoteForCmd(uvBin) : uvBin, args, {
        cwd: skillDir,
        env: { ...process.env, ...uvEnv },
        shell: useShell,
        windowsHide: true,
      });
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`uv venv exited with code ${code}`));
      });
      child.on('error', reject);
    });
  }

  return new Promise((resolve, reject) => {
    const args = ['pip', 'install', '-r', reqPath];
    const child = spawn(useShell ? quoteForCmd(uvBin) : uvBin, args, {
      cwd: skillDir,
      env: { ...process.env, ...uvEnv },
      shell: useShell,
      windowsHide: true,
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`uv pip install exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

export async function startStarOfficeBackend(): Promise<{ port: number; url: string }> {
  if (backendProcess) {
    return { port: DEFAULT_PORT, url: `http://127.0.0.1:${DEFAULT_PORT}` };
  }
  const skillDir = getSkillDir();
  if (!isStarOfficeInstalled()) {
    throw new Error('Star Office UI is not installed. Install via Skills first.');
  }
  ensureStateJson(skillDir);
  await ensureBackendDeps(skillDir);

  const uvBin = getUvBin();
  const useShell = needsWinShell(uvBin);
  const uvEnv = await getUvMirrorEnv();
  const pythonBin = process.platform === 'win32'
    ? join(skillDir, '.venv', 'Scripts', 'python.exe')
    : join(skillDir, '.venv', 'bin', 'python');
  if (!existsSync(pythonBin)) {
    throw new Error('Star Office venv not ready. Run ensureBackendDeps first.');
  }

  return new Promise((resolve, reject) => {
    const args = ['backend/app.py'];
    backendProcess = spawn(useShell ? quoteForCmd(pythonBin) : pythonBin, args, {
      cwd: skillDir,
      env: {
        ...process.env,
        ...uvEnv,
        STAR_BACKEND_PORT: String(DEFAULT_PORT),
      },
      shell: useShell,
      windowsHide: true,
    });
    backendProcess.stdout?.on('data', (d) => logger.debug('[StarOffice]', d.toString().trim()));
    backendProcess.stderr?.on('data', (d) => logger.debug('[StarOffice]', d.toString().trim()));
    backendProcess.on('error', (err) => {
      backendProcess = null;
      reject(err);
    });
    backendProcess.on('exit', (code) => {
      backendProcess = null;
      if (code !== 0 && code !== null) {
        logger.warn(`Star Office backend exited with code ${code}`);
      }
    });
    // Give backend a moment to bind
    setTimeout(() => resolve({ port: DEFAULT_PORT, url: `http://127.0.0.1:${DEFAULT_PORT}` }), 1500);
  });
}

export function stopStarOfficeBackend(): void {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
    backendProcess = null;
    logger.info('Star Office backend stopped');
  }
}

export async function checkStarOfficeHealth(): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function getStarOfficeUrl(): string {
  return `http://127.0.0.1:${DEFAULT_PORT}`;
}
