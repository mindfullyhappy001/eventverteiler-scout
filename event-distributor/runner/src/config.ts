import 'dotenv/config';

export const cfg = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnon: process.env.SUPABASE_ANON_KEY || '',
  botEmail: process.env.SUPABASE_BOT_EMAIL || '',
  botPassword: process.env.SUPABASE_BOT_PASSWORD || '',
  mode: (process.env.RUNNER_MODE as 'local'|'ws') || 'local',
  wsEndpoint: process.env.WS_ENDPOINT || '',
  parallelism: Number(process.env.PARALLELISM || '1'),
  pollIntervalMs: Number(process.env.JOB_POLL_INTERVAL_MS || '3000'),
  runTimeoutMs: Number(process.env.JOB_RUN_TIMEOUT_MS || '600000'),
  sessionsBucket: process.env.SESSIONS_BUCKET || 'bot-sessions',
  artifactsBucket: process.env.ARTIFACTS_BUCKET || 'bot-artifacts',
};

export function requireEnv(name: string, value: string) {
  if (!value) throw new Error(`Missing env ${name}`);
}
