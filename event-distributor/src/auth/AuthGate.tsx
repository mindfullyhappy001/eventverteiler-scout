import { PropsWithChildren, useEffect, useState } from 'react';
import SignIn from './SignIn';
import { supa } from '../services/supabase';

export default function AuthGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [isAuthed, setAuthed] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const sb = supa();
        const { data } = await sb.auth.getSession();
        setAuthed(!!data.session);
        const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
          setAuthed(!!session);
        });
        unsub = () => listener.subscription.unsubscribe();
      } catch (e) {
        // Missing configuration will be surfaced by SignIn
      } finally {
        setReady(true);
      }
    })();
    return () => {
      if (unsub) try { unsub(); } catch {}
    };
  }, []);

  if (!ready) return <div className="min-h-screen grid place-items-center text-gray-500">Laden…</div>;
  if (!isAuthed) return <SignIn />;

  return (
    <div>
      <div className="fixed top-2 right-2 z-50">
        <button
          className="text-sm px-3 py-1 rounded bg-gray-900 text-white hover:opacity-90"
          onClick={() => supa().auth.signOut()}
        >
          Abmelden
        </button>
      </div>
      {children}
    </div>
  );
}
