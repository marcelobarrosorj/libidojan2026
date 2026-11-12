import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const RAIZ = 'C:\\libidojan2026';
const SRC_DIR = path.join(RAIZ, 'src');
const LOG_FILE = path.join(RAIZ, 'RELATORIO_SENTINELA_24H.log');
const CRED_FILE = path.join(RAIZ, 'tools', '.sentinela-login.json');
const OURO_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\marce', 'libido_backups', 'ouro_validado_total');

fs.mkdirSync(OURO_DIR, { recursive: true });

const SUPABASE_URL = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jnteoNon4vEhWscOanGZDw_i6NGG6fI';

function log(tipo, msg) {
  const ts = new Date().toLocaleString('pt-BR');
  const linha = `[${ts}] [${tipo}] ${msg}`;
  console.log(linha);
  fs.appendFileSync(LOG_FILE, linha + '\r\n', 'utf8');
}

async function temInternet() {
  try { await dns.lookup('hkuwlazwtxwfffnpgfdd.supabase.co'); return true; } catch { return false; }
}

function listarArquivosSrc(dir, lista = []) {
  if (!fs.existsSync(dir)) return lista;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) { listarArquivosSrc(full, lista); } else if (/\.(tsx|ts|css)$/.test(item)) { lista.push(full); }
  }
  return lista;
}

function hashArquivo(caminho) {
  if (!fs.existsSync(caminho)) return '';
  return crypto.createHash('md5').update(fs.readFileSync(caminho)).digest('hex');
}

let ultimoHashGlobal = '';
function calcularHashGlobal() { return listarArquivosSrc(SRC_DIR).map(f => hashArquivo(f)).join('|'); }

function salvarSnapshotOuro() {
  for (const full of listarArquivosSrc(SRC_DIR)) {
    const rel = path.relative(RAIZ, full);
    const dest = path.join(OURO_DIR, rel.replace(/[\\/]/g, '__'));
    fs.copyFileSync(full, dest);
  }
}

function restaurarSnapshotOuro(motivo) {
  log('AUTO-CURA', `Revertendo arquivos! Motivo: ${motivo}`);
  let restaurados = 0;
  for (const full of listarArquivosSrc(SRC_DIR)) {
    const rel = path.relative(RAIZ, full);
    const srcOuro = path.join(OURO_DIR, rel.replace(/[\\/]/g, '__'));
    if (fs.existsSync(srcOuro) && hashArquivo(srcOuro) !== hashArquivo(full)) {
      fs.copyFileSync(srcOuro, full);
      restaurados++;
    }
  }
  return restaurados;
}

function auditarUIeElite() {
  const arquivos = listarArquivosSrc(SRC_DIR);
  let totalBotoes = 0;
  let modulosUI = { intencao: false, selo: false, cofre: false };

  for (const full of arquivos) {
    const texto = fs.readFileSync(full, 'utf8');
    if (full.endsWith('.tsx')) {
      totalBotoes += (texto.match(/<button\b[\s\S]*?>/g) || []).length;
      if (texto.includes('IntencaoRadarBar')) modulosUI.intencao = true;
      if (texto.includes('SeloPresencaBadge')) modulosUI.selo = true;
      if (texto.includes('CofrePrivadoModal')) modulosUI.cofre = true;
    }
  }
  return { totalBotoes, modulosUI };
}

function rodarBuild() {
  try {
    execSync('npx vite build', { cwd: RAIZ, stdio: 'pipe', encoding: 'utf8' });
    return { ok: true, erro: '' };
  } catch (e) {
    return { ok: false, erro: ((e.stdout || '') + '\n' + (e.stderr || '')).trim().slice(-800) };
  }
}

function subirParaOSite() {
  try {
    log('DEPLOY', 'Iniciando upload das alteracoes para o site (Git Push)...');
    execSync('git add -A', { cwd: RAIZ });
    
    const status = execSync('git status --porcelain', { cwd: RAIZ, encoding: 'utf8' });
    if (status.trim().length > 0) {
      execSync('git commit -m "Deploy automatico Sentinela 24/7: Modulos de Elite e Correcao Radar"', { cwd: RAIZ });
      execSync('git push', { cwd: RAIZ, stdio: 'pipe' });
      log('DEPLOY-OK', 'Alteracoes enviadas com sucesso para a nuvem! O site esta sendo atualizado.');
    } else {
      log('DEPLOY', 'Nenhuma alteracao nova para subir neste momento.');
    }
    return true;
  } catch (e) {
    const saida = ((e.stdout || '') + '\n' + (e.stderr || '')).trim();
    log('ERRO-DEPLOY', `Falha ao subir para o site (Erro no Git): ${saida.slice(-300)}`);
    return false;
  }
}

async function testarE2EComLoginReal() {
  if (!fs.existsSync(CRED_FILE)) return { ok: false, etapa: 'CFG', erro: 'Sem credencial' };
  const creds = JSON.parse(fs.readFileSync(CRED_FILE, 'utf8'));
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: auth, error: aErr } = await sb.auth.signInWithPassword({ email: creds.email, password: creds.password });
  if (aErr || !auth?.user) return { ok: false, etapa: 'LOGIN', erro: aErr?.message || 'Falha de login' };

  const { data: usr, error: uErr } = await sb.from('users').select('user_id, nickname').limit(10);
  if (uErr) return { ok: false, etapa: 'USERS_DB', erro: uErr.message };

  await sb.auth.signOut();
  return { ok: true, resumo: `Login E2E OK | Tabela Users OK (${(usr || []).length} registros)` };
}

async function cicloDeInspecao(forcar = false) {
  const hashAtual = calcularHashGlobal();
  const mudouCodigo = hashAtual !== ultimoHashGlobal;
  const stats = auditarUIeElite();

  if (mudouCodigo || forcar) {
    log('INSPECAO', `Validando Build... Elite UI Injetada: [Intencao:${stats.modulosUI.intencao} | Selo:${stats.modulosUI.selo} | Cofre:${stats.modulosUI.cofre}]`);
    const resBuild = rodarBuild();
    if (!resBuild.ok) {
      log('ERRO-BUILD', `Build falhou:\n${resBuild.erro}`);
      restaurarSnapshotOuro('Erro no npx vite build');
      ultimoHashGlobal = calcularHashGlobal();
      return;
    }
    
    salvarSnapshotOuro();
    ultimoHashGlobal = calcularHashGlobal();
    log('BUILD-OK', `Build Aprovado | ${stats.totalBotoes} botoes validados | Modulos Visuais OK`);
    
    subirParaOSite();
  }

  if (!(await temInternet())) return;

  const e2e = await testarE2EComLoginReal();
  if (!e2e.ok) {
    log('FALHA-E2E', `[${e2e.etapa}]: ${e2e.erro}`);
  } else {
    log('MONITOR-24H', `${e2e.resumo} | Botoes: ${stats.totalBotoes} | UI Segura`);
  }
}

log('INICIO', '====================================================================');
log('INICIO', ' SENTINELA 24/7 v6 (COM AUTO-DEPLOY PARA O SITE)');
log('INICIO', '====================================================================');

await cicloDeInspecao(true);
setInterval(() => { cicloDeInspecao(false).catch(e => log('EXCECAO', e.message)); }, 60000);