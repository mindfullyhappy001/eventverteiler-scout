import type { SupabaseClient } from '@supabase/supabase-js';
import { cfg } from '../config';

export class SupabaseStorage {
  constructor(private sb: SupabaseClient) {}
  async loadSession(platform: string): Promise<any|undefined> {
    try {
      const path = `${platform}/storageState.json`;
      const { data, error } = await this.sb.storage.from(cfg.sessionsBucket).download(path);
      if (error) return undefined;
      const text = await data.text();
      return JSON.parse(text);
    } catch { return undefined; }
  }
  async saveSession(platform: string, storageState: any) {
    const path = `${platform}/storageState.json`;
    const blob = new Blob([JSON.stringify(storageState)], { type: 'application/json' });
    await this.sb.storage.from(cfg.sessionsBucket).upload(path, blob, { upsert: true, contentType: 'application/json' });
  }
  async saveArtifact(jobId: string, name: string, blob: Blob) {
    const path = `${jobId}/${name}`;
    await this.sb.storage.from(cfg.artifactsBucket).upload(path, blob, { upsert: true });
    const { data } = await this.sb.storage.from(cfg.artifactsBucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
