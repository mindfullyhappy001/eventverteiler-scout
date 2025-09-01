import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import Logs from './pages/Logs';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { getMode, setMode, getSupabaseUrl, setSupabaseUrl, getSupabaseAnon, setSupabaseAnon } from './services/config';

type Tab = 'dashboard' | 'platforms' | 'logs' | 'setup';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [mode, setModeState] = useState(getMode());
  const [supabaseUrl, setSupabaseUrlState] = useState(getSupabaseUrl());
  const [supabaseAnon, setSupabaseAnonState] = useState(getSupabaseAnon());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if app is properly configured
    if (mode === 'supabase') {
      setIsConfigured(!!supabaseUrl && !!supabaseAnon);
    } else {
      setIsConfigured(true); // API mode is always configured
    }
  }, [mode, supabaseUrl, supabaseAnon]);

  function handleSetupSave() {
    setMode(mode);
    if (mode === 'supabase') {
      setSupabaseUrl(supabaseUrl);
      setSupabaseAnon(supabaseAnon);
    }
    setIsConfigured(true);
    setTab('dashboard');
  }

  // Show setup screen if not configured or if explicitly navigated to setup
  const showSetup = !isConfigured || tab === 'setup';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-blue-600">Event-Verteiler</div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {mode === 'supabase' ? 'Supabase Modus' : 'API Modus'}
            </div>
          </div>
          
          {isConfigured && (
            <nav className="flex gap-1">
              <Button 
                variant={tab === 'dashboard' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setTab('dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant={tab === 'platforms' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setTab('platforms')}
              >
                Plattformen
              </Button>
              <Button 
                variant={tab === 'logs' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setTab('logs')}
              >
                Logs
              </Button>
              <Button 
                variant={tab === 'setup' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTab('setup')}
              >
                Setup
              </Button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {showSetup && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Event-Verteiler Setup</h1>
              <p className="text-muted-foreground mt-2">
                Konfiguriere die Datenbankverbindung für deine Event-Verteiler App
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verbindungsmodus</label>
                  <Select value={mode} onValueChange={setModeState}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">Backend API (Empfohlen)</SelectItem>
                      <SelectItem value="supabase">Direkte Supabase Verbindung</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {mode === 'api' 
                      ? 'Verwendet den Backend-Server für alle Operationen' 
                      : 'Verbindet sich direkt mit Supabase (nur Events, keine Publishing-Features)'
                    }
                  </p>
                </div>

                {mode === 'supabase' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Supabase Project URL</label>
                      <Input 
                        value={supabaseUrl} 
                        onChange={(e) => setSupabaseUrlState(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Supabase Anon Key</label>
                      <Input 
                        value={supabaseAnon} 
                        onChange={(e) => setSupabaseAnonState(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIs..."
                      />
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <Button onClick={handleSetupSave} className="w-full">
                    {mode === 'api' ? 'API Modus aktivieren' : 'Supabase Verbindung speichern'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {mode === 'supabase' && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Hinweis zum Supabase Modus:</div>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Nur Event-Management verfügbar</li>
                      <li>• Publishing und Platform-Integration erfordern Backend API</li>
                      <li>• Für Vollumfang den Backend-Server verwenden</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!showSetup && (
          <>
            {tab === 'dashboard' && <Dashboard />}
            {tab === 'platforms' && <Platforms />}
            {tab === 'logs' && <Logs />}
          </>
        )}
      </main>
    </div>
  );
}
