'use strict';
const fs = require('fs');
const path = require('path');

// Enforce that platform modules do not import other platforms' code.
const platformsRoot = path.resolve(__dirname, '..', 'src', 'platforms');
const platforms = fs.readdirSync(platformsRoot).filter((p) => fs.statSync(path.join(platformsRoot, p)).isDirectory());

let violations = 0;
for (const platform of platforms) {
  const platDir = path.join(platformsRoot, platform);
  const files = walk(platDir).filter((f) => f.endsWith('.ts'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const other of platforms) {
      if (other === platform) continue;
      const rel = path.relative(path.dirname(file), path.join(platformsRoot, other)).replace(/\\/g, '/');
      const importRegex = new RegExp(`from ['\"](\.\./)+platforms/${other}(/|['\"])`);
      if (importRegex.test(content)) {
        console.error(`Boundary violation: ${path.relative(process.cwd(), file)} imports ${other}`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`Found ${violations} platform boundary violations.`);
  process.exit(1);
} else {
  console.log('Platform boundaries OK');
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
