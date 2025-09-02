import fs from 'node:fs';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function q(s: string) { return new Promise<string>(res => rl.question(s, (a)=>res(a.trim()))); }

async function main() {
  console.log('Runner .env Setup');
  const supaUrl = await q('SUPABASE_URL (z.B. https://xyz.supabase.co): ');
  const anon = await q('SUPABASE_ANON_KEY: ');
  const email = await q('SUPABASE_BOT_EMAIL: ');
  const pw = await q('SUPABASE_BOT_PASSWORD: ');
  const mode = await q('RUNNER_MODE (local/ws) [local]: ') || 'local';
  const paral = await q('PARALLELISM [1]: ') || '1';
  const env = `SUPABASE_URL=${supaUrl}
SUPABASE_ANON_KEY=${anon}
SUPABASE_BOT_EMAIL=${email}
SUPABASE_BOT_PASSWORD=${pw}
RUNNER_MODE=${mode}
PARALLELISM=${paral}
SESSIONS_BUCKET=bot-sessions
ARTIFACTS_BUCKET=bot-artifacts
`;
  fs.writeFileSync('.env', env);
  console.log('Geschrieben: .env');
  rl.close();
}

main();
