import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const STOP = /(?:\b401\b|\b403\b|\b429\b|unauthori[sz]ed|authentication|rate.?limit|quota|billing limit|resource exhausted)/i;

export function classifyFailure(output, exitCode) {
  const value = String(output ?? '');
  if (/\b429\b|rate.?limit/i.test(value)) return 'rate_limited';
  if (/quota|billing limit|resource exhausted/i.test(value)) return 'quota_exhausted';
  if (/\b401\b|\b403\b|unauthori[sz]ed|authentication/i.test(value)) return 'authentication_failed';
  if (/model.{0,30}(not found|unavailable|inaccessible)/i.test(value)) return 'model_unavailable';
  return exitCode === 0 ? null : 'unknown';
}

export function createAdapter(provider, executable) {
  return {
    provider,
    async describe() { return { provider, executable }; },
    async health() { return { status: 'unknown', inference: false }; },
    invoke(request, profile) {
      const args = profile.args ?? [];
      if (provider === 'codex') args.push('exec', '--model', profile.model, request.prompt);
      else if (provider === 'gemini') args.push('--model', profile.model, '--prompt', request.prompt);
      else if (provider === 'claude') args.push('-p', request.prompt, '--model', profile.model);
      else args.push('run', profile.model, request.prompt);
      return new Promise((resolve) => {
        const child = spawn(executable, args, {
          cwd: request.workingDirectory ?? process.cwd(),
          shell: false,
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env }
        });
        let stdout = '';
        let stderr = '';
        let settled = false;
        const finish = (result) => { if (!settled) { settled = true; clearTimeout(timer); resolve(result); } };
        child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
        child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
        const timer = setTimeout(() => { child.kill(); finish({ ok: false, category: 'timeout' }); }, request.timeoutMs ?? 120000);
        child.on('error', () => finish({ ok: false, category: 'provider_unavailable' }));
        child.on('close', (code) => {
          const category = classifyFailure(`${stdout}\n${stderr}`, code);
          if (category) return finish({ ok: false, category });
          finish({ ok: true, output: stdout, usage: null });
        });
      });
    }
  };
}

export async function loadProfiles(file = new URL('../config/provider-profiles.json', import.meta.url)) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export function checkApproval(approval, request, purpose = 'invoke') {
  if (!approval || approval.taskId !== request.taskId || approval.provider !== request.provider || approval.profile !== request.profile || approval.purpose !== purpose || approval.decision !== 'approved' || !approval.approver || !approval.recordedAt) {
    throw new Error(`Explicit task-scoped FDE approval required for ${purpose}`);
  }
}

export async function dispatch(request, { profiles, adapters, ledger = async () => {} }) {
  const provider = profiles.providers[request.provider];
  const profile = provider?.profiles?.[request.profile];
  if (!provider?.enabled || !profile || !profile.model || !adapters[request.provider]) throw new Error('Provider/profile is disabled, missing, or invalid');
  checkApproval(request.approval, request, 'invoke');
  const inputBudget = profile.maxInputTokens ?? profiles.tokenBudgets.defaultInputTokens;
  const outputBudget = Math.min(request.maxOutputTokens, profile.maxOutputTokens ?? profiles.tokenBudgets.defaultOutputTokens);
  if (!inputBudget || request.maxInputTokens > inputBudget || !outputBudget) throw new Error('Token budget missing or exceeded');
  const startedAt = new Date().toISOString();
  const result = await adapters[request.provider].invoke(request, profile);
  await ledger({ taskId: request.taskId, role: request.role, provider: request.provider, profile: request.profile, status: result.ok ? 'completed' : 'stopped', startedAt, endedAt: new Date().toISOString(), category: result.category ?? null, attempt: 1 });
  return result;
}

export function assertProviderSwitchApproval(approval, request, nextProvider, nextProfile) {
  checkApproval(approval, request, 'provider_switch');
  if (approval.alternateProvider !== nextProvider || approval.alternateProfile !== nextProfile || approval.maxAttempts !== 1) throw new Error('Approval does not exactly authorize this one-attempt provider switch');
}

export const adapterFor = (provider, executable) => createAdapter(provider, executable);
