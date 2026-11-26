import { runDirect, runCascade } from './engine.mjs';

const text = process.argv.slice(2).join(' ');
const execute = async (role, task) => ({ role, accepted: true, task });
const approve = async (gate) => {
  if (!process.stdin.isTTY) throw new Error(`Human approval required: ${gate}`);
  process.stdout.write(`${gate}\nType APPROVE to continue: `);
  return new Promise(resolve => process.stdin.once('data', value => resolve(value.toString().trim() === 'APPROVE')));
};
const result = /@(Dev|QA|Architect|BA|Security|DevOps)\b/i.test(text)
  ? await runDirect(text, execute)
  : await runCascade(text, { execute, approve });
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
