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

function rodarBuild() {
  try {
    execSync('npx vite build', { cwd: RAIZ, stdio: 'pipe', encoding: 'utf8' });
    return { ok: true, erro: '' };
  } catch (e) {
    return { ok: false, erro: ((e.stdout || '') + '\n' + (e.stderr || '')).trim().slice(-800) };
  }
}

// AUTO-DEPLOY BLINDADO
function subirParaOSite() {
  try {
    log('DEPLOY', 'Sincronizando com Vercel (Git Push Forcado)...');
    
    // Configura git caso nao esteja configurado e forca a adicao
    execSync('git config --global core.autocrlf false', { cwd: RAIZ });
    execSync('git add -A', { cwd: RAIZ });
    
    const status = execSync('git status --porcelain', { cwd: RAIZ, encoding: 'utf8' });
    if (status.trim().length > 0) {
      execSync('git commit -m "Automated Vercel Deploy: Busca Avancada e Otimizacao"', { cwd: RAIZ });
      
      // Força o envio direto para o repositório origin na branch main (Vercel)
      try {
        execSync('git push origin main', { cwd: RAIZ, stdio: 'pipe' });
      } catch (pushErr) {
        // Fallback caso a branch original se chame master
        execSync('git push origin master', { cwd: RAIZ, stdio: 'pipe' });
      }
      
      log('DEPLOY-OK', 'Alteracoes forcadas para a nuvem! O site (Vercel) esta atualizado.');
    } else {
      log('DEPLOY', 'Nenhuma mudanca para subir.');
    }
  } catch (e) {
    log('ERRO-DEPLOY', `Falha ao tentar forcar push: ${e.message}`);
  }
}

async function cicloDeInspecao() {
  const hashAtual = calcularHashGlobal();
  const mudouCodigo = hashAtual !== ultimoHashGlobal;

  if (mudouCodigo || ultimoHashGlobal === '') {
    log('INSPECAO', 'Validando arquivos...');
    const resBuild = rodarBuild();
    if (!resBuild.ok) {
      log('ERRO-BUILD', `Build quebrou: ${resBuild.erro}`);
      return;
    }
    
    ultimoHashGlobal = hashAtual;
    log('BUILD-OK', `Build Aprovado para producao.`);
    subirParaOSite();
  }

  if (!(await temInternet())) return;

  log('MONITOR-24H', `Sistema integro. Aguardando proximas alteracoes para Deploy automatico.`);
}

log('INICIO', '====================================================================');
log('INICIO', ' SENTINELA 24/7 v7 (AUTO-DEPLOY VERCEL BLINDADO + BUSCA AVANCADA)');
log('INICIO', '====================================================================');

await cicloDeInspecao();
setInterval(() => { cicloDeInspecao().catch(e => log('EXCECAO', e.message)); }, 60000);