/* ===== Reserva em Pé — plataforma 2D ===== */
const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');
const LARGURA = 480;
const ALTURA = 270;
const CHAO_Y = 232;
const LARGURA_MUNDO = 2400;

const GRAV = 0.55;
const PULO = -11;
const VEL = 2.4;
const PJ_L = 22;
const PJ_A = 30;

/* ===== Níveis (3 fases) ===== */
const FASES = [
  {
    nome: 'Fase 1 · Resistir',
    titulo: 'O empate: a arma dos que amam a floresta',
    texto: 'Nos anos 1980, os seringueiros do Acre criaram o "empate": famílias inteiras sentavam-se diante das motosserras para impedir a derrubada. Chico Mendes liderou essa resistência pacífica. Atravesse a floresta coletando moedas e extraia látex das seringueiras — a mata em pé paga a conta.',
    fato: 'O "empate" parou o desmatamento sem violência.',
    fonte: 'Memória dos empates · Acre',
    ceu: '#7ec8ff',
    colina: '#2f7a3d',
    chao: [[0, 820], [900, 780], [1720, 680]],
    plataformas: [[830, 180, 90], [1690, 185, 90]],
    coletaveis: [
      [180, 200], [320, 190], [480, 200], [620, 180], [760, 200],
      [980, 170], [1120, 200], [1260, 180], [1400, 200], [1560, 170],
      [1780, 200], [1920, 180], [2060, 200], [2200, 180]
    ],
    fogos: [[1150], [1900]],
    gados: [],
    seringueiras: [500, 1300, 2050],
    inicio: [60, 200],
    fim: [2320, 200]
  },
  {
    nome: 'Fase 2 · Construir',
    titulo: 'A Reserva Extrativista',
    texto: 'Em 1990 o Brasil criou a primeira Reserva Extrativista, no Acre, em homenagem a Chico Mendes. Ali, castanha, borracha e açaí são colhidos com a floresta em pé. Cuidado com o gado que avança sobre a mata!',
    fato: 'A floresta em pé gera renda sem derrubar uma árvore.',
    fonte: 'Resex Chico Mendes · Acre',
    ceu: '#8fd0ff',
    colina: '#3a8a45',
    chao: [[0, 640], [720, 600], [1400, 600], [2080, 320]],
    plataformas: [[650, 180, 90], [1330, 175, 90], [2010, 180, 100]],
    coletaveis: [
      [160, 200], [320, 180], [500, 200], [760, 170], [900, 200],
      [1060, 180], [1200, 200], [1450, 170], [1600, 200], [1750, 180],
      [1880, 200], [2140, 170], [2260, 200]
    ],
    fogos: [[1700]],
    gados: [
      { x: 900, min: 760, max: 1260, dir: 1 },
      { x: 1800, min: 1500, max: 1940, dir: -1 }
    ],
    seringueiras: [300, 1000, 1700, 2250],
    inicio: [60, 200],
    fim: [2300, 200]
  },
  {
    nome: 'Fase 3 · Consolidar',
    titulo: 'A floresta também forma lideranças',
    texto: 'Marina Silva, seringueira do Acre, tornou-se ministra do Meio Ambiente e mostrou ao mundo que a floresta forma lideranças. O período eleitoral é decisivo — atravesse o desafio final e consolide a vitória da floresta!',
    fato: 'Quem vive da floresta, a protege.',
    fonte: 'História do Acre',
    ceu: '#9bd6ff',
    colina: '#2f8a45',
    chao: [[0, 520], [600, 500], [1180, 480], [1740, 500], [2280, 120]],
    plataformas: [[530, 180, 90], [1110, 175, 90], [1670, 180, 90], [2250, 185, 80]],
    coletaveis: [
      [140, 200], [300, 180], [460, 200], [640, 170], [820, 200],
      [980, 175], [1220, 200], [1380, 170], [1520, 200], [1660, 180],
      [1780, 200], [1920, 175], [2060, 200], [2200, 180]
    ],
    fogos: [[1350], [2000]],
    gados: [
      { x: 700, min: 640, max: 1040, dir: 1 },
      { x: 1400, min: 1240, max: 1600, dir: -1 },
      { x: 1900, min: 1800, max: 2180, dir: 1 }
    ],
    seringueiras: [250, 850, 1500, 2000, 2320],
    inicio: [60, 200],
    fim: [2340, 200]
  }
];

/* ===== Estado ===== */
let faseAtual = 0;
let pontos = 0;
let vidas = 3;
let fasesDesbloqueadas = 1;
let estado = 'inicio'; // inicio | mapa | fase | jogando | fim

let jogador = { x: 60, y: 200, vx: 0, vy: 0, noChao: false, invencivel: false, invTimer: 0, olhandoDir: 1 };
let plataformas = [];
let coletaveis = [];
let fogos = [];
let gados = [];
let seringueiras = [];
let feedbacks = [];
let cameraX = 0;

const teclas = { esq: false, dir: false };
let controlesTouchAtivos = false;

/* ===== Elementos ===== */
const el = {
  hud: document.getElementById('hud2d'),
  hudFase: document.getElementById('hud-fase'),
  hudPontos: document.getElementById('hud-pontos-valor'),
  hudVidas: document.getElementById('hud-vidas'),
  telaInicio: document.getElementById('tela-inicio'),
  telaMapa: document.getElementById('tela-mapa'),
  telaFase: document.getElementById('tela-fase'),
  telaFim: document.getElementById('tela-fim'),
  faseEtiqueta: document.getElementById('fase-etiqueta'),
  faseTitulo: document.getElementById('fase-titulo'),
  faseTexto: document.getElementById('fase-texto'),
  faseFato: document.getElementById('fase-fato'),
  faseFonte: document.getElementById('fase-fonte'),
  fimTitulo: document.getElementById('fim-titulo'),
  fimMensagem: document.getElementById('fim-mensagem')
};

/* ===== Carregar fase ===== */
function carregarFase(i) {
  const f = FASES[i];
  plataformas = [];
  f.chao.forEach(([x, w]) => {
    plataformas.push({ x, y: CHAO_Y, w, h: ALTURA - CHAO_Y });
  });
  f.plataformas.forEach(([x, y, w]) => {
    plataformas.push({ x, y, w, h: 16 });
  });
  coletaveis = f.coletaveis.map(([x, y]) => ({ x, y, vivo: true }));
  fogos = f.fogos.map(([x]) => ({ x, y: CHAO_Y - 22 }));
  gados = f.gados.map((g) => ({ ...g, y: CHAO_Y - 30 }));
  seringueiras = (f.seringueiras || []).map((x) => ({ x, y: CHAO_Y, extraida: false }));
  feedbacks = [];
  reposicionarInicio();
  cameraX = 0;
}

function reposicionarInicio() {
  const f = FASES[faseAtual];
  jogador.x = f.inicio[0];
  jogador.y = f.inicio[1];
  jogador.vx = 0;
  jogador.vy = 0;
  jogador.noChao = false;
}

/* ===== Fluxo ===== */
function iniciarJogo() {
  faseAtual = 0;
  pontos = 0;
  vidas = 3;
  fasesDesbloqueadas = 1;
  el.telaInicio.hidden = true;
  el.telaFim.hidden = true;
  el.hud.hidden = false;
  iniciarMusica();
  mostrarMapa();
}

function mostrarMapa() {
  estado = 'mapa';
  el.telaMapa.hidden = false;
  atualizarMapa();
}

function atualizarMapa() {
  for (let i = 0; i < FASES.length; i++) {
    const nodo = document.getElementById('nodo-' + i);
    const desbloqueada = i < fasesDesbloqueadas;
    nodo.disabled = !desbloqueada;
    nodo.classList.toggle('bloqueado', !desbloqueada);
    nodo.querySelector('.cadeado').hidden = desbloqueada;
  }
}

function jogarFase(i) {
  faseAtual = i;
  el.telaMapa.hidden = true;
  carregarFase(i);
  mostrarIntroFase();
}

function mostrarIntroFase() {
  const f = FASES[faseAtual];
  el.faseEtiqueta.textContent = f.nome;
  el.faseTitulo.textContent = f.titulo;
  el.faseTexto.textContent = f.texto;
  el.faseFato.textContent = f.fato;
  el.faseFonte.textContent = f.fonte;
  el.telaFase.hidden = false;
  estado = 'fase';
}

function continuarFase() {
  el.telaFase.hidden = true;
  estado = 'jogando';
}

function completarFase() {
  pontos += 100;
  if (faseAtual < FASES.length - 1) {
    fasesDesbloqueadas = Math.max(fasesDesbloqueadas, faseAtual + 2);
    mostrarMapa();
  } else {
    vencer();
  }
}

function vencer() {
  estado = 'fim';
  el.telaFim.hidden = false;
  el.fimTitulo.textContent = '🏆 Floresta em pé! Você venceu.';
  el.fimMensagem.textContent = `Maximiano resgatou a princesa Oscarina! Você atravessou as 3 fases com ${pontos} pontos. Os empates, a educação e o voto venceram o desmatamento. Chico Mendes ficaria orgulhoso.`;
  somVitoria();
}

function gameOver() {
  estado = 'fim';
  el.telaFim.hidden = false;
  el.fimTitulo.textContent = 'A floresta está em perigo...';
  el.fimMensagem.textContent = 'O gado e as queimadas venceram desta vez — mas a luta pela justiça climática continua.';
}

function machucar() {
  if (jogador.invencivel) return;
  vidas -= 1;
  if (vidas <= 0) {
    somDerrota();
    gameOver();
    return;
  }
  somMachucar();
  jogador.invencivel = true;
  jogador.invTimer = 90;
  reposicionarInicio();
  atualizarHud();
}

function atualizarHud() {
  el.hudFase.textContent = FASES[faseAtual].nome;
  el.hudPontos.textContent = pontos;
  el.hudVidas.textContent = '❤️'.repeat(Math.max(0, vidas)) + '🖤'.repeat(Math.max(0, 3 - vidas));
}

/* ===== Física ===== */
function atualizar() {
  const p = jogador;

  if (p.invencivel) {
    p.invTimer -= 1;
    if (p.invTimer <= 0) p.invencivel = false;
  }

  let mover = 0;
  if (teclas.esq) mover -= 1;
  if (teclas.dir) mover += 1;
  p.vx = mover * VEL;
  if (mover !== 0) p.olhandoDir = mover > 0 ? 1 : -1;

  p.x += p.vx;
  p.x = Math.max(0, Math.min(LARGURA_MUNDO - PJ_L, p.x));

  p.vy += GRAV;
  if (p.vy > 12) p.vy = 12;
  p.y += p.vy;

  p.noChao = false;
  for (const plat of plataformas) {
    if (
      p.x + PJ_L > plat.x && p.x < plat.x + plat.w &&
      p.y + PJ_A > plat.y && p.y + PJ_A - p.vy <= plat.y + 8 &&
      p.vy >= 0
    ) {
      p.y = plat.y - PJ_A;
      p.vy = 0;
      p.noChao = true;
    }
  }

  if (p.y > ALTURA + 60) {
    machucar();
    return;
  }

  // coleta
  for (const c of coletaveis) {
    if (!c.vivo) continue;
    if (
      p.x < c.x + 14 && p.x + PJ_L > c.x - 14 &&
      p.y < c.y + 14 && p.y + PJ_A > c.y - 14
    ) {
      c.vivo = false;
      pontos += 10;
      somMoeda();
      atualizarHud();
    }
  }

  // gado
  for (const g of gados) {
    g.x += g.dir * 1.4;
    if (g.x < g.min) { g.x = g.min; g.dir = 1; }
    if (g.x > g.max) { g.x = g.max; g.dir = -1; }
    if (colideJogador(g.x - 18, g.y, 36, 30)) {
      machucar();
      return;
    }
  }

  // fogo
  for (const f of fogos) {
    if (colideJogador(f.x, f.y, 20, 22)) {
      machucar();
      return;
    }
  }

  // objetivo
  const fim = FASES[faseAtual].fim;
  if (p.x + PJ_L > fim[0] && p.x < fim[0] + 22) {
    completarFase();
    return;
  }

  for (const fb of feedbacks) {
    fb.y -= 0.5;
    fb.vida -= 1;
  }
  feedbacks = feedbacks.filter((fb) => fb.vida > 0);

  cameraX = Math.max(0, Math.min(LARGURA_MUNDO - LARGURA, p.x - LARGURA / 2));
}

function colideJogador(x, y, w, h) {
  const p = jogador;
  return p.x < x + w && p.x + PJ_L > x && p.y < y + h && p.y + PJ_A > y;
}

function pular() {
  if (estado !== 'jogando') return;
  if (jogador.noChao) {
    jogador.vy = PULO;
    jogador.noChao = false;
    somPulo();
  }
}

function seringueiraProxima() {
  const p = jogador;
  for (const s of seringueiras) {
    if (s.extraida) continue;
    if (Math.abs(p.x + PJ_L / 2 - s.x) < 40) return s;
  }
  return null;
}

function extrairLatexProximo() {
  if (estado !== 'jogando') return;
  const s = seringueiraProxima();
  if (!s) return;
  s.extraida = true;
  pontos += 25;
  somLatex();
  adicionarFeedback(s.x, CHAO_Y - 68, '+25 LATEX');
  atualizarHud();
}

/* ===== Desenho ===== */
function desenhar() {
  const f = FASES[faseAtual];

  // céu
  const grad = ctx.createLinearGradient(0, 0, 0, ALTURA);
  grad.addColorStop(0, f.ceu);
  grad.addColorStop(1, '#d6f0c0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // sol
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(400, 26, 26, 26);

  desenharNuvens();

  // colinas distantes (parallax)
  ctx.fillStyle = f.colina;
  for (let i = 0; i < 6; i++) {
    const cx = i * 180 - (cameraX * 0.3) % 180;
    ctx.beginPath();
    ctx.moveTo(cx - 90, ALTURA);
    ctx.lineTo(cx, 120 + (i % 2) * 30);
    ctx.lineTo(cx + 90, ALTURA);
    ctx.closePath();
    ctx.fill();
  }

  desenharArvores();
  desenharPlataformas();
  desenharSeringueiras();
  desenharObjetivo();
  desenharColetaveis();
  desenharFogos();
  desenharGados();
  desenharJogador();
  desenharFeedbacks();
  desenharPromptLatex();
}

function desenharNuvens() {
  const desloca = (Date.now() * 0.01 + cameraX * 0.2) % 900;
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 160 - desloca) % 900 + 900) % 900 - 80;
    const cy = 22 + (i % 3) * 26;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx, cy, 38, 10);
    ctx.fillRect(cx + 8, cy - 8, 20, 8);
    ctx.fillRect(cx + 4, cy - 4, 30, 6);
  }
}

function desenharRotulo(x, y, texto) {
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillText(texto, x + 1, y + 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(texto, x, y);
}

function desenharPromptLatex() {
  if (estado !== 'jogando') return;
  const s = seringueiraProxima();
  if (!s) return;
  const x = s.x - cameraX;
  const y = CHAO_Y - 64;
  const tecla = controlesTouchAtivos ? 'B' : 'E';
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x - 9, y - 9, 18, 18);
  ctx.fillStyle = '#1a1020';
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tecla, x, y);
}

function desenharArvores() {
  const offset = cameraX * 0.45;
  const espaco = 44;
  const primeiro = Math.floor(offset / espaco) - 1;
  for (let i = primeiro; i < primeiro + 14; i++) {
    const semente = (i * 2654435761) >>> 0;
    const x = i * espaco - offset + (semente % 20) - 10;
    const altura = 44 + (semente % 5) * 9;
    const largura = 20 + (semente % 3) * 5;
    const topo = ALTURA - altura;

    // tronco
    ctx.fillStyle = '#3a2513';
    ctx.fillRect(x + largura / 2 - 2, topo, 4, altura);

    // copa em camadas
    ctx.fillStyle = '#1e4a28';
    ctx.fillRect(x, topo - 12, largura, 12);
    ctx.fillStyle = '#2a6133';
    ctx.fillRect(x + 4, topo - 22, largura - 8, 10);
    ctx.fillStyle = '#357a3e';
    ctx.fillRect(x + 7, topo - 30, largura - 14, 8);
  }
}

function desenharPlataformas() {
  for (const plat of plataformas) {
    const x = plat.x - cameraX;
    // terra
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(x, plat.y, plat.w, plat.h);
    // grama (topo)
    ctx.fillStyle = '#3fae58';
    ctx.fillRect(x, plat.y, plat.w, 6);
    ctx.fillStyle = '#2f7a3d';
    ctx.fillRect(x, plat.y + 6, plat.w, 2);
  }
}

function desenharColetaveis() {
  for (const c of coletaveis) {
    if (!c.vivo) continue;
    const t = Date.now() * 0.01;
    const escala = Math.abs(Math.cos(t + c.x * 0.05));
    const cx = c.x - cameraX;
    const cy = c.y + Math.sin(t * 0.8 + c.x) * 2;
    desenharMoeda(cx, cy, escala);
  }
}

function desenharMoeda(cx, cy, escala) {
  const r = 7;
  const w = Math.max(1, Math.round(r * (0.25 + escala * 0.75)));
  ctx.fillStyle = '#c89400';
  ctx.fillRect(cx - w, cy - r, w * 2, r * 2);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(cx - w + 1, cy - r + 1, w * 2 - 2, r * 2 - 2);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(cx - Math.max(1, w - 1), cy - 2, Math.max(1, (w - 1) * 2), 2);
}

function desenharSeringueiras() {
  for (const s of seringueiras) {
    const x = s.x - cameraX;
    const base = CHAO_Y;
    const h = 48;
    // tronco
    ctx.fillStyle = '#8a6a45';
    ctx.fillRect(x + 6, base - h, 8, h);
    // corte para sangria
    ctx.fillStyle = '#e8d8b0';
    ctx.fillRect(x + 3, base - h + 12, 14, 3);
    // copa
    ctx.fillStyle = '#2a6e35';
    ctx.fillRect(x, base - h - 14, 20, 14);
    ctx.fillStyle = '#357a3e';
    ctx.fillRect(x + 4, base - h - 20, 12, 6);
    // tigela (copo coletor)
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(x + 2, base - 5, 16, 5);
    // látex escorrendo
    if (!s.extraida) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 9, base - h + 16, 3, 10);
    }
  }
}

function adicionarFeedback(x, y, texto) {
  feedbacks.push({ x, y, texto, vida: 50 });
}

function desenharFeedbacks() {
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const fb of feedbacks) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(fb.texto, fb.x - cameraX, fb.y);
  }
}

function desenharFogos() {
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const fg of fogos) {
    const fl = Math.sin(Date.now() * 0.02 + fg.x) * 2;
    ctx.fillText('🔥', fg.x - cameraX + 10, fg.y + 11 + fl * 0.4);
  }
}

function desenharGados() {
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const g of gados) {
    ctx.save();
    ctx.translate(g.x - cameraX + 18, g.y + 15);
    ctx.scale(g.dir < 0 ? -1 : 1, 1);
    ctx.fillText('🐄', 0, 0);
    ctx.restore();
  }
}

function desenharObjetivo() {
  const fim = FASES[faseAtual].fim;
  const x = fim[0] - cameraX;
  const base = CHAO_Y;

  // princesa Oscarina
  ctx.fillStyle = '#e84393';
  ctx.fillRect(x + 2, base - 20, 16, 20);
  ctx.fillStyle = '#c0307a';
  ctx.fillRect(x, base - 6, 20, 6);
  // cabeça
  ctx.fillStyle = '#e8b882';
  ctx.fillRect(x + 5, base - 30, 10, 11);
  // cabelo
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(x + 4, base - 32, 12, 4);
  // coroa
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x + 7, base - 35, 6, 3);

  desenharRotulo(x + 10, base - 44, 'OSCARINA');
}

function desenharJogador() {
  const p = jogador;
  if (p.invencivel && Math.floor(Date.now() / 100) % 2 === 0) return;
  const x = Math.round(p.x - cameraX);
  const y = Math.round(p.y);

  // macacão azul (pernas)
  ctx.fillStyle = '#2449c9';
  ctx.fillRect(x + 4, y + 21, 6, 9);
  ctx.fillRect(x + 12, y + 21, 6, 9);
  // sapatos
  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(x + 4, y + 27, 6, 3);
  ctx.fillRect(x + 12, y + 27, 6, 3);

  // camisa vermelha
  ctx.fillStyle = '#e8412c';
  ctx.fillRect(x + 3, y + 10, 16, 13);

  // braço + mão
  ctx.fillStyle = '#e8412c';
  ctx.fillRect(p.olhandoDir > 0 ? x + 17 : x - 1, y + 11, 3, 7);
  ctx.fillStyle = '#e8b882';
  ctx.fillRect(p.olhandoDir > 0 ? x + 17 : x - 1, y + 17, 3, 3);

  // cabeça
  ctx.fillStyle = '#e8b882';
  ctx.fillRect(x + 5, y, 12, 11);

  // boné vermelho
  ctx.fillStyle = '#e8412c';
  ctx.fillRect(x + 3, y, 16, 4);
  ctx.fillRect(x + 5, y - 2, 12, 3);

  // poronga (lâmpada de cabeça dos seringueiros)
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(x + 3, y - 5, 16, 3);
  ctx.fillStyle = '#c89450';
  ctx.fillRect(x + 7, y - 10, 7, 6);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(x + 8, y - 9, 4, 2);
  const fl = Math.floor(Date.now() / 140) % 3;
  ctx.fillStyle = '#ff9f1a';
  ctx.fillRect(x + 9, y - 12 - fl, 2, 3);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x + 10, y - 11 - fl, 1, 2);

  // olho
  ctx.fillStyle = '#1d3320';
  ctx.fillRect(p.olhandoDir > 0 ? x + 13 : x + 6, y + 5, 3, 3);

  desenharRotulo(x + 11, y - 20, 'MAXIMIANO');
}

function loop() {
  requestAnimationFrame(loop);
  if (estado === 'jogando') {
    atualizar();
  }
  desenhar();
  if (estado === 'jogando') atualizarHud();
}

/* ===== Entrada ===== */
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') teclas.esq = true;
  if (k === 'arrowright' || k === 'd') teclas.dir = true;
  if (k === 'arrowup' || k === 'w' || k === ' ') {
    e.preventDefault();
    pular();
  }
  if (k === 'e') extrairLatexProximo();
  if (k === 'enter') {
    if (estado === 'inicio') iniciarJogo();
    else if (estado === 'fase') continuarFase();
    else if (estado === 'fim') reiniciar();
  }
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') teclas.esq = false;
  if (k === 'arrowright' || k === 'd') teclas.dir = false;
});

function configurarTouch() {
  const ehToque = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!ehToque) return;
  controlesTouchAtivos = true;
  document.getElementById('touch-controles').hidden = false;

  const moverBtns = document.querySelectorAll('.touch-mover .tbtn');
  moverBtns.forEach((btn) => {
    const dir = btn.dataset.dir;
    const apertar = () => { teclas[dir] = true; btn.classList.add('on'); };
    const soltar = () => { teclas[dir] = false; btn.classList.remove('on'); };
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); apertar(); }, { passive: false });
    btn.addEventListener('touchend', soltar);
    btn.addEventListener('touchcancel', soltar);
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); apertar(); });
    btn.addEventListener('pointerup', soltar);
    btn.addEventListener('pointercancel', soltar);
    btn.addEventListener('pointerleave', soltar);
  });

  const pulo = document.getElementById('botao-pulo');
  const pularAgora = (e) => { e.preventDefault(); pular(); pulo.classList.add('on'); };
  const soltarPulo = () => pulo.classList.remove('on');
  pulo.addEventListener('touchstart', pularAgora, { passive: false });
  pulo.addEventListener('touchend', soltarPulo);
  pulo.addEventListener('pointerdown', pularAgora);
  pulo.addEventListener('pointerup', soltarPulo);
  pulo.addEventListener('pointercancel', soltarPulo);

  const latex = document.getElementById('botao-latex');
  const extrairAgora = (e) => { e.preventDefault(); extrairLatexProximo(); latex.classList.add('on'); };
  const soltarLatex = () => latex.classList.remove('on');
  latex.addEventListener('touchstart', extrairAgora, { passive: false });
  latex.addEventListener('touchend', soltarLatex);
  latex.addEventListener('pointerdown', extrairAgora);
  latex.addEventListener('pointerup', soltarLatex);
  latex.addEventListener('pointercancel', soltarLatex);
}

function reiniciar() {
  el.telaFim.hidden = true;
  iniciarJogo();
}

/* ===== Música (chiptune via Web Audio) ===== */
const NOTAS = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00,
  A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  B5: 987.77, E6: 1318.51, C6: 1046.50
};

const MELODIA = [
  ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['G4', 1], ['A4', 1], ['C5', 1],
  ['D5', 1], ['C5', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['G4', 1], ['A4', 1], ['E4', 1]
];

const BAIXO = [
  ['C3', 2], ['G3', 2], ['A3', 2], ['G3', 2], ['C3', 2], ['G3', 2], ['F3', 2], ['G3', 2]
];

let audioCtx = null;
let musicaLigada = false;
let indiceMelodia = 0;
let proximoTempo = 0;
let timerMusica = null;
const BPM = 132;
const SEG_BATIDA = 60 / BPM;

function tocarNota(freq, quando, dur, tipo, volume) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, quando);
  g.gain.setValueAtTime(0.0001, quando);
  g.gain.exponentialRampToValueAtTime(volume, quando + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(quando);
  osc.stop(quando + dur + 0.02);
}

function agendarNotas() {
  while (proximoTempo < audioCtx.currentTime + 0.3) {
    const [notaM, durM] = MELODIA[indiceMelodia % MELODIA.length];
    tocarNota(NOTAS[notaM], proximoTempo, durM * SEG_BATIDA, 'square', 0.08);
    if (indiceMelodia % 2 === 0) {
      const iB = Math.floor(indiceMelodia / 2) % BAIXO.length;
      tocarNota(NOTAS[BAIXO[iB][0]], proximoTempo, 2 * SEG_BATIDA, 'triangle', 0.13);
    }
    proximoTempo += durM * SEG_BATIDA;
    indiceMelodia += 1;
  }
}

function iniciarMusica() {
  if (musicaLigada) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  musicaLigada = true;
  indiceMelodia = 0;
  proximoTempo = audioCtx.currentTime + 0.05;
  timerMusica = setInterval(agendarNotas, 120);
  document.getElementById('botao-som').textContent = '🔊';
}

function pararMusica() {
  musicaLigada = false;
  if (timerMusica) { clearInterval(timerMusica); timerMusica = null; }
}

function alternarMusica() {
  if (musicaLigada) {
    pararMusica();
    document.getElementById('botao-som').textContent = '🔇';
  } else {
    iniciarMusica();
  }
}

function garantirAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return true;
}

function somMoeda() {
  if (!garantirAudio()) return;
  const agora = audioCtx.currentTime;
  tocarNota(NOTAS.B5, agora, 0.08, 'square', 0.12);
  tocarNota(NOTAS.E6, agora + 0.06, 0.15, 'square', 0.12);
}

function somLatex() {
  if (!garantirAudio()) return;
  const agora = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(520, agora);
  osc.frequency.exponentialRampToValueAtTime(180, agora + 0.18);
  g.gain.setValueAtTime(0.0001, agora);
  g.gain.exponentialRampToValueAtTime(0.2, agora + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, agora + 0.2);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(agora);
  osc.stop(agora + 0.22);
}

function somPulo() {
  if (!garantirAudio()) return;
  const agora = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, agora);
  osc.frequency.exponentialRampToValueAtTime(660, agora + 0.12);
  g.gain.setValueAtTime(0.0001, agora);
  g.gain.exponentialRampToValueAtTime(0.15, agora + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, agora + 0.14);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(agora);
  osc.stop(agora + 0.15);
}

function somMachucar() {
  if (!garantirAudio()) return;
  const agora = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, agora);
  osc.frequency.exponentialRampToValueAtTime(80, agora + 0.25);
  g.gain.setValueAtTime(0.0001, agora);
  g.gain.exponentialRampToValueAtTime(0.18, agora + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, agora + 0.28);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(agora);
  osc.stop(agora + 0.3);
}

function somDerrota() {
  if (!garantirAudio()) return;
  const agora = audioCtx.currentTime;
  [NOTAS.G4, NOTAS.E4, NOTAS.C4].forEach((f, i) => {
    tocarNota(f, agora + i * 0.18, 0.22, 'triangle', 0.12);
  });
}

function somVitoria() {
  if (!garantirAudio()) return;
  const agora = audioCtx.currentTime;
  [NOTAS.C5, NOTAS.E5, NOTAS.G5, NOTAS.C6].forEach((f, i) => {
    tocarNota(f, agora + i * 0.12, 0.18, 'square', 0.12);
  });
}

/* ===== Ligações ===== */
document.getElementById('botao-iniciar').addEventListener('click', iniciarJogo);
document.getElementById('botao-continuar').addEventListener('click', continuarFase);
document.getElementById('botao-reiniciar').addEventListener('click', reiniciar);
document.getElementById('botao-som').addEventListener('click', alternarMusica);

for (let i = 0; i < FASES.length; i++) {
  document.getElementById('nodo-' + i).addEventListener('click', () => jogarFase(i));
}

configurarTouch();
atualizarHud();
loop();
