import assert from 'node:assert/strict';
import { classifyFailure, dispatch, assertProviderSwitchApproval } from '../providers/dispatcher.mjs';
import { parseDirective, runCascade } from '../orchestrator/engine.mjs';

assert.equal(classifyFailure('HTTP 429 rate limit', 1), 'rate_limited');
assert.equal(classifyFailure('quota exhausted', 1), 'quota_exhausted');
assert.equal(classifyFailure('unauthorized', 1), 'authentication_failed');
assert.equal(classifyFailure('unexpected output', 1), 'unknown');
assert.equal(parseDirective('@Dev implement feature').role, 'Dev Swarm');
assert.equal(parseDirective('@QA run e2e').mode, 'direct');
assert.equal(parseDirective('build expense manager').mode, 'cascade');

let invoked = 0;
const request = { taskId: 'pilot-1', role: 'Dev Swarm', provider: 'codex', profile: 'test', prompt: 'synthetic', maxInputTokens: 10, maxOutputTokens: 10, approval: { taskId: 'pilot-1', provider: 'codex', profile: 'test', purpose: 'invoke', decision: 'approved', approver: 'test-fde', recordedAt: new Date().toISOString() } };
const profiles = { providers: { codex: { enabled: true, profiles: { test: { model: 'mock', maxInputTokens: 10, maxOutputTokens: 10 } } } }, tokenBudgets: { defaultInputTokens: 20, defaultOutputTokens: 20 } };
const adapters = { codex: { invoke: async () => { invoked++; return { ok: false, category: 'rate_limited' }; } } };
const events = [];
const result = await dispatch(request, { profiles, adapters, ledger: async event => events.push(event) });
assert.equal(result.category, 'rate_limited');
assert.equal(invoked, 1, 'single provider attempt only');
assert.equal(events[0].status, 'stopped');
await assert.rejects(() => dispatch({ ...request, approval: null }, { profiles, adapters }), /approval required/i);
assert.equal(invoked, 1, 'missing approval must block invocation');
assert.throws(() => assertProviderSwitchApproval(request.approval, request, 'gemini', 'other'), /approval/i);

const calls = [];
const cascade = await runCascade('synthetic task', {
  execute: async (role, ctx) => { calls.push(role); return role === 'Architect' ? { db: [], api: {} } : role === 'QA' ? { passed: calls.filter(x => x === 'QA').length > 1 } : {}; },
  approve: async () => true
});
assert.equal(cascade.status, 'complete');
assert.equal(calls.filter(x => x === 'BA').length, 1, 'QA loop must not restart BA');
assert.equal(calls.filter(x => x === 'Architect').length, 1, 'QA loop must not restart Architect');
assert.ok(calls.indexOf('Security') > calls.indexOf('QA'));
process.stdout.write('Factory self-test passed (mocked providers only; no inference).\n');
