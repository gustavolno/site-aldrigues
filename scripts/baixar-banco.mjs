// npm run banco: baixa uma cópia do banco do painel (Cloudflare D1 "painel-noticias") para banco/painel-noticias.sqlite,
// que o DBeaver abre com o driver SQLite. É uma foto do momento: rode de novo para atualizar.
// Na primeira vez em cada computador: npx wrangler login (entra na conta Cloudflare do escritório).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const NOME = 'painel-noticias';
const SQL = `banco/${NOME}.sql`, ARQUIVO = `banco/${NOME}.sqlite`;
fs.mkdirSync('banco', { recursive: true });
fs.rmSync(SQL, { force: true });

execFileSync('npx', ['--yes', 'wrangler@4', 'd1', 'export', NOME, '--remote', '--output', SQL],
  { stdio: 'inherit', shell: process.platform === 'win32' });

// monta o arquivo novo ao lado e só troca no fim: se der erro, a cópia anterior continua valendo
const novo = `${ARQUIVO}.novo`;
fs.rmSync(novo, { force: true });
const db = new DatabaseSync(novo);
db.exec(fs.readFileSync(SQL, 'utf8'));
const contar = (t) => db.prepare(`SELECT count(*) AS n FROM ${t}`).get().n;
console.log(`postagens: ${contar('postagens')} · fotos: ${contar('fotos')} · registro: ${contar('registro')}`);
db.close();
fs.renameSync(novo, ARQUIVO);
fs.rmSync(SQL);
console.log(`Pronto: ${ARQUIVO} (abra no DBeaver: Nova conexão > SQLite > este arquivo)`);
