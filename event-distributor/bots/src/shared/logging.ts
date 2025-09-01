import fs from 'node:fs';
import path from 'node:path';

export function createArtifacts(jobId: string) {
  const provided = process.env.ARTIFACTS_BASE ? path.resolve(process.cwd(), process.env.ARTIFACTS_BASE) : undefined;
  const base = provided || path.resolve(process.cwd(), 'artifacts', jobId, String(Date.now()));
  fs.mkdirSync(base, { recursive: true });
  return {
    base,
    async save(page: any, label: string) {
      const dir = path.join(base, label);
      fs.mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: path.join(dir, 'screenshot.png'), fullPage: true });
      const html = await page.content();
      fs.writeFileSync(path.join(dir, 'dom.html'), html);
    }
  };
}
