/* ===== Caminhos da Seringa — plataforma 2D ===== */
const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');
const LARGURA = 480;
const ALTURA = 270;
const CHAO_Y = 232;
const LARGURA_MUNDO = 2400;

const GRAV = 0.5;
const PULO = -11;
const VEL = 2.4;
const PJ_L = 22;
const PJ_A = 30;

/* ===== Layouts reutilizáveis ===== */
const CHAO_EASY = [[0, 820], [900, 780], [1720, 680]];
const PLAT_EASY = [[830, 180, 90], [1690, 185, 90]];
const CHAO_MED = [[0, 640], [720, 600], [1400, 600], [2080, 320]];
const PLAT_MED = [[650, 180, 90], [1330, 175, 90], [2010, 180, 100]];
const CHAO_HARD = [[0, 520], [600, 500], [1180, 480], [1740, 500], [2280, 120]];
const PLAT_HARD = [[530, 180, 90], [1110, 175, 90], [1670, 180, 90], [2250, 185, 80]];

function distribuirMoedas(chao) {
  const moedas = [];
  for (const [x, w] of chao) {
    for (let i = 1; i <= 3; i++) {
      moedas.push([x + (w * i) / 4, 198]);
    }
  }
  return moedas;
}

function distribuirSeringueiras(chao) {
  return chao.map(([x, w]) => x + Math.floor(w / 2));
}

/* ===== Níveis (8 fases em 4 capítulos) ===== */
const FASES = [
  {
    nome: 'Fase 1', curto: 'Chegada', emoji: '🌱', capitulo: 'O ciclo da borracha',
    personagem: 'Raimundo', registro: 'O território',
    titulo: 'Uma floresta com muitas histórias',
    texto: 'Final do século XIX. Raimundo, migrante nordestino, chega ao Acre procurando trabalho. Mas esta floresta já era habitada por povos indígenas muito antes dos seringais. Siga a trilha até a moradia e recolha as pistas sobre o território.',
    fato: 'A expansão dos seringais envolveu expulsões e violências contra povos indígenas.',
    fonte: 'Museu da Borracha · Governo do Acre',
    ceu: '#7ec8ff', colina: '#2f7a3d',
    chao: CHAO_EASY, plataformas: PLAT_EASY, fogos: [], gados: [],
    inicio: [60, 200], fim: [2320, 200]
  },
  {
    nome: 'Fase 2', curto: 'Seringa', emoji: '🔦', capitulo: 'O ciclo da borracha',
    personagem: 'Raimundo', registro: 'O trabalho',
    titulo: 'A estrada de seringa',
    texto: 'A estrada de seringa é um percurso de trabalho. Ao amanhecer, com a poronga acesa, percorra a rota e colete o látex das seringueiras — com cuidado, para não ferir as árvores.',
    fato: 'Poronga, cabrita e tigelas integram a representação do trabalho seringueiro no Museu da Borracha.',
    fonte: 'Diagnóstico socioeconômico · Seplan',
    ceu: '#8fd0ff', colina: '#3a8a45',
    chao: CHAO_EASY, plataformas: PLAT_EASY,
    fogos: [], gados: [{ x: 1100, min: 960, max: 1560, dir: 1 }],
    inicio: [60, 200], fim: [2320, 200]
  },
  {
    nome: 'Fase 3', curto: 'Barracão', emoji: '📒', capitulo: 'Trabalho e dívida',
    personagem: 'Raimundo', registro: 'O aviamento',
    titulo: 'A conta do barracão',
    texto: 'No sistema de aviamento, o barracão fornecia mercadorias e recebia a borracha — e a dívida raramente acabava. Acompanhe a produção e descubra por que a conta nunca fechava.',
    fato: 'O endividamento recorrente subordinava os seringueiros ao controle dos seringalistas.',
    fonte: 'Diagnóstico socioeconômico · Seplan',
    ceu: '#a0d8ff', colina: '#357a3e',
    chao: CHAO_MED, plataformas: PLAT_MED,
    fogos: [], gados: [{ x: 900, min: 760, max: 1260, dir: 1 }],
    inicio: [60, 200], fim: [2300, 200]
  },
  {
    nome: 'Fase 4', curto: 'Crise', emoji: '📉', capitulo: 'Trabalho e dívida',
    personagem: 'Raimundo', registro: 'A crise',
    titulo: 'Quando a borracha perde valor',
    texto: 'A partir da década de 1910, a borracha plantada na Ásia derrubou o preço da produção amazônica. Organize os recursos e ajude as famílias a atravessar a crise.',
    fato: 'A crise não extinguiu imediatamente o aviamento.',
    fonte: 'Diagnóstico socioeconômico · Seplan',
    ceu: '#9bd6ff', colina: '#2f8a45',
    chao: CHAO_MED, plataformas: PLAT_MED,
    fogos: [], gados: [
      { x: 900, min: 760, max: 1260, dir: 1 },
      { x: 1800, min: 1500, max: 1940, dir: -1 }
    ],
    inicio: [60, 200], fim: [2300, 200]
  },
  {
    nome: 'Fase 5', curto: 'Guerra', emoji: '🪖', capitulo: 'Guerra e resistência',
    personagem: 'Antônio', registro: 'Soldados da borracha',
    titulo: 'Soldados da borracha',
    texto: 'Na Segunda Guerra, trabalhadores foram mobilizados para produzir borracha na Amazônia. Antônio chega à colocação e descobre que o esforço de guerra não garantia direitos.',
    fato: 'O Governo do Acre registra trajetórias reais de soldados da borracha em Rio Branco, Xapuri e Plácido de Castro.',
    fonte: 'Documentário "Soldados da Borracha" · Governo do Acre',
    ceu: '#87c4e8', colina: '#2f7a3d',
    chao: CHAO_MED, plataformas: PLAT_MED,
    fogos: [[1700]], gados: [
      { x: 900, min: 760, max: 1260, dir: 1 },
      { x: 1800, min: 1500, max: 1940, dir: -1 }
    ],
    inicio: [60, 200], fim: [2300, 200]
  },
  {
    nome: 'Fase 6', curto: 'Ameaça', emoji: '🌳', capitulo: 'Guerra e resistência',
    personagem: 'Rosa', registro: 'A luta pela terra',
    titulo: 'A floresta ameaçada',
    texto: 'Década de 1970. O avanço do desmatamento impulsiona a organização dos seringueiros. Rosa visita as famílias para levá-las à reunião comunitária — e preparar a luta pela permanência na terra.',
    fato: 'Wilson Pinheiro e Chico Mendes participaram dessa luta, ligada aos sindicatos e aos empates.',
    fonte: 'Registro do projeto documental sobre os empates · Governo do Acre',
    ceu: '#7ec8ff', colina: '#3a8a45',
    chao: CHAO_HARD, plataformas: PLAT_HARD,
    fogos: [], gados: [
      { x: 700, min: 640, max: 1040, dir: 1 },
      { x: 1400, min: 1240, max: 1600, dir: -1 }
    ],
    inicio: [60, 200], fim: [2340, 200]
  },
  {
    nome: 'Fase 7', curto: 'Empate', emoji: '✊', capitulo: 'Empate e floresta em pé',
    personagem: 'Rosa', registro: 'Os empates',
    titulo: 'O empate: força coletiva',
    texto: 'Os empates mobilizaram famílias para impedir derrubadas sem violência. Reúna os participantes, proteja o grupo e alcance a suspensão do desmatamento.',
    fato: 'Depoimentos do projeto documental ressaltam o caráter não violento do movimento.',
    fonte: 'Registro do projeto documental sobre os empates · Governo do Acre',
    ceu: '#8fd0ff', colina: '#2f7a3d',
    chao: CHAO_HARD, plataformas: PLAT_HARD,
    fogos: [[1350]], gados: [
      { x: 700, min: 640, max: 1040, dir: 1 },
      { x: 1400, min: 1240, max: 1600, dir: -1 },
      { x: 1900, min: 1800, max: 2180, dir: 1 }
    ],
    inicio: [60, 200], fim: [2340, 200]
  },
  {
    nome: 'Fase 8', curto: 'Reserva', emoji: '🌲', capitulo: 'Empate e floresta em pé',
    personagem: 'Rosa', registro: 'A floresta em pé',
    titulo: 'A floresta em pé',
    texto: 'Em 1990 nasce a Reserva Extrativista Chico Mendes: permanecer no território e trabalhar com a floresta em pé. Complete o último percurso e reúna as memórias da jornada.',
    fato: 'A Reserva Extrativista Chico Mendes foi criada pelo Decreto nº 99.144, de 12 de março de 1990.',
    fonte: 'Decreto nº 99.144/1990 · ICMBio',
    ceu: '#a0d8ff', colina: '#357a3e',
    chao: CHAO_HARD, plataformas: PLAT_HARD,
    fogos: [[1350], [2000]], gados: [
      { x: 700, min: 640, max: 1040, dir: 1 },
      { x: 1400, min: 1240, max: 1600, dir: -1 },
      { x: 1900, min: 1800, max: 2180, dir: 1 }
    ],
    inicio: [60, 200], fim: [2340, 200]
  }
];

const CAPITULOS = ['O ciclo da borracha', 'Trabalho e dívida', 'Guerra e resistência', 'Empate e floresta em pé'];

/* ===== Estado ===== */
let faseAtual = 0;
let pontos = 0;
let vidas = 3;
let fasesDesbloqueadas = 1;
let registros = [];
let cadernoAberto = false;
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
  telaCaderno: document.getElementById('tela-caderno'),
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
  coletaveis = distribuirMoedas(f.chao).map(([x, y]) => ({ x, y, vivo: true }));
  fogos = f.fogos.map(([x]) => ({ x, y: CHAO_Y - 22 }));
  gados = f.gados.map((g) => ({ ...g, y: CHAO_Y - 30 }));
  seringueiras = distribuirSeringueiras(f.chao).map((x) => ({ x, y: CHAO_Y, extraida: false }));
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
  registros = [];
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

function montarMapa() {
  const mapa = document.getElementById('mapa');
  mapa.innerHTML = '';
  let indice = 0;
  CAPITULOS.forEach((capNome, ci) => {
    const cap = document.createElement('div');
    cap.className = 'capitulo';
    const capTitulo = document.createElement('div');
    capTitulo.className = 'cap-nome';
    capTitulo.textContent = 'Capítulo ' + (ci + 1) + ' · ' + capNome;
    cap.appendChild(capTitulo);
    const capNodos = document.createElement('div');
    capNodos.className = 'cap-nodos';
    for (let j = 0; j < 2 && indice < FASES.length; j++) {
      const idx = indice;
      const f = FASES[idx];
      const nodo = document.createElement('button');
      nodo.className = 'nodo';
      nodo.id = 'nodo-' + idx;
      nodo.innerHTML = `
        <span class="nodo-emoji">${f.emoji}</span>
        <span class="nodo-num">${idx + 1}</span>
        <span class="nodo-nome">${f.curto}</span>
        <span class="cadeado">🔒</span>
      `;
      nodo.addEventListener('click', () => jogarFase(idx));
      capNodos.appendChild(nodo);
      indice++;
    }
    cap.appendChild(capNodos);
    mapa.appendChild(cap);
  });
}

function atualizarMapa() {
  for (let i = 0; i < FASES.length; i++) {
    const nodo = document.getElementById('nodo-' + i);
    const desbloqueada = i < fasesDesbloqueadas;
    nodo.disabled = !desbloqueada;
    nodo.classList.toggle('bloqueado', !desbloqueada);
    nodo.classList.toggle('atual', i === fasesDesbloqueadas - 1);
    nodo.querySelector('.cadeado').hidden = desbloqueada;
  }
}

function atualizarCaderno() {
  const lista = document.getElementById('caderno-lista');
  lista.innerHTML = '';
  FASES.forEach((f, i) => {
    const item = document.createElement('div');
    const completo = registros.includes(i);
    item.className = 'caderno-item' + (completo ? ' completo' : '');
    item.innerHTML = `<span class="ci-num">${i + 1}</span><span class="ci-nome">${f.registro}</span><span class="ci-estado">${completo ? '✔' : '···'}</span>`;
    lista.appendChild(item);
  });
}

function abrirCaderno() {
  el.telaCaderno.hidden = false;
  cadernoAberto = true;
  atualizarCaderno();
}

function fecharCaderno() {
  el.telaCaderno.hidden = true;
  cadernoAberto = false;
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
  if (!registros.includes(faseAtual)) registros.push(faseAtual);
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
  el.fimTitulo.textContent = '📓 Caderno completo!';
  el.fimMensagem.textContent = 'Jaci reúne as memórias: trabalho, exploração, resistência e organização. A história dos seringueiros — e a história da floresta — continua.';
  somVitoria();
}

function gameOver() {
  estado = 'fim';
  el.telaFim.hidden = false;
  el.fimTitulo.textContent = 'A floresta está em perigo...';
  el.fimMensagem.textContent = 'A jornada não terminou — mas a luta pela floresta continua. Tente de novo.';
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
  grad.addColorStop(0, '#2b6fc0');
  grad.addColorStop(0.5, f.ceu);
  grad.addColorStop(1, '#f4e9c0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  desenharSol();
  desenharNuvens();
  desenharMontanhas();

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

function desenharSol() {
  const x = 404, y = 32, r = 14;
  ctx.fillStyle = 'rgba(255, 240, 160, 0.3)';
  ctx.fillRect(x - 24, y - 24, 48, 48);
  ctx.fillStyle = 'rgba(255, 240, 160, 0.45)';
  ctx.fillRect(x - 18, y - 18, 36, 36);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x - r + 3, y - r + 3, r * 2 - 6, r * 2 - 6);
}

function desenharMontanhas() {
  const f = FASES[faseAtual];

  // montanhas distantes
  const off1 = cameraX * 0.2;
  const p1 = Math.floor(off1 / 240) - 1;
  ctx.fillStyle = '#a7c6e0';
  for (let i = p1; i < p1 + 5; i++) {
    const cx = i * 240 - off1;
    const topo = 70 + (((i % 2) + 2) % 2) * 26;
    ctx.beginPath();
    ctx.moveTo(cx - 120, ALTURA);
    ctx.lineTo(cx, topo);
    ctx.lineTo(cx + 120, ALTURA);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#cfe4f2';
    ctx.fillRect(cx - 2, topo - 2, 4, 4);
    ctx.fillStyle = '#a7c6e0';
  }

  // colinas verdes
  const off2 = cameraX * 0.35;
  const p2 = Math.floor(off2 / 180) - 1;
  for (let i = p2; i < p2 + 6; i++) {
    const cx = i * 180 - off2;
    const topo = 150 + (((i % 2) + 2) % 2) * 25;
    ctx.fillStyle = f.colina;
    ctx.beginPath();
    ctx.moveTo(cx - 90, ALTURA);
    ctx.lineTo(cx, topo);
    ctx.lineTo(cx + 90, ALTURA);
    ctx.closePath();
    ctx.fill();
  }
}

function desenharNuvens() {
  const desloca = (Date.now() * 0.01 + cameraX * 0.2) % 900;
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 160 - desloca) % 900 + 900) % 900 - 80;
    const cy = 24 + (i % 3) * 28;
    // sombra
    ctx.fillStyle = '#d8e6f0';
    ctx.fillRect(cx, cy + 3, 38, 8);
    ctx.fillRect(cx + 8, cy - 5, 20, 8);
    ctx.fillRect(cx + 4, cy - 1, 30, 6);
    // corpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx, cy, 38, 8);
    ctx.fillRect(cx + 8, cy - 8, 20, 8);
    ctx.fillRect(cx + 4, cy - 4, 30, 6);
    // brilho
    ctx.fillStyle = '#f7fbff';
    ctx.fillRect(cx + 4, cy - 6, 22, 4);
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
  const espaco = 46;
  const primeiro = Math.floor(offset / espaco) - 1;
  for (let i = primeiro; i < primeiro + 14; i++) {
    const semente = (i * 2654435761) >>> 0;
    const x = i * espaco - offset + (semente % 22) - 11;
    const altura = 46 + (semente % 5) * 9;
    const largura = 22 + (semente % 3) * 5;
    const topo = ALTURA - altura;
    const cx = x + largura / 2;

    // tronco com sombra
    ctx.fillStyle = '#3a2513';
    ctx.fillRect(cx, topo, 5, altura);
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(cx, topo, 3, altura);

    // contorno da copa
    ctx.fillStyle = '#12351c';
    ctx.fillRect(x - 1, topo - 13, largura + 2, 14);
    ctx.fillRect(x + 3, topo - 23, largura - 6, 11);
    ctx.fillRect(x + 6, topo - 31, largura - 12, 8);

    // copa
    ctx.fillStyle = '#1e4a28';
    ctx.fillRect(x, topo - 12, largura, 12);
    ctx.fillStyle = '#2a6133';
    ctx.fillRect(x + 4, topo - 22, largura - 8, 10);
    ctx.fillStyle = '#357a3e';
    ctx.fillRect(x + 7, topo - 30, largura - 14, 8);

    // brilho
    ctx.fillStyle = '#4f9a57';
    ctx.fillRect(x + 4, topo - 20, 7, 4);
  }
}

function desenharPlataformas() {
  for (const plat of plataformas) {
    const x = plat.x - cameraX;
    // terra
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(x, plat.y, plat.w, plat.h);
    // manchas de terra
    ctx.fillStyle = '#5a3d22';
    const semente = (plat.x * 2654435761) >>> 0;
    for (let i = 0; i < plat.w / 24; i++) {
      const px = x + 8 + i * 24 + (semente % 8);
      const py = plat.y + 16 + ((semente + i * 13) % 12);
      ctx.fillRect(px, py, 5, 3);
    }
    // sombra inferior
    ctx.fillStyle = '#4a3018';
    ctx.fillRect(x, plat.y + plat.h - 4, plat.w, 4);
    // grama
    ctx.fillStyle = '#2f7a3d';
    ctx.fillRect(x, plat.y, plat.w, 6);
    ctx.fillStyle = '#3fae58';
    ctx.fillRect(x, plat.y, plat.w, 3);
    ctx.fillStyle = '#5cc06a';
    ctx.fillRect(x, plat.y, plat.w, 1);
    // tufos de grama
    ctx.fillStyle = '#2f7a3d';
    for (let i = 0; i < plat.w / 8; i++) {
      ctx.fillRect(x + 3 + i * 8, plat.y + 4, 3, 2);
    }
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
  ctx.fillStyle = '#8a5a00';
  ctx.fillRect(cx - w - 1, cy - r - 1, w * 2 + 2, r * 2 + 2);
  ctx.fillStyle = '#c89400';
  ctx.fillRect(cx - w, cy - r, w * 2, r * 2);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(cx - w + 1, cy - r + 1, w * 2 - 2, r * 2 - 2);
  ctx.fillStyle = '#ffe98a';
  ctx.fillRect(cx - Math.max(1, w - 2), cy - r + 2, Math.max(1, (w - 2) * 2), 2);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(cx - Math.max(1, w - 1), cy - 3, Math.max(1, (w - 1) * 2), 2);
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
  for (const fg of fogos) {
    const cx = fg.x - cameraX + 10;
    const base = fg.y + 22;
    const fl = Math.sin(Date.now() * 0.02 + fg.x) * 2;
    ctx.fillStyle = 'rgba(255, 160, 40, 0.3)';
    ctx.fillRect(cx - 10, base - 24 - fl, 20, 24);
    ctx.fillStyle = '#ff7a1a';
    ctx.fillRect(cx - 7, base - 18 - fl, 14, 18);
    ctx.fillStyle = '#ffd21f';
    ctx.fillRect(cx - 4, base - 12 - fl, 8, 12);
    ctx.fillStyle = '#fff3b0';
    ctx.fillRect(cx - 2, base - 6 - fl, 4, 6);
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

  // bandeira de chegada
  ctx.fillStyle = '#dddddd';
  ctx.fillRect(x, base - 46, 3, 46);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x + 3, base - 46, 18, 12);
  ctx.fillStyle = '#2f7a3d';
  ctx.fillRect(x + 3, base - 40, 18, 6);
}

function coresDoPersonagem(nome) {
  const mapa = {
    'Raimundo': { camisa: '#c89450', camisaEsc: '#9c6a2f', calca: '#5b3a1e', gorro: '#7a4a22' },
    'Antônio': { camisa: '#5a7a3a', camisaEsc: '#3f5a28', calca: '#3a3a3a', gorro: '#4a5a2a' },
    'Rosa': { camisa: '#d94f8c', camisaEsc: '#a8356a', calca: '#4a3a6a', gorro: '#8c3f6a' }
  };
  return mapa[nome] || mapa['Raimundo'];
}

function desenharJogador() {
  const p = jogador;
  if (p.invencivel && Math.floor(Date.now() / 100) % 2 === 0) return;
  const x = Math.round(p.x - cameraX);
  const y = Math.round(p.y);
  const c = coresDoPersonagem(FASES[faseAtual].personagem);
  const dir = p.olhandoDir;
  const OUT = '#1a0c08';
  const passo = p.noChao && p.vx !== 0 ? Math.floor(Date.now() / 120) % 2 : 0;

  // pernas
  ctx.fillStyle = OUT;
  ctx.fillRect(x + 4, y + 21, 7, 9);
  ctx.fillRect(x + 11, y + 21, 7, 9);
  ctx.fillStyle = c.calca;
  ctx.fillRect(x + 5, y + 21, 6, 8);
  ctx.fillRect(x + 12, y + 21, 6, 8);

  // botas
  ctx.fillStyle = OUT;
  ctx.fillRect(x + 4 + (passo ? 2 : 0), y + 27, 8, 3);
  ctx.fillRect(x + 11 - (passo ? 2 : 0), y + 27, 8, 3);
  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(x + 5 + (passo ? 2 : 0), y + 27, 6, 3);
  ctx.fillRect(x + 12 - (passo ? 2 : 0), y + 27, 6, 3);

  // torso
  ctx.fillStyle = OUT;
  ctx.fillRect(x + 2, y + 9, 18, 14);
  ctx.fillStyle = c.camisa;
  ctx.fillRect(x + 3, y + 10, 16, 12);
  ctx.fillStyle = c.camisaEsc;
  ctx.fillRect(x + 3, y + 18, 16, 3);

  // braço + mão
  ctx.fillStyle = OUT;
  ctx.fillRect(dir > 0 ? x + 16 : x + 2, y + 11, 4, 8);
  ctx.fillStyle = c.camisa;
  ctx.fillRect(dir > 0 ? x + 17 : x + 3, y + 11, 3, 7);
  ctx.fillStyle = '#e8b882';
  ctx.fillRect(dir > 0 ? x + 17 : x + 3, y + 16, 3, 3);

  // cabeça
  ctx.fillStyle = OUT;
  ctx.fillRect(x + 4, y - 1, 14, 13);
  ctx.fillStyle = '#e8b882';
  ctx.fillRect(x + 5, y, 12, 11);

  // cabelo
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(x + 5, y, 12, 3);

  // gorro/boné
  ctx.fillStyle = c.gorro;
  ctx.fillRect(x + 3, y - 2, 16, 4);
  ctx.fillRect(x + 5, y - 4, 12, 3);

  // olho
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(dir > 0 ? x + 13 : x + 6, y + 4, 3, 3);
  ctx.fillStyle = '#1d3320';
  ctx.fillRect(dir > 0 ? x + 14 : x + 6, y + 5, 2, 2);

  // poronga (lâmpada de cabeça dos seringueiros)
  ctx.fillStyle = '#3a2513';
  ctx.fillRect(x + 2, y - 6, 18, 3);
  ctx.fillStyle = '#c89450';
  ctx.fillRect(x + 7, y - 11, 7, 6);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(x + 8, y - 10, 4, 2);
  const fl = Math.floor(Date.now() / 140) % 3;
  ctx.fillStyle = '#ff9f1a';
  ctx.fillRect(x + 9, y - 13 - fl, 2, 3);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x + 10, y - 12 - fl, 1, 2);

  desenharRotulo(x + 11, y - 22, FASES[faseAtual].personagem.toUpperCase());
}

function loop() {
  requestAnimationFrame(loop);
  if (estado === 'jogando' && !cadernoAberto) {
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
  if (k === 'c') {
    if (cadernoAberto) fecharCaderno();
    else abrirCaderno();
  }
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
document.getElementById('botao-caderno').addEventListener('click', () => {
  if (cadernoAberto) fecharCaderno();
  else abrirCaderno();
});
document.getElementById('botao-caderno-fechar').addEventListener('click', fecharCaderno);

montarMapa();
configurarTouch();
atualizarHud();
loop();
