import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const appNames = ['consumer-web', 'tenant-console', 'saas-admin'];
const sharedTargets = ['@angular', 'rxjs', 'tslib'];

function resolveAppsFromArgs() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    return args
      .map((value) => value.replace(/\/+$/, ''))
      .map((value) => path.basename(value))
      .filter((value) => appNames.includes(value));
  }

  const relativeCwd = path.relative(frontendRoot, process.cwd());
  const [firstSegment] = relativeCwd.split(path.sep);

  if (appNames.includes(firstSegment)) {
    return [firstSegment];
  }

  return appNames;
}

function ensureSymlink(linkPath, targetPath) {
  const parentDir = path.dirname(linkPath);
  fs.mkdirSync(parentDir, { recursive: true });

  if (fs.existsSync(linkPath)) {
    try {
      const current = fs.lstatSync(linkPath);

      if (current.isSymbolicLink()) {
        const existingTarget = fs.readlinkSync(linkPath);
        const resolvedExistingTarget = path.resolve(parentDir, existingTarget);

        if (resolvedExistingTarget === targetPath) {
          return 'kept';
        }
      }

      fs.rmSync(linkPath, { recursive: true, force: true });
    } catch {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
  }

  const relativeTarget = path.relative(parentDir, targetPath);
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';

  fs.symlinkSync(relativeTarget, linkPath, linkType);
  return 'linked';
}

const selectedApps = resolveAppsFromArgs();

if (selectedApps.length === 0) {
  console.warn('[mixmaster-frontend] No app targets resolved for shared dependency linking.');
  process.exit(0);
}

const workspaceNodeModules = path.join(frontendRoot, 'node_modules');

if (!fs.existsSync(workspaceNodeModules)) {
  console.error('[mixmaster-frontend] Missing frontend/node_modules. Run "cd frontend && npm install" first.');
  process.exit(1);
}

for (const appName of selectedApps) {
  const appRoot = path.join(frontendRoot, appName);
  const appNodeModules = path.join(appRoot, 'node_modules');

  if (!fs.existsSync(appRoot)) {
    console.warn(`[mixmaster-frontend] Skipping unknown app "${appName}".`);
    continue;
  }

  fs.mkdirSync(appNodeModules, { recursive: true });

  for (const target of sharedTargets) {
    const targetParts = target.split('/');
    const sharedTargetPath = path.join(workspaceNodeModules, ...targetParts);
    const appTargetPath = path.join(appNodeModules, ...targetParts);

    if (!fs.existsSync(sharedTargetPath)) {
      console.warn(`[mixmaster-frontend] Skipping ${target} for ${appName}; workspace package not installed.`);
      continue;
    }

    const result = ensureSymlink(appTargetPath, sharedTargetPath);
    console.log(`[mixmaster-frontend] ${appName}: ${result} ${target}`);
  }
}
