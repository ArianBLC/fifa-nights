// Reads every data/*.xlsx and writes src/data/generated.json
// Row format (first column): "Home HomeGoals AwayGoals Away", e.g. "Murat 3 1 Salman"
// File name format: "Fifa Tournement 3 (October 2026).xlsx"  -> number 3, month "October 2026"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const outFile = path.join(root, 'src', 'data', 'generated.json');

const files = fs.readdirSync(dataDir).filter((f) => /\.xlsx$/i.test(f) && !f.startsWith('~$'));
const rowRe = /^\s*(\S+)\s+(\d+)\s+(\d+)\s+(\S+)\s*$/;
const nameRe = /(\d+)\s*\(\s*([A-Za-z]+)\s+(\d{4})\s*\)/;
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

const errors = [];
const tournaments = [];

for (const file of files) {
  const m = file.match(nameRe);
  if (!m) { errors.push(`${file}: file name must look like "Fifa Tournement 3 (October 2026).xlsx"`); continue; }
  const number = Number(m[1]);
  const monthIdx = MONTHS.indexOf(m[2].toLowerCase());
  if (monthIdx < 0) { errors.push(`${file}: unknown month "${m[2]}"`); continue; }
  const year = Number(m[3]);
  const month = MONTHS[monthIdx][0].toUpperCase() + MONTHS[monthIdx].slice(1);

  const wb = XLSX.readFile(path.join(dataDir, file));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const matches = [];
  rows.forEach((r, i) => {
    // Accept either one cell "A 3 1 B" or separate cells A | 3 | 1 | B
    const cells = r.filter((c) => c !== null && String(c).trim() !== '');
    if (!cells.length) return;
    const text = cells.length === 1 ? String(cells[0]) : cells.join(' ');
    const mm = text.match(rowRe);
    if (!mm) { errors.push(`${file} row ${i + 1}: cannot read "${text}"`); return; }
    matches.push({ home: mm[1], away: mm[4], hg: Number(mm[2]), ag: Number(mm[3]) });
  });
  tournaments.push({
    number, year, monthIdx, month,
    name: `Fifa tournament ${number} (${month} ${year})`,
    matches,
  });
}

tournaments.sort((a, b) => a.number - b.number);

// --- sanity checks -------------------------------------------------------
const names = new Set();
tournaments.forEach((t) => t.matches.forEach((x) => { names.add(x.home); names.add(x.away); }));
const list = [...names];
const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const warnings = [];
for (let i = 0; i < list.length; i++)
  for (let j = i + 1; j < list.length; j++)
    if (lev(list[i].toLowerCase(), list[j].toLowerCase()) <= 1)
      warnings.push(`Names "${list[i]}" and "${list[j]}" look almost identical - typo?`);

for (const t of tournaments) {
  const pc = new Map();
  t.matches.forEach((x) => {
    if (x.home === x.away) errors.push(`${t.name}: ${x.home} plays against themselves`);
    const k = [x.home, x.away].sort().join('|');
    pc.set(k, (pc.get(k) || 0) + 1);
  });
  const counts = new Set(pc.values());
  if (counts.size > 1) warnings.push(`${t.name}: pairs played an unequal number of times (${[...pc].filter(([, v]) => v !== [...counts][0]).map(([k, v]) => `${k.replace('|', ' vs ')} x${v}`).join(', ')})`);
}
for (let i = 1; i < tournaments.length; i++)
  if (tournaments[i].number === tournaments[i - 1].number) errors.push(`Tournament number ${tournaments[i].number} is used twice`);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const avatarDir = path.join(root, 'public', 'avatars');
const avatars = fs.existsSync(avatarDir) ? fs.readdirSync(avatarDir) : [];
for (const n of list) if (!avatars.includes(`${n}.png`)) warnings.push(`No avatar found: public/avatars/${n}.png (initials will be shown)`);

if (errors.length) {
  console.error('IMPORT FAILED:\n - ' + errors.join('\n - '));
  process.exit(1);
}
warnings.forEach((w) => console.warn('warning:', w));
fs.writeFileSync(outFile, JSON.stringify({ tournaments }, null, 2));
console.log(`Imported ${tournaments.length} tournaments, ${tournaments.reduce((s, t) => s + t.matches.length, 0)} matches, ${list.length} players -> src/data/generated.json`);
