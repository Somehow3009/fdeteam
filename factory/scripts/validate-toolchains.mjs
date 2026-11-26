import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const toolchains = JSON.parse(await readFile(new URL('../config/agent-toolchains.json', import.meta.url), 'utf8'));
const missing = [];
for (const [role, tools] of Object.entries(toolchains)) {
  for (const tool of tools) {
    const result = spawnSync(tool, ['--version'], { encoding: 'utf8', timeout: 10000, windowsHide: true, shell: process.platform === 'win32' });
    if (result.error || result.status !== 0) missing.push(`${role}: ${tool}`);
  }
}
if (missing.length) {
  process.stderr.write(`Missing/unverified tools:\n${missing.join('\n')}\n`);
  process.exitCode = 1;
} else process.stdout.write('All configured role tools reported versions.\n');
