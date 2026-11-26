export const PIPELINE = ['BA', 'Architect', 'Dev Swarm', 'QA', 'Security', 'DevOps'];
const DIRECTIVE = /@(Dev|QA|Architect|BA|Security|DevOps)\b/i;

export function parseDirective(text) {
  const match = String(text).match(DIRECTIVE);
  return match ? { mode: 'direct', role: match[1].toLowerCase() === 'dev' ? 'Dev Swarm' : PIPELINE.find(role => role.toLowerCase() === match[1].toLowerCase()) } : { mode: 'cascade', roles: PIPELINE };
}

export async function runDirect(text, execute) {
  const parsed = parseDirective(text);
  if (parsed.mode !== 'direct') throw new Error('Direct mode requires an @Role directive');
  return execute(parsed.role, text);
}

export async function runCascade(input, { execute, approve, maxQaLoops = 3 }) {
  const artifacts = {};
  for (const role of PIPELINE) {
    if (role === 'Dev Swarm' && !artifacts.architect?.approved) {
      const gate = await approve('Gate 1: approve database and API specifications before development', artifacts.architect);
      if (gate !== true) return { status: 'paused', gate: 1, artifacts };
      artifacts.architect.approved = true;
    }
    if (role === 'DevOps' && !artifacts.security?.approved) {
      const gate = await approve('Gate 2: approve final deployment after security review', artifacts.security);
      if (gate !== true) return { status: 'paused', gate: 2, artifacts };
      artifacts.security.approved = true;
    }
    if (role === 'QA') {
      let qa;
      for (let loop = 0; loop <= maxQaLoops; loop++) {
        qa = await execute('QA', { input, artifacts });
        artifacts.qa = qa;
        if (qa?.passed) break;
        if (loop === maxQaLoops) return { status: 'failed', phase: 'QA', artifacts };
        artifacts.dev = await execute('Dev Swarm', { input, artifacts, qaFailure: qa });
      }
      continue;
    }
    artifacts[role === 'BA' ? 'ba' : role === 'Architect' ? 'architect' : role === 'Dev Swarm' ? 'dev' : role === 'Security' ? 'security' : 'devops'] = await execute(role, { input, artifacts });
  }
  return { status: 'complete', artifacts };
}
