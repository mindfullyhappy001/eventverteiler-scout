import { useState } from 'react';

function get(k: string, d = '') { try { return localStorage.getItem(k) ?? d; } catch { return d; } }
function set(k: string, v: string) { try { localStorage.setItem(k, v); } catch {} }

export default function App() {
  const [tab, setTab] = useState<'dashboard'|'platforms'|'logs'>('platforms');

  const [mode, setMode] = useState(get('appMode','api'));
  const [apiBase, setApiBase] = useState(get('apiBase','http://localhost:8080'));
  const [supabaseUrl, setSupabaseUrl] = useState(get('supabaseUrl',''));
  const [supabaseAnon, setSupabaseAnon] = useState(get('supabaseAnon',''));

  const [meetupApi, setMeetupApi] = useState({ token: get('m_api_token',''), group: get('m_api_group','') });
  const [meetupUi, setMeetupUi] = useState({ email: get('m_ui_email',''), password: get('m_ui_pw',''), groupUrl: get('m_ui_groupUrl','') });
  const [ebApi, setEbApi] = useState({ token: get('eb_api_token','') });
  const [ebUi, setEbUi] = useState({ email: get('eb_ui_email',''), password: get('eb_ui_pw','') });
  const [fbApi, setFbApi] = useState({ pageId: get('fb_api_pageId',''), pageToken: get('fb_api_pageToken','') });
  const [fbUi, setFbUi] = useState({ email: get('fb_ui_email',''), password: get('fb_ui_pw','') });
  const [spUi, setSpUi] = useState({ email: get('sp_ui_email',''), password: get('sp_ui_pw','') });

  function persistConnectivity() {
    set('appMode', mode);
    set('apiBase', apiBase);
    set('supabaseUrl', supabaseUrl);
    set('supabaseAnon', supabaseAnon);
    alert('Konnektivität gespeichert.');
  }
  function saveMeetupApi() { set('m_api_token', meetupApi.token); set('m_api_group', meetupApi.group); alert('Meetup API gespeichert.'); }
  function saveMeetupUi() { set('m_ui_email', meetupUi.email); set('m_ui_pw', meetupUi.password); set('m_ui_groupUrl', meetupUi.groupUrl); alert('Meetup UI gespeichert.'); }
  function saveEbApi() { set('eb_api_token', ebApi.token); alert('Eventbrite API gespeichert.'); }
  function saveEbUi() { set('eb_ui_email', ebUi.email); set('eb_ui_pw', ebUi.password); alert('Eventbrite UI gespeichert.'); }
  function saveFbApi() { set('fb_api_pageId', fbApi.pageId); set('fb_api_pageToken', fbApi.pageToken); alert('Facebook API gespeichert.'); }
  function saveFbUi() { set('fb_ui_email', fbUi.email); set('fb_ui_pw', fbUi.password); alert('Facebook UI gespeichert.'); }
  function saveSpUi() { set('sp_ui_email', spUi.email); set('sp_ui_pw', spUi.password); alert('Spontacts UI gespeichert.'); }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] font-sans">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
          <div className="font-semibold">Event-Verteiler</div>
          <nav className="flex gap-2">
            <button className={`px-3 py-1 rounded ${tab==='dashboard'?'bg-blue-600 text-white':'hover:bg-gray-100'}`} onClick={()=>setTab('dashboard')}>Dashboard</button>
            <button className={`px-3 py-1 rounded ${tab==='platforms'?'bg-blue-600 text-white':'hover:bg-gray-100'}`} onClick={()=>setTab('platforms')}>Plattformen</button>
            <button className={`px-3 py-1 rounded ${tab==='logs'?'bg-blue-600 text-white':'hover:bg-gray-100'}`} onClick={()=>setTab('logs')}>Logs</button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {tab==='platforms' && (
          <>
            <section className="space-y-3">
              <h1 className="text-2xl font-semibold">Plattformen – Konnektivität</h1>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="text-sm">Modus
                  <select className="w-full border rounded p-2 mt-1" value={mode} onChange={(e)=>setMode(e.target.value)}>
                    <option value="api">Backend API</option>
                    <option value="supabase">Supabase direkt</option>
                  </select>
                </label>
                <label className="text-sm">API Server URL
                  <input className="w-full border rounded p-2 mt-1" value={apiBase} onChange={(e)=>setApiBase(e.target.value)} placeholder="http://localhost:8080" />
                </label>
                <label className="text-sm">DB URL (Supabase URL)
                  <input className="w-full border rounded p-2 mt-1" value={supabaseUrl} onChange={(e)=>setSupabaseUrl(e.target.value)} placeholder="https://xyz.supabase.co" />
                </label>
                <label className="text-sm">Supabase Anon Key
                  <input className="w-full border rounded p-2 mt-1" value={supabaseAnon} onChange={(e)=>setSupabaseAnon(e.target.value)} placeholder="public anon key" />
                </label>
              </div>
              <div className="text-right"><button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={persistConnectivity}>Übernehmen</button></div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Meetup</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">API</div>
                  <input className="w-full border rounded p-2" placeholder="API Token" value={meetupApi.token} onChange={(e)=>setMeetupApi({...meetupApi, token:e.target.value})} />
                  <input className="w-full border rounded p-2" placeholder="Group Slug" value={meetupApi.group} onChange={(e)=>setMeetupApi({...meetupApi, group:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveMeetupApi}>Speichern</button></div>
                </div>
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">UI-Bot</div>
                  <input className="w-full border rounded p-2" placeholder="Login E-Mail" value={meetupUi.email} onChange={(e)=>setMeetupUi({...meetupUi, email:e.target.value})} />
                  <input className="w-full border rounded p-2" type="password" placeholder="Login Passwort" value={meetupUi.password} onChange={(e)=>setMeetupUi({...meetupUi, password:e.target.value})} />
                  <input className="w-full border rounded p-2" placeholder="Group URL (optional)" value={meetupUi.groupUrl} onChange={(e)=>setMeetupUi({...meetupUi, groupUrl:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveMeetupUi}>Speichern</button></div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Eventbrite</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">API</div>
                  <input className="w-full border rounded p-2" placeholder="API Token" value={ebApi.token} onChange={(e)=>setEbApi({...ebApi, token:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveEbApi}>Speichern</button></div>
                </div>
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">UI-Bot</div>
                  <input className="w-full border rounded p-2" placeholder="Login E-Mail" value={ebUi.email} onChange={(e)=>setEbUi({...ebUi, email:e.target.value})} />
                  <input className="w-full border rounded p-2" type="password" placeholder="Login Passwort" value={ebUi.password} onChange={(e)=>setEbUi({...ebUi, password:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveEbUi}>Speichern</button></div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Facebook Events</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">API</div>
                  <input className="w-full border rounded p-2" placeholder="Page ID" value={fbApi.pageId} onChange={(e)=>setFbApi({...fbApi, pageId:e.target.value})} />
                  <input className="w-full border rounded p-2" placeholder="Page Token" value={fbApi.pageToken} onChange={(e)=>setFbApi({...fbApi, pageToken:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveFbApi}>Speichern</button></div>
                </div>
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">UI-Bot</div>
                  <input className="w-full border rounded p-2" placeholder="Login E-Mail" value={fbUi.email} onChange={(e)=>setFbUi({...fbUi, email:e.target.value})} />
                  <input className="w-full border rounded p-2" type="password" placeholder="Login Passwort" value={fbUi.password} onChange={(e)=>setFbUi({...fbUi, password:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveFbUi}>Speichern</button></div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Spontacts.de</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-3 space-y-2 opacity-60 pointer-events-none">
                  <div className="font-medium">API</div>
                  <input className="w-full border rounded p-2" placeholder="Nicht verfügbar" disabled />
                </div>
                <div className="border rounded p-3 space-y-2">
                  <div className="font-medium">UI-Bot</div>
                  <input className="w-full border rounded p-2" placeholder="Login E-Mail" value={spUi.email} onChange={(e)=>setSpUi({...spUi, email:e.target.value})} />
                  <input className="w-full border rounded p-2" type="password" placeholder="Login Passwort" value={spUi.password} onChange={(e)=>setSpUi({...spUi, password:e.target.value})} />
                  <div className="text-right"><button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={saveSpUi}>Speichern</button></div>
                </div>
              </div>
            </section>
          </>
        )}

        {tab==='dashboard' && (
          <>
            <h1 className="text-2xl font-semibold">Event-Verteiler Dashboard</h1>
            <div className="mt-3 border rounded p-3">
              <div className="text-sm mb-2">Events</div>
              <div className="text-gray-500 text-sm">(Backend/Supabase-Anbindung folgt nach Konfiguration)</div>
              <div className="mt-2 grid grid-cols-5 text-sm font-medium">
                <div>Titel</div><div>Datum</div><div>Kategorie</div><div>Status</div><div className="text-right">Aktionen</div>
              </div>
            </div>
          </>
        )}

        {tab==='logs' && (
          <>
            <h1 className="text-2xl font-semibold">Logs</h1>
            <div className="text-gray-500 text-sm">(Wird gefüllt nach ersten Veröffentlichungen)</div>
          </>
        )}
      </main>
    </div>
  );
}
