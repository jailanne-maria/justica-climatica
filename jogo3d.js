/* ===== Configuração da cena 3D ===== */
const ANOS = 12;

let cena, camera, renderizador;
let jogador, alvoJogador;
let arvores = [];
let gados = [];
let personagens3d = [];
let alvoCamera = null;
let interacaoAtual = null;
let borboletas = [];
let passaros = [];

const teclas = {};
const raioInteracao = 4.5;

const LIMITE_MUNDO = 58;

const ZONAS_PERSONAGENS = [[-18, -14], [16, -16], [-4, 16], [20, 12]];
const RIO_Z = -50;
const RIO_MEIA_LARGURA = 7;

const arbVerde = [0x2f9e44, 0x3d7a3d, 0x4a8f4a, 0x2a7a2f, 0x7a9a3d];
const floresCores = [0xe74c3c, 0xf1c40f, 0xe67e22, 0x9b59b6, 0xffffff, 0x3498db];

/* ===== Modo VR (Cardboard) ===== */
let modoVR = false;
let estereo = null;
let orientacaoAtual = { yaw: 0, pitch: 0, yawAlvo: 0, pitchAlvo: 0 };
let joystick = { x: 0, y: 0, cx: 0, cy: 0, r: 52, ativo: false };

function aplicativoPronto() { return typeof firebase !== 'undefined'; }

function detectarDispositivoVR() {
  return typeof DeviceOrientationEvent !== 'undefined';
}

function verificarPermissaoGiroscopio() {
  return pedirPermissaoGiroscopio();
}

function pedirPermissaoGiroscopio() {
  return new Promise((resolver) => {
    if (typeof DeviceOrientationEvent === 'undefined' || !DeviceOrientationEvent.requestPermission) {
      resolver(true);
      return;
    }
    DeviceOrientationEvent.requestPermission()
      .then((estado) => resolver(estado === 'granted'))
      .catch(() => resolver(false));
  });
}

function ligarModoVR() {
  if (!renderizador) return;
  const botao = document.getElementById('botao-vr');
  botao.classList.add('ativo');
  botao.textContent = '✕ Sair do VR';

  modoVR = true;
  document.body.classList.add('estado-vr');

  if (!estereo) {
    estereo = new THREE.StereoCamera();
  }

  const joystickEl = document.getElementById('joystick');
  joystickEl.hidden = false;

  verificarPermissaoGiroscopio().then((ok) => {
    if (!ok) orientacaoAtual.yawAlvo = 0;
  });

  window.addEventListener('deviceorientation', aoGirarMobile);

  camera.updateProjectionMatrix();
  atualizarHud();
}

function aoGirarMobile(e) {
  if (!e.alpha) return;
  const beta = (e.beta || 0) * Math.PI / 180;
  const al = (e.gamma || 0) * Math.PI / 180;
  const yaw = (e.alpha || 0) * Math.PI / 180;
  orientacaoAtual.yawAlvo = yaw;
  orientacaoAtual.pitchAlvo = beta;
}

function desligarModoVR() {
  modoVR = false;
  const botao = document.getElementById('botao-vr');
  botao.classList.remove('ativo');
  botao.textContent = '🕶️ Modo VR';
  document.getElementById('joystick').hidden = true;
  document.getElementById('barra-avancar').hidden = false;
  document.body.classList.remove('estado-vr');
}

function ligarJoystick(el) {
  const raio = el.querySelector('.joystick-raio');
  const knob = el.querySelector('.joystick-knob');
  const lim = 44;

  function ao(arr) {
    const r = raio.getBoundingClientRect();
    joystick.ativo = true;
    joystick.cx = r.left + r.width / 2;
    joystick.cy = r.top + r.height / 2;
    mover(arr);
  }
  function mover(d) {
    const dx = d.touches ? d.touches[0].clientX - joystick.cx : d.clientX - joystick.cx;
    const dy = d.touches ? d.touches[0].clientY - joystick.cy : d.clientY - joystick.cy;
    const ang = Math.atan2(dy, dx);
    const mag = Math.hypot(dx, dy);
    const clamp = Math.min(mag, lim);
    joystick.x = Math.cos(ang) * clamp / lim;
    joystick.y = Math.sin(ang) * clamp / lim;
    knob.style.transform = `translate(${joystick.x * lim}px, ${joystick.y * lim}px)`;
  }
  function parar() {
    joystick.ativo = false;
    joystick.x = 0;
    joystick.y = 0;
    knob.style.transform = 'translate(0px, 0px)';
  }

  if (window.PointerEvent) {
    raio.addEventListener('pointerdown', ao);
    raio.addEventListener('pointermove', (e) => { if (joystick.ativo) mover(e); });
    raio.addEventListener('pointerup', parar);
    raio.addEventListener('pointercancel', parar);
  } else {
    raio.addEventListener('touchstart', ao);
    raio.addEventListener('touchmove', mover);
    raio.addEventListener('touchend', parar);
  }
}

function moverJogadorVR() {
  const vel = 0.35;
  const o = orientacaoAtual;
  const yaw = o.yaw;
  const dxJ = joystick.y;
  const dyJ = -joystick.x;

  const sen = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const dx = (sen * dxJ + cos * dyJ);
  const dz = (cos * dxJ - sen * dyJ);
  if (Math.hypot(dx, dz) > 0.01) {
    jogador.position.x = Math.max(-LIMITE_MUNDO, Math.min(LIMITE_MUNDO, jogador.position.x + dx * vel * 1.2));
    jogador.position.z = Math.max(-LIMITE_MUNDO, Math.min(LIMITE_MUNDO, jogador.position.z + dz * vel * 1.2));
    jogador.rotation.y = yaw;
  }
}

/* ===== Estado e lógica do jogo (reaproveitada) ===== */

const personagens = [
  {
    id: 'marinalva',
    nome: 'Dona Marinalva',
    papel: 'Extrativista',
    emoji: '🌰',
    cor: 0xb5793a,
    posicao: [-18, 0, -14],
    acoes: [
      { nome: 'Colher castanha', desc: 'Renda com a floresta em pé.', custo: 0, efeito: () => { estado.extrativista += 8; estado.dinheiro += 6000; }, log: 'Dona Marinalva colheu castanha: a floresta em pé pagou a conta.' },
      { nome: 'Fazer um empate', desc: 'Sentar-se diante das motosserras.', custo: 0, efeito: () => { estado.pressao = Math.max(0, estado.pressao - 50); estado.extrativista += 5; }, log: 'Empate! As famílias pararam o desmatamento.' },
      { nome: 'Plantar mudas', desc: 'Recuperar áreas degradadas.', custo: 4000, efeito: () => { estado.floresta += 6; }, log: 'Dona Marinalva plantou mudas em área degradada.' }
    ]
  },
  {
    id: 'joao',
    nome: 'Seu João',
    papel: 'Ribeirinho',
    emoji: '🐟',
    cor: 0x3a6fb5,
    posicao: [16, 0, -16],
    acoes: [
      { nome: 'Pescar com manejo', desc: 'Renda com pesca sustentável.', custo: 0, efeito: () => { estado.ribeirinho += 6; estado.dinheiro += 4000; }, log: 'Seu João pescou com manejo: peixes e renda.' },
      { nome: 'Proteger igarapés', desc: 'Defender os rios e a mata ciliar.', custo: 3000, efeito: () => { estado.ribeirinho += 10; estado.floresta += 3; }, log: 'Igarapés protegidos: água e floresta saudáveis.' },
      { nome: 'Vigiar queimadas', desc: 'Alertar e conter o fogo.', custo: 2000, efeito: () => { estado.pressao = Math.max(0, estado.pressao - 25); }, log: 'A rede de vigilância conteve as queimadas.' }
    ]
  },
  {
    id: 'guajarina',
    nome: 'Guajarina',
    papel: 'Amazônia urbana',
    emoji: '🏫',
    cor: 0x8a4bb0,
    posicao: [-4, 0, 16],
    acoes: [
      { nome: 'Aula de educação ambiental', desc: 'Formar a próxima geração.', custo: 2000, efeito: () => { estado.urbano += 8; estado.apoio += 5; }, log: 'Guajarina levou a floresta para a sala de aula.' },
      { nome: 'Organizar mutirão', desc: 'Unir a comunidade urbana.', custo: 3000, efeito: () => { estado.urbano += 6; estado.apoio += 8; }, log: 'Mutirão na cidade: quem vive longe defende a mata.' },
      { nome: 'Fazer campanha eleitoral', desc: 'Apoiar candidatos da floresta.', custo: 5000, efeito: () => { estado.apoio += 20; }, log: 'Campanha pela floresta: candidatos ouviram a comunidade.' }
    ]
  },
  {
    id: 'araquem',
    nome: 'Cacique Araquém',
    papel: 'Guardião do território',
    emoji: '🏹',
    cor: 0x2f7a3d,
    posicao: [20, 0, 12],
    acoes: [
      { nome: 'Demarcar território', desc: 'Proteção legal permanente.', custo: 8000, efeito: () => { if (!estado.demarcado) { estado.demarcado = true; estado.pressao -= 30; estado.apoio += 10; return 'Território demarcado! A lei protege a floresta.'; } return 'Território já demarcado.'; } },
      { nome: 'Fazer um empate', desc: 'Bloquear o desmate com coragem.', custo: 0, efeito: () => { estado.pressao = Math.max(0, estado.pressao - 40); estado.floresta += 1; }, log: 'Empate no território! O gado foi bloqueado.' },
      { nome: 'Compartilhar saberes', desc: 'Manejo tradicional que conserva.', custo: 1000, efeito: () => { estado.floresta += 4; estado.extrativista += 6; }, log: 'Saberes tradicionais: conhecimento que protege a mata.' }
    ]
  }
];

const historias = {
  1: { fase: 'Fase 1 · Resistir', titulo: 'O empate: a arma dos que amam a floresta', texto: 'Nos anos 1980, os seringueiros do Acre criaram o "empate": famílias inteiras sentavam-se diante das motosserras para impedir a derrubada da floresta. Chico Mendes liderou essa resistência pacífica e se tornou símbolo mundial. As queimadas limpam o pasto para o gado avançar — cabe a você deter o boi com união.' },
  2: { fase: 'Fase 2 · Construir', titulo: 'A Reserva Extrativista', texto: 'Em 1990, um ano após a morte de Chico Mendes, o Brasil criou a primeira Reserva Extrativista do país, no Acre, em sua homenagem. Sua missão agora é transformar a resistência em uma economia que valoriza a mata.' },
  3: { fase: 'Fase 3 · Consolidar', titulo: 'A floresta também forma lideranças', texto: 'Marina Silva, seringueira nascida no Acre, tornou-se ministra do Meio Ambiente. O período eleitoral é decisivo: candidatos que defendem a floresta ou o desmatamento? Seu apoio político define o futuro.' }
};

const historiasEleicao = {
  vitoria: { titulo: '🗳️ A floresta venceu as eleições', texto: 'Os candidatos que defendem a floresta venceram. Novas políticas de proteção foram aprovadas.' },
  derrota: { titulo: '🗳️ O desmatamento ganhou as urnas', texto: 'Candidatos ligados ao agro avançaram. Mas a luta continua — a floresta ainda depende de você.' }
};

const estado = {
  ano: 1,
  dinheiro: 30000,
  floresta: 70,
  pressao: 30,
  extrativista: 50,
  ribeirinho: 50,
  urbano: 50,
  apoio: 30,
  demarcado: false,
  fase: 1,
  escolhas: {}
};

const eventos = [
  { nome: 'Enchente histórica do Rio Acre', tipo: 'ruim', chance: 0.22, aplicar: () => { estado.ribeirinho = Math.max(0, estado.ribeirinho - 12); estado.urbano = Math.max(0, estado.urbano - 6); estado.dinheiro -= 5000; return 'O Rio Acre subiu e atingiu ribeirinhos e bairros.'; } },
  { nome: 'Preço da castanha dispara', tipo: 'bom', chance: 0.16, aplicar: () => { estado.extrativista = Math.min(100, estado.extrativista + 8); estado.dinheiro += 8000; return 'A castanha valorizou: a floresta em pé rendeu.'; } },
  { nome: 'Grande seca no rio', tipo: 'ruim', chance: 0.14, aplicar: () => { estado.floresta = Math.max(0, estado.floresta - 3); estado.ribeirinho = Math.max(0, estado.ribeirinho - 8); return 'A seca encolheu os rios e estressou a floresta.'; } },
  { nome: 'Prêmio internacional', tipo: 'bom', chance: 0.12, aplicar: () => { estado.floresta = Math.min(100, estado.floresta + 3); estado.dinheiro += 6000; estado.apoio = Math.min(100, estado.apoio + 5); return 'A reserva ganhou um prêmio mundial.'; } },
  { nome: 'Turismo comunitário cresce', tipo: 'bom', chance: 0.1, aplicar: () => { estado.ribeirinho = Math.min(100, estado.ribeirinho + 6); estado.extrativista = Math.min(100, estado.extrativista + 6); estado.dinheiro += 5000; return 'Turismo comunitário gerou renda local.'; } }
];

function rodarEvento() {
  const pesoTotal = eventos.reduce((s, e) => s + e.chance, 0);
  let sorteio = Math.random() * pesoTotal;
  for (const e of eventos) {
    sorteio -= e.chance;
    if (sorteio <= 0) { adicionarLog(e.nome, e.tipo, e.aplicar()); return; }
  }
}

function avancoDoAgro() {
  const mult = { 1: 18, 2: 12, 3: 8 };
  const base = mult[estado.fase];
  const reduz = estado.demarcado ? 6 : 0;
  estado.pressao += Math.max(6, base - reduz);
}

function impactoDoAgro() {
  if (estado.pressao >= 100) {
    estado.floresta = Math.max(0, estado.floresta - 15);
    estado.pressao = 30;
    adicionarLog('Queimada para abrir pasto', 'ruim', 'O gado avançou: queimada devastou parte da floresta.');
  } else if (estado.pressao >= 70) {
    estado.floresta = Math.max(0, estado.floresta - 5);
    adicionarLog('Desmatamento acelerado', 'ruim', 'O agro pressiona: árvores caíram para virar pasto.');
  } else if (estado.pressao >= 40) {
    estado.floresta = Math.max(0, estado.floresta - 3);
    adicionarLog('Pressão do gado', 'evento', 'O desmatamento avança nas bordas da reserva.');
  } else {
    estado.floresta = Math.max(0, estado.floresta - 1);
    adicionarLog('Resistência firme', 'evento', 'Os empates seguram o avanço: quase nenhuma perda.');
  }
}

function rendaAnual() {
  const total = Math.round(estado.floresta / 100 * 10000) + Math.round(estado.apoio / 100 * 3000);
  estado.dinheiro += total;
  adicionarLog('Renda anual', 'evento', `+R$ ${total.toLocaleString('pt-BR')} vindos da floresta em pé.`);
}

function fazerEleicao() {
  const ganhou = estado.apoio >= 50;
  const h = historiasEleicao[ganhou ? 'vitoria' : 'derrota'];
  if (ganhou) {
    estado.floresta = Math.min(100, estado.floresta + 8);
    estado.pressao = Math.max(0, estado.pressao - 25);
  } else {
    estado.floresta = Math.max(0, estado.floresta - 8);
    estado.pressao = Math.min(100, estado.pressao + 30);
  }
  adicionarLog(h.titulo, ganhou ? 'bom' : 'ruim', h.texto);
}

/* ===== Helpers de UI ===== */

function adicionarLog(titulo, tipo, mensagem) {
  const log = document.getElementById('log');
  const item = document.createElement('div');
  item.className = `log-item ${tipo === 'ruim' ? 'ruim' : tipo === 'historia' ? 'historia' : ''}`;
  item.innerHTML = `<strong>${titulo}</strong>${mensagem}`;
  log.prepend(item);
  if (log.children.length > 40) log.lastChild.remove();
}

function limitar(v) { return Math.max(0, Math.min(100, v)); }

function atualizarHud() {
  document.getElementById('ano').textContent = estado.ano;
  document.getElementById('info-fase').textContent = historias[estado.fase].fase;
  document.getElementById('dinheiro').textContent = estado.dinheiro.toLocaleString('pt-BR');

  estado.floresta = limitar(estado.floresta);
  estado.pressao = limitar(estado.pressao);
  estado.extrativista = limitar(estado.extrativista);
  estado.ribeirinho = limitar(estado.ribeirinho);
  estado.urbano = limitar(estado.urbano);
  estado.apoio = limitar(estado.apoio);

  const mapa = {
    'barra-floresta': ['floresta', '%'],
    'barra-pressao': ['pressao', '%'],
    'barra-extrativista': ['extrativista', ''],
    'barra-ribeirinho': ['ribeirinho', ''],
    'barra-urbano': ['urbano', ''],
    'barra-apoio': ['apoio', '']
  };

  for (const [id, [chave, unidade]] of Object.entries(mapa)) {
    document.getElementById(id).style.width = `${estado[chave]}%`;
    document.getElementById(`valor-${chave}`).textContent = `${estado[chave]}${unidade}`;
  }

  sincronizarArvores();
  sincronizarGado();
  sincronizarBotoesAvancar();
}

function sincronizarBotoesAvancar() {
  const todas = personagens.every((p) => estado.escolhas[p.id]);
  document.getElementById('botao-avancar').disabled = !todas;
}

/* ===== Cena 3D ===== */

function iniciar3D() {
  cena = new THREE.Scene();
  cena.background = new THREE.Color(0x87c0e8);
  cena.fog = new THREE.Fog(0x87c0e8, 120, 260);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

  renderizador = new THREE.WebGLRenderer({ antialias: true });
  renderizador.setSize(window.innerWidth, window.innerHeight);
  renderizador.shadowMap.enabled = true;
  document.getElementById('cena3d').appendChild(renderizador.domElement);

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.55);
  cena.add(luzAmbiente);

  const luzSol = new THREE.DirectionalLight(0xfff5d8, 0.9);
  luzSol.position.set(50, 80, 30);
  luzSol.castShadow = true;
  cena.add(luzSol);

  const luzSol2 = new THREE.DirectionalLight(0xbfe3ff, 0.4);
  luzSol2.position.set(-40, 50, -30);
  cena.add(luzSol2);

  criarChao();
  criarRio();
  criarArvores();
  criarGado();
  criarJogador();
  criarPersonagens();
  criarBorboletas();
  criarPassaros();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
  });

  animar();
}

function criarChao() {
  const textura = criarTexturaDeGrama();
  const geometria = new THREE.PlaneGeometry(200, 200);
  const material = new THREE.MeshLambertMaterial({ map: textura });
  const chao = new THREE.Mesh(geometria, material);
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  cena.add(chao);

  criarCapoeira();
}

function criarTexturaDeGrama() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4a8f4a';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 2200; i++) {
    const tom = Math.random();
    ctx.fillStyle = tom > 0.75 ? '#3d7a3d' : tom > 0.45 ? '#58a858' : '#4a8f4a';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(12, 12);
  return textura;
}

function criarCapoeira() {
  for (let i = 0; i < 90; i++) {
    const x = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 4);
    const z = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 4);
    if (Math.abs(z - RIO_Z) < RIO_MEIA_LARGURA) continue;

    const cor = arbVerde[(Math.random() * arbVerde.length) | 0];
    const arbusto = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 5), new THREE.MeshLambertMaterial({ color: cor }));
    const escala = 0.5 + Math.random() * 0.9;
    arbusto.scale.set(escala * (0.8 + Math.random() * 0.6), escala * 0.55, escala * (0.8 + Math.random() * 0.6));
    arbusto.position.set(x, 0.15, z);
    arbusto.rotation.y = Math.random() * Math.PI;
    arbusto.castShadow = true;
    cena.add(arbusto);
  }

  for (let i = 0; i < 180; i++) {
    const x = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 3);
    const z = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 3);
    if (Math.abs(z - RIO_Z) < RIO_MEIA_LARGURA + 2) continue;

    const cor = floresCores[(Math.random() * floresCores.length) | 0];
    const flor = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), new THREE.MeshLambertMaterial({ color: cor }));
    flor.position.set(x, 0.12 + Math.random() * 0.2, z);
    cena.add(flor);
  }
}

function criarRio() {
  const geometria = new THREE.BoxGeometry(140, 0.6, 10);
  const material = new THREE.MeshLambertMaterial({ color: 0x4a8fd9 });
  const rio = new THREE.Mesh(geometria, material);
  rio.position.set(0, -0.2, -50);
  cena.add(rio);
}

function criarArvore(x, z) {
  const grupo = new THREE.Group();

  const troncoMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2b });
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1, 3, 8), troncoMat);
  tronco.position.y = 1.5;
  tronco.castShadow = true;
  grupo.add(tronco);

  const folhaMat = new THREE.MeshLambertMaterial({ color: 0x2f9e44 });
  const copa1 = new THREE.Mesh(new THREE.ConeGeometry(3.4, 5, 8), folhaMat);
  copa1.position.y = 5;
  copa1.castShadow = true;
  grupo.add(copa1);

  const copa2 = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.5, 8), folhaMat);
  copa2.position.y = 8;
  copa2.castShadow = true;
  grupo.add(copa2);

  grupo.position.set(x, 0, z);
  grupo.userData.crescendo = 1;
  grupo.userData.alvo = 1;
  grupo.scale.setScalar(1);
  cena.add(grupo);
  return grupo;
}

function criarCastanheira(x, z) {
  const grupo = new THREE.Group();

  const troncoMat = new THREE.MeshLambertMaterial({ color: 0x5b3a1e });
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 7, 8), troncoMat);
  tronco.position.y = 3.5;
  tronco.castShadow = true;
  grupo.add(tronco);

  const folhaMat = new THREE.MeshLambertMaterial({ color: 0x257a36 });
  for (let i = 0; i < 5; i++) {
    const copa = new THREE.Mesh(new THREE.SphereGeometry(3.6 + Math.random() * 1.2, 7, 6), folhaMat);
    copa.position.set((Math.random() * 2 - 1) * 1.6, 8 + Math.random() * 1.4, (Math.random() * 2 - 1) * 1.6);
    copa.scale.y = 0.75;
    copa.castShadow = true;
    grupo.add(copa);
  }

  const frutoMat = new THREE.MeshLambertMaterial({ color: 0x8a5a2b });
  for (let i = 0; i < 4; i++) {
    const fruto = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 5), frutoMat);
    fruto.position.set((Math.random() * 2 - 1) * 2.2, 4.6 + Math.random() * 0.8, (Math.random() * 2 - 1) * 2.2);
    grupo.add(fruto);
  }

  grupo.position.set(x, 0, z);
  grupo.userData.crescendo = 0.2;
  grupo.userData.alvo = 1;
  grupo.userData.especie = 'castanheira';
  cena.add(grupo);
  return grupo;
}

function criarSeringueira(x, z) {
  const grupo = new THREE.Group();

  const troncoMat = new THREE.MeshLambertMaterial({ color: 0x7a5a3a });
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 5, 8), troncoMat);
  tronco.position.y = 2.5;
  tronco.castShadow = true;
  grupo.add(tronco);

  const folhaMat = new THREE.MeshLambertMaterial({ color: 0x3d9e44 });
  for (let i = 0; i < 3; i++) {
    const copa = new THREE.Mesh(new THREE.SphereGeometry(1.9, 7, 6), folhaMat);
    copa.position.set((Math.random() * 2 - 1) * 1.2, 6 + Math.random() * 1.1, (Math.random() * 2 - 1) * 1.2);
    copa.castShadow = true;
    grupo.add(copa);
  }

  grupo.position.set(x, 0, z);
  grupo.userData.especie = 'seringueira';
  grupo.userData.alvo = 1;
  grupo.userData.crescendo = 1;
  cena.add(grupo);
  return grupo;
}

function criarPalmeira(x, z) {
  const grupo = new THREE.Group();

  const troncoMat = new THREE.MeshLambertMaterial({ color: 0x8a6a45 });
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 7, 8), troncoMat);
  tronco.position.y = 3.5;
  tronco.castShadow = true;
  grupo.add(tronco);

  const folhaMat = new THREE.MeshLambertMaterial({ color: 0x2a9e33, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2;
    const folha = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3.4), folhaMat);
    folha.position.set(0, 7.2, 0);
    folha.rotation.set(1.1, 0, ang);
    folha.castShadow = true;
    grupo.add(folha);
  }

  grupo.position.set(x, 0, z);
  grupo.userData.especie = 'palmeira';
  grupo.userData.alvo = 1;
  grupo.userData.crescendo = 1;
  cena.add(grupo);
  return grupo;
}

function criarArvorePequena(x, z) {
  const grupo = new THREE.Group();
  const troncoMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2b });
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2.5, 6), troncoMat);
  tronco.position.y = 1.2;
  tronco.castShadow = true;
  grupo.add(tronco);

  const folhaMat = new THREE.MeshLambertMaterial({ color: 0x2a8f3a });
  const copa = new THREE.Mesh(new THREE.SphereGeometry(1.7, 7, 6), folhaMat);
  copa.position.y = 3.6;
  copa.scale.y = 0.8;
  copa.castShadow = true;
  grupo.add(copa);

  grupo.position.set(x, 0, z);
  grupo.userData.especie = 'pequena';
  grupo.userData.alvo = 1;
  grupo.userData.crescendo = 1;
  cena.add(grupo);
  return grupo;
}

function criarArvores() {
  const quantidade = 160;
  let tentativas = 0;
  while (arvores.length < quantidade && tentativas < 4000) {
    tentativas++;
    const x = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 6);
    const z = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 6);
    if (Math.abs(z - RIO_Z) < RIO_MEIA_LARGURA + 2) continue;
    if (Math.sqrt(x * x + z * z) < 6) continue;
    const pertoPersonagem = ZONAS_PERSONAGENS.some(([px, pz]) => Math.sqrt((x - px) * (x - px) + (z - pz) * (z - pz)) < 8);
    if (pertoPersonagem) continue;
    const colide = arvores.some((a) => Math.sqrt((x - a.position.x) * (x - a.position.x) + (z - a.position.z) * (z - a.position.z)) < 3);
    if (colide) continue;

    const sorte = Math.random();
    const proximoRio = Math.abs(z - RIO_Z) < RIO_MEIA_LARGURA + 10;
    let arvore;
    if (sorte < 0.2) arvore = criarCastanheira(x, z);
    else if (sorte < 0.45) arvore = criarSeringueira(x, z);
    else if (proximoRio && sorte < 0.72) arvore = criarPalmeira(x, z);
    else if (sorte < 0.85) arvore = criarArvorePequena(x, z);
    else arvore = criarArbustoGrande(x, z);

    const escala = 0.8 + Math.random() * 0.9;
    arvore.scale.setScalar(escala);
    arvore.userData.baseEscala = escala;
    arvore.rotation.y = Math.random() * Math.PI * 2;
    arvores.push(arvore);
  }
}

function criarArbustoGrande(x, z) {
  const grupo = new THREE.Group();
  const folhaMat = new THREE.MeshLambertMaterial({ color: 0x2a8f3a });
  for (let i = 0; i < 3; i++) {
    const ramo = new THREE.Mesh(new THREE.SphereGeometry(1.2, 7, 6), folhaMat);
    ramo.position.set((Math.random() * 2 - 1) * 0.9, 1 + Math.random() * 0.8, (Math.random() * 2 - 1) * 0.9);
    ramo.castShadow = true;
    grupo.add(ramo);
  }
  grupo.position.set(x, 0, z);
  grupo.userData.especie = 'matagal';
  grupo.userData.alvo = 1;
  grupo.userData.crescendo = 1;
  cena.add(grupo);
  return grupo;
}

function criarBoi(x, z) {
  const grupo = new THREE.Group();
  const corpoMat = new THREE.MeshLambertMaterial({ color: 0x8a5a2b });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 1.6), corpoMat);
  corpo.position.y = 1.3;
  corpo.castShadow = true;
  grupo.add(corpo);

  const cabecaMat = new THREE.MeshLambertMaterial({ color: 0x9a6a3b });
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1), cabecaMat);
  cabeca.position.set(-1.9, 1.7, 0);
  grupo.add(cabeca);

  const cornoMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  const cornoE = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.8), cornoMat);
  cornoE.position.set(-2.2, 2.3, -0.4);
  grupo.add(cornoE);
  const cornoD = cornoE.clone();
  cornoD.position.z = 0.4;
  grupo.add(cornoD);

  grupo.position.set(x, 0, z);
  grupo.rotation.y = Math.PI;
  grupo.userData.alvoZ = z;
  cena.add(grupo);
  return grupo;
}

function criarGado() {
  const posicoes = [
    [-42, 55], [-36, 58], [-30, 55], [-24, 58], [-18, 55], [-12, 58],
    [-6, 55], [0, 58], [6, 55], [12, 58], [18, 55], [24, 58],
    [30, 55], [36, 58], [42, 55]
  ];
  posicoes.forEach(([x, z]) => {
    gados.push(criarBoi(x, z));
  });
}

function criarAvatar(cor, emojiNaoUsado) {
  const grupo = new THREE.Group();

  const corpoMat = new THREE.MeshLambertMaterial({ color: cor });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.1), corpoMat);
  corpo.position.y = 1.1;
  corpo.castShadow = true;
  grupo.add(corpo);

  const cabecaMat = new THREE.MeshLambertMaterial({ color: 0xe8b882 });
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), cabecaMat);
  cabeca.position.y = 2.9;
  cabeca.castShadow = true;
  grupo.add(cabeca);

  const olhoMat = new THREE.MeshBasicMaterial({ color: 0x1d3320 });
  const olhoE = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), olhoMat);
  olhoE.position.set(-0.28, 3.05, 0.55);
  grupo.add(olhoE);
  const olhoD = olhoE.clone();
  olhoD.position.x = 0.28;
  grupo.add(olhoD);

  return grupo;
}

function criarJogador() {
  jogador = criarAvatar(0x2c3e50);
  jogador.position.set(0, 0, 0);
  cena.add(jogador);
}

function criarPersonagens() {
  personagens.forEach((p) => {
    const avatar = criarAvatar(p.cor);
    avatar.position.set(p.posicao[0], 0, p.posicao[2]);
    cena.add(avatar);

    const anelMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
    const anel = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.7, 32), anelMat);
    anel.rotation.x = -Math.PI / 2;
    anel.position.y = 0.05;
    avatar.add(anel);

    const spriteMat = new THREE.SpriteMaterial({ map: fazerTexto(`${p.emoji}`) });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3, 3, 1);
    sprite.position.y = 4.5;
    avatar.add(sprite);

    personagens3d.push({ dados: p, avatar, anel });
  });
}

function fazerTexto(texto) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = '90px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, 64, 64);
  const textura = new THREE.CanvasTexture(canvas);
  return textura;
}

function criarBorboletas() {
  const cores = [0xf1c40f, 0xe74c3c, 0x3498db, 0x9b59b6, 0xff8c00];
  for (let i = 0; i < 8; i++) {
    const grupo = new THREE.Group();
    const cor = cores[i % cores.length];
    const mat = new THREE.MeshLambertMaterial({ color: cor, side: THREE.DoubleSide });
    const asaE = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), mat);
    asaE.position.x = 0.28;
    grupo.add(asaE);
    const asaD = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), mat);
    asaD.position.x = -0.28;
    grupo.add(asaD);

    const x = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 15);
    const z = (Math.random() * 2 - 1) * (LIMITE_MUNDO - 15);
    if (Math.abs(z - RIO_Z) < RIO_MEIA_LARGURA + 3) continue;
    grupo.position.set(x, 2 + Math.random() * 2.5, z);

    borboletas.push({
      grupo,
      baseX: x,
      baseZ: z,
      baseY: 2 + Math.random() * 2.5,
      fase: Math.random() * Math.PI * 2,
      raio: 1.5 + Math.random() * 2.5,
      velocidade: 0.4 + Math.random() * 0.5,
      ativo: true
    });
    cena.add(grupo);
  }
}

function criarPassaros() {
  const mat = new THREE.MeshLambertMaterial({ color: 0x1d3320 });
  for (let i = 0; i < 9; i++) {
    const grupo = new THREE.Group();
    const asaE = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.25), mat);
    asaE.position.x = -0.4;
    asaE.rotation.z = -0.3;
    grupo.add(asaE);
    const asaD = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.25), mat);
    asaD.position.x = 0.4;
    asaD.rotation.z = -0.3;
    grupo.add(asaD);

    const raioOrbita = 18 + Math.random() * 18;
    grupo.position.set(
      (Math.random() * 2 - 1) * (LIMITE_MUNDO - 8),
      22 + Math.random() * 6,
      (Math.random() * 2 - 1) * (LIMITE_MUNDO - 8)
    );

    passaros.push({
      grupo,
      fase: Math.random() * Math.PI * 2,
      raio: raioOrbita,
      velocidade: 0.3 + Math.random() * 0.4,
      sx: (Math.random() * 2 - 1) * (LIMITE_MUNDO - 8),
      sz: (Math.random() * 2 - 1) * (LIMITE_MUNDO - 8),
      x: 0,
      y: 0,
      z: 0,
      altura: 22 + Math.random() * 6
    });
    cena.add(grupo);
  }
}

/* ===== Sincronização visual ===== */

function sincronizarArvores() {
  const totalArvores = arvores.length;
  const alvoVisiveis = Math.round(estado.floresta / 100 * totalArvores);
  arvores.forEach((arvore, i) => {
    arvore.userData.alvo = i < alvoVisiveis ? 1 : 0.001;
  });
}

function sincronizarGado() {
  const alvoGado = Math.round(estado.pressao / 100 * gados.length);
  const profundidade = estado.pressao / 100 * 40;
  gados.forEach((boi, i) => {
    const visivel = i < alvoGado;
    boi.visible = visivel;
    if (visivel) {
      const zInicial = 55;
      const zFinal = 15;
      boi.userData.alvoZ = zInicial - (zInicial - zFinal) * (profundidade / 40) * 1.4;
    }
  });
}

function avancarGadoPasso() {
  gados.forEach((boi) => {
    if (!boi.visible) return;
    const alvoZ = boi.userData.alvoZ || 55;
    boi.position.z += (alvoZ - boi.position.z) * 0.04;
    boi.position.z = Math.max(boi.position.z, 10);
  });
}

/* ===== Interação ===== */

function encontrarProximo() {
  let maisProximo = null;
  let menorDist = raioInteracao;
  personagens3d.forEach(({ dados, avatar }) => {
    const dx = jogador.position.x - avatar.position.x;
    const dz = jogador.position.z - avatar.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < menorDist) {
      menorDist = dist;
      maisProximo = dados;
    }
  });
  return maisProximo;
}

function interagir() {
  const dados = encontrarProximo();
  if (!dados) return;
  abrirPainelAcao(dados);
}

function abrirPainelAcao(dados) {
  const painel = document.getElementById('painel-acao');
  document.getElementById('acao-nome').textContent = dados.nome;
  document.getElementById('acao-papel').textContent = dados.papel;
  document.getElementById('acao-avatar').textContent = dados.emoji;
  document.getElementById('acao-avatar').style.background = `#${dados.cor.toString(16).padStart(6, '0')}`;

  const lista = document.getElementById('acoes-lista');
  lista.innerHTML = '';
  dados.acoes.forEach((a) => {
    const botao = document.createElement('button');
    botao.className = 'cartao-acao';
    const selecionada = estado.escolhas[dados.id] && estado.escolhas[dados.id].acao.nome === a.nome;
    if (selecionada) botao.classList.add('selecionada');
    botao.innerHTML = `<strong>${a.nome}</strong>${a.desc}<br><span class="custo">💰 R$ ${a.custo.toLocaleString('pt-BR')}</span>`;
    botao.disabled = estado.dinheiro < a.custo && !selecionada;
    botao.addEventListener('click', () => {
      const atual = estado.escolhas[dados.id];
      if (atual && atual.acao.nome === a.nome) {
        delete estado.escolhas[dados.id];
      } else {
        estado.escolhas[dados.id] = { personagem: dados, acao: a };
      }
      abrirPainelAcao(dados);
      atualizarHud();
    });
    lista.appendChild(botao);
  });

  painel.hidden = false;
}

function fecharPainelAcao() {
  document.getElementById('painel-acao').hidden = true;
}

/* ===== Rodar ano ===== */

function rodarAno() {
  const escolhidos = Object.values(estado.escolhas).filter(Boolean);
  escolhidos.forEach(({ personagem, acao }) => {
    estado.dinheiro -= acao.custo;
    const resultado = acao.efeito();
    adicionarLog(`${personagem.nome}: ${acao.nome}`, 'acao', resultado || acao.log);
  });

  rodarEvento();
  avancoDoAgro();
  impactoDoAgro();
  rendaAnual();

  const ehEleicao = estado.ano === 6 || estado.ano === 12;
  if (ehEleicao) {
    adicionarLog('É período eleitoral!', 'historia', 'O apoio político decide o futuro da floresta.');
    fazerEleicao();
  }

  estado.ano += 1;
  estado.escolhas = {};
  fecharPainelAcao();

  if (estado.ano >= ANOS + 1) {
    finalizar();
    return;
  }

  const novaFase = estado.ano <= 4 ? 1 : estado.ano <= 8 ? 2 : 3;
  if (novaFase !== estado.fase) {
    estado.fase = novaFase;
    mostrarHistoria(novaFase);
    return;
  }

  atualizarHud();
  verificarDerrota();
}

function verificarDerrota() {
  const comunidades = [estado.extrativista, estado.ribeirinho, estado.urbano];
  if (estado.floresta <= 0 || comunidades.some((c) => c <= 0)) {
    finalizar(false);
  }
}

function finalizar(venceu) {
  const tela = document.getElementById('tela-fim');
  tela.hidden = false;

  const media = (estado.extrativista + estado.ribeirinho + estado.urbano) / 3;
  const vitoria = venceu !== false && estado.floresta >= 50 && media >= 40;

  tela.className = `tela-fim ${vitoria ? 'vitoria' : 'derrota'}`;
  document.getElementById('fim-titulo').textContent = vitoria
    ? '🏆 Floresta em pé! Você venceu.'
    : 'A floresta está em perigo...';
  document.getElementById('fim-mensagem').textContent = vitoria
    ? `Após ${ANOS} anos, a floresta permanece em ${estado.floresta}% e as comunidades com ${Math.round(media)} de bem-estar. Os empates, a educação e o voto venceram o desmatamento.`
    : `A floresta chegou a ${estado.floresta}% e o bem-estar médio foi ${Math.round(media)}. O gado e as queimadas venceram desta vez — mas a luta continua.`;

  if (vitoria) lancarConfete();
}

function lancarConfete() {
  const cores = ['#58c07a', '#f1c40f', '#e74c3c', '#5d9cec', '#a86ce0'];
  for (let i = 0; i < 60; i++) {
    const peca = document.createElement('div');
    peca.className = 'confete';
    peca.style.left = `${Math.random() * 100}%`;
    peca.style.background = cores[Math.floor(Math.random() * cores.length)];
    peca.style.animationDelay = `${Math.random() * 2}s`;
    document.body.appendChild(peca);
  }
}

function mostrarHistoria(fase) {
  const h = historias[fase];
  document.getElementById('historia-fase').textContent = h.fase;
  document.getElementById('historia-titulo').textContent = h.titulo;
  document.getElementById('historia-texto').textContent = h.texto;
  document.getElementById('modal-historia').hidden = false;
}

/* ===== Controle do jogador ===== */

function moverJogador() {
  const velocidade = 0.35;
  let dx = 0, dz = 0;
  if (teclas['w'] || teclas['arrowup']) dz -= 1;
  if (teclas['s'] || teclas['arrowdown']) dz += 1;
  if (teclas['a'] || teclas['arrowleft']) dx -= 1;
  if (teclas['d'] || teclas['arrowright']) dx += 1;

  if (dx !== 0 || dz !== 0) {
    const comprimento = Math.sqrt(dx * dx + dz * dz);
    const novoX = jogador.position.x + (dx / comprimento) * velocidade;
    const novoZ = jogador.position.z + (dz / comprimento) * velocidade;

    jogador.position.x = Math.max(-LIMITE_MUNDO, Math.min(LIMITE_MUNDO, novoX));
    jogador.position.z = Math.max(-LIMITE_MUNDO, Math.min(LIMITE_MUNDO, novoZ));

    jogador.rotation.y = Math.atan2(dx, dz);
  }

  const proximo = encontrarProximo();
  if (proximo && proximo.id !== (interacaoAtual && interacaoAtual.id)) {
    personagens3d.forEach(({ dados, anel }) => {
      anel.material.opacity = dados.id === proximo.id ? 1 : 0;
    });
  }
  document.getElementById('hud-aviso').hidden = !proximo;
  interacaoAtual = proximo;
}

/* ===== Loop de animação ===== */

function animarBorboletas(tempo) {
  borboletas.forEach((b) => {
    const t = tempo * b.velocidade + b.fase;
    b.grupo.position.x = b.ativo ? b.baseX + Math.sin(t) * b.raio : b.baseX;
    b.grupo.position.z = b.ativo ? b.baseZ + Math.cos(t * 0.7) * b.raio : b.baseZ;
    b.grupo.position.y = b.baseY + Math.sin(t * 1.3) * 0.5;
    b.grupo.rotation.y = Math.sin(t * 0.9) * 1.6;
    b.grupo.children.forEach((asa) => {
      const flap = Math.sin(tempo * 14);
      asa.position.y = Math.abs(flap) * 0.3;
      asa.rotation.z = flap * 0.4;
    });
  });
}

function animarPassaros(tempo) {
  passaros.forEach((p) => {
    const t = tempo * p.velocidade + p.fase;
    const raio = p.raio;
    p.grupo.x = p.sx + Math.cos(t) * raio;
    p.grupo.z = p.sz + Math.sin(t) * raio;
    p.grupo.y = p.altura + Math.sin(t * 2) * 2;
    p.grupo.rotation.y = -Math.sin(t) * 0.2 + Math.PI / 2;
    p.grupo.children.forEach((asa) => {
      asa.rotation.z = -0.3 + Math.sin(tempo * 9) * 0.55;
    });
  });
}

function animar() {
  requestAnimationFrame(animar);

  if (modoVR) {
    moverJogadorVR();
  } else {
    moverJogador();
  }

  const tempo = Date.now() * 0.002;

  arvores.forEach((arvore) => {
    const alvo = arvore.userData.alvo;
    const atual = arvore.userData.crescendo;
    const novo = atual + (alvo - atual) * 0.05;
    arvore.userData.crescendo = novo;
    const base = arvore.userData.baseEscala || 1;
    arvore.scale.setScalar(novo * base);
  });

  animarBorboletas(tempo);
  animarPassaros(tempo);

  avancarGadoPasso();

  personagens3d.forEach(({ avatar }) => {
    avatar.position.y = Math.sin(tempo + avatar.position.x) * 0.15;
  });

  jogador.position.y = Math.abs(Math.sin(tempo * 3)) * 0.15;

  if (modoVR) {
    orientacaoAtual.yaw += (orientacaoAtual.yawAlvo - orientacaoAtual.yaw) * 0.2;
    orientacaoAtual.pitch += (orientacaoAtual.pitchAlvo - orientacaoAtual.pitch) * 0.2;
    posicionarCameraVR();
    if (estereo) {
      estereo.update(camera);
      renderizarEstereo();
    } else {
      renderizador.render(cena, camera);
    }
  } else {
    // Câmera segue o jogador
    const cx = jogador.position.x + Math.sin(tempo * 0.1) * 0;
    camera.position.x += (cx - camera.position.x) * 0.08;
    camera.position.z = jogador.position.z + 24;
    camera.position.y = 22;
    camera.lookAt(jogador.position.x, 1, jogador.position.z - 5);
    if (camera.near !== 0.1) {
      camera.near = 0.1;
      camera.far = 500;
      camera.updateProjectionMatrix();
    }
    renderizador.render(cena, camera);
  }
}

function posicionarCameraVR() {
  const o = orientacaoAtual;
  const olhoY = 1.8;
  const altura = 1.8;

  camera.position.set(jogador.position.x, jogador.position.y + olhoY, jogador.position.z);

  const dirX = Math.sin(o.yaw) * Math.cos(o.pitch);
  const dirY = Math.sin(o.pitch);
  const dirZ = Math.cos(o.yaw) * Math.cos(o.pitch);

  camera.up.set(0, 1, 0);
  camera.lookAt(camera.position.x + dirX, Math.max(0.1, camera.position.y + dirY), camera.position.z + dirZ);

  jogador.rotation.y = o.yaw;
}

function renderizarEstereo() {
  const w = renderizador.domElement.clientWidth || window.innerWidth;
  const h = renderizador.domElement.clientHeight || window.innerHeight;

  renderizador.setScissorTest(true);

  renderizador.setScissor(0, 0, w / 2, h);
  renderizador.setViewport(0, 0, w / 2, h);
  renderizador.render(cena, estereo.cameraL);

  renderizador.setScissor(w / 2, 0, w / 2, h);
  renderizador.setViewport(w / 2, 0, w / 2, h);
  renderizador.render(cena, estereo.cameraR);

  renderizador.setScissorTest(false);
}

/* ===== Eventos de entrada ===== */

window.addEventListener('keydown', (e) => {
  teclas[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e') {
    if (document.getElementById('modal-historia').hidden) {
      if (document.getElementById('painel-acao').hidden) {
        interagir();
      } else {
        fecharPainelAcao();
      }
    }
  }
  if (e.key === 'Escape') fecharPainelAcao();
});

window.addEventListener('keyup', (e) => {
  teclas[e.key.toLowerCase()] = false;
});

/* ===== Fluxo do jogo ===== */

function comecar() {
  document.getElementById('tela-intro').hidden = true;
  document.getElementById('hud').hidden = false;
  document.getElementById('painel-log').hidden = false;
  document.getElementById('barra-avancar').hidden = false;
  iniciar3D();
  mostrarHistoria(1);
}

function continuarDaHistoria() {
  document.getElementById('modal-historia').hidden = true;
  atualizarHud();
}

document.getElementById('botao-comecar').addEventListener('click', comecar);
document.getElementById('botao-historia').addEventListener('click', continuarDaHistoria);
document.getElementById('botao-avancar').addEventListener('click', rodarAno);
document.getElementById('fechar-acao').addEventListener('click', fecharPainelAcao);
document.getElementById('botao-reiniciar').addEventListener('click', () => {
  Object.assign(estado, {
    ano: 1, dinheiro: 30000, floresta: 70, pressao: 30,
    extrativista: 50, ribeirinho: 50, urbano: 50, apoio: 30,
    demarcado: false, fase: 1, escolhas: {}
  });
  document.getElementById('tela-fim').hidden = true;
  document.getElementById('log').innerHTML = '';
  document.querySelectorAll('.confete').forEach((c) => c.remove());
  mostrarHistoria(1);
});

/* ===== Controles VR ===== */

document.getElementById('botao-vr').addEventListener('click', async () => {
  if (modoVR) {
    desligarModoVR();
  } else {
    if (!renderizador || typeof THREE.StereoCamera === 'undefined') {
      alert('Modo VR requer WebGL. Abra em um navegador com suporte.');
      return;
    }
    const ok = await verificarPermissaoGiroscopio();
    if (!ok) {
      alert('Sem acesso ao giroscópio. A permissão foi negada.');
      return;
    }
    orientacaoAtual.yawAlvo = Math.PI;
    orientacaoAtual.pitchAlvo = 0;
    ligarModoVR();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  ligarJoystick(document.getElementById('joystick'));
});
