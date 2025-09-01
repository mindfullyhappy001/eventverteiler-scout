import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import { PlatformsInline } from './components/PlatformsInline';

export default function App() {
  const [tab, setTab] = useState<'dashboard'|'platforms'|'logs'>('dashboard');

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
          <PlatformsInline />
        )}

        {tab==='dashboard' && (
          <Dashboard />
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
