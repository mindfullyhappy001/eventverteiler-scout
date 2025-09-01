import { useState } from 'react';
import { supa } from '../services/supabase';
import { getSupabaseUrl, getSupabaseAnon, setSupabaseUrl, setSupabaseAnon } from '../services/config';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sbUrl, setSbUrl] = useState(getSupabaseUrl());
  const [sbAnon, setSbAnon] = useState(getSupabaseAnon());
  const haveEnv = !!sbUrl && !!sbAnon;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const sb = supa();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  function applyLocalConfig() {
    try {
      setSupabaseUrl(sbUrl);
      setSupabaseAnon(sbAnon);
      window.location.reload();
    } catch {}
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white shadow rounded">
        <h1 className="text-xl font-semibold">Anmeldung</h1>
        <p className="text-sm text-gray-600 mt-1">Bitte mit deinem Admin-Account anmelden.</p>

        {!haveEnv && (
          <div className="mt-4 space-y-2 text-xs">
            <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Supabase URL/Anon Key sind nicht konfiguriert. In Vercel werden ENV-Variablen automatisch verwendet. Alternativ hier lokal hinterlegen:
            </div>
            <input className="w-full border rounded p-2" placeholder="https://<ref>.supabase.co" value={sbUrl} onChange={(e)=>setSbUrl(e.target.value)} />
            <input className="w-full border rounded p-2" placeholder="Anon Public Key" value={sbAnon} onChange={(e)=>setSbAnon(e.target.value)} />
            <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={applyLocalConfig}>Übernehmen</button></div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block text-sm">
            E-Mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded p-2"
              placeholder="admin@example.com"
            />
          </label>
          <label className="block text-sm">
            Passwort
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded p-2"
              placeholder="••••••••"
            />
          </label>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
          <p className="text-[11px] text-gray-500">Wenn in Vercel ENV gesetzt sind, werden sie automatisch genutzt; die Felder dienen als Fallback.</p>
        </form>
      </div>
    </div>
  );
}
