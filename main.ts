// Hearthside Budget — hand-in program (Node 22, standard library only).
//
// The site itself is the static app/ folder beside this file: plain files a
// browser opens at app/index.html, no build step, nothing loaded over the
// network. This program hands the entry in. It copies app/ and screenshots/
// into the output directory and writes dossier.json there with the vendored
// make.fun library, exactly the summary the judge reads: the screenshots,
// the first load's files and bytes, and the site's source.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output, which the grader provides.)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The output holds app/, screenshots/ and dossier.json under one cap, so the
// dossier is written with the scorer's own limits: at most 993 app entries
// and 16 MiB of app files, at most 4 screenshots of 256 KiB each, and the
// dossier text capped at 163,840 bytes.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
