const ANOS = 12;

const personagens = [
  {
    id: 'marinalva',
    nome: 'Dona Marinalva',
    papel: 'Extrativista',
    emoji: '🌰',
    cor: '#b5793a',
    acoes: [
      {
        nome: 'Colher castanha',
        desc: 'Renda com a floresta em pé.',
        custo: 0,
        efeito: () => { estado.extrativista += 8; estado.dinheiro += 6000; },
        log: 'Dona Marinalva colheu castanha: a floresta em pé pagou a conta.'
      },
      {
        nome: 'Fazer um empate',
        desc: 'Sentar-se diante das motosserras, como Chico Mendes ensinou. Para o desmate.',
        custo: 0,
        efeito: () => { estado.pressao = Math.max(0, estado.pressao - 50); estado.extrativista += 5; },
        log: 'Empate! As famílias sentaram diante das máquinas. O desmatamento parou.'
      },
      {
        nome: 'Plantar mudas',
        desc: 'Recuperar áreas degradadas.',
        custo: 4000,
        efeito: () => { estado.floresta += 6; },
        log: 'Dona Marinalva plantou mudas em área degradada.'
      }
    ]
  },
  {
    id: 'joao',
    nome: 'Seu João',
    papel: 'Ribeirinho',
    emoji: '🐟',
    cor: '#3a6fb5',
    acoes: [
      {
        nome: 'Pescar com manejo',
        desc: 'Renda com pesca sustentável.',
        custo: 0,
        efeito: () => { estado.ribeirinho += 6; estado.dinheiro += 4000; },
        log: 'Seu João pescou com manejo: peixes e renda garantidos.'
      },
      {
        nome: 'Proteger igarapés',
        desc: 'Defender os rios e a mata ciliar.',
        custo: 3000,
        efeito: () => { estado.ribeirinho += 10; estado.floresta += 3; },
        log: 'Igarapés protegidos: água e floresta mais saudáveis.'
      },
      {
        nome: 'Vigiar queimadas',
        desc: 'Alertar e conter o fogo no território.',
        custo: 2000,
        efeito: () => { estado.pressao = Math.max(0, estado.pressao - 25); },
        log: 'A rede de vigilância conteve o avanço das queimadas.'
      }
    ]
  },
  {
    id: 'helena',
    nome: 'Guajarina',
    papel: 'Amazônia urbana',
    emoji: '🏫',
    cor: '#8a4bb0',
    acoes: [
      {
        nome: 'Aula de educação ambiental',
        desc: 'Formar a próxima geração da cidade.',
        custo: 2000,
        efeito: () => { estado.urbano += 8; estado.apoio += 5; },
        log: 'Guajarina levou a floresta para a sala de aula: a cidade entendeu o valor dela.'
      },
      {
        nome: 'Organizar mutirão',
        desc: 'Unir a comunidade urbana pela causa.',
        custo: 3000,
        efeito: () => { estado.urbano += 6; estado.apoio += 8; },
        log: 'Mutirão na cidade: quem vive longe da mata agora a defende.'
      },
      {
        nome: 'Fazer campanha eleitoral',
        desc: 'Apoiar candidatos comprometidos com a floresta.',
        custo: 5000,
        efeito: () => { estado.apoio += 20; },
        log: 'Campanha pela floresta: candidatos ouviram a voz da comunidade.'
      }
    ]
  },
  {
    id: 'araquem',
    nome: 'Cacique Araquém',
    papel: 'Guardião do território',
    emoji: '🏹',
    cor: '#2f7a3d',
    acoes: [
      {
        nome: 'Demarcar território',
        desc: 'Garantir a terra legalmente. Proteção permanente.',
        custo: 8000,
        efeito: () => {
          if (!estado.demarcado) {
            estado.demarcado = true;
            estado.pressao -= 30;
            estado.apoio += 10;
            return 'Território demarcado! A floresta agora tem proteção legal.';
          }
          return 'Território já demarcado: a lei protege a floresta.';
        }
      },
      {
        nome: 'Fazer um empate',
        desc: 'Bloquear o desmate com presença e coragem.',
        custo: 0,
        efeito: () => { estado.pressao = Math.max(0, estado.pressao - 40); estado.floresta += 1; },
        log: 'Empate no território! O avanço do gado foi bloqueado.'
      },
      {
        nome: 'Compartilhar saberes',
        desc: 'Ensinar manejo tradicional que conserva.',
        custo: 1000,
        efeito: () => { estado.floresta += 4; estado.extrativista += 6; },
        log: 'Saberes tradicionais compartilhados: conhecimento que protege a mata.'
      }
    ]
  }
];

const historias = {
  1: {
    fase: 'Fase 1 · Resistir',
    titulo: 'O empate: a arma dos que amam a floresta',
    texto: 'Nos anos 1980, os seringueiros do Acre criaram o "empate": famílias inteiras sentavam-se diante das motosserras para impedir a derrubada da floresta. Chico Mendes liderou essa resistência pacífica e se tornou símbolo mundial. As queimadas limpam o pasto para o gado avançar — cabe a você deter o boi com união.'
  },
  2: {
    fase: 'Fase 2 · Construir',
    titulo: 'A Reserva Extrativista',
    texto: 'Em 1990, um ano após a morte de Chico Mendes, o Brasil criou a primeira Reserva Extrativista do país, no Acre, em sua homenagem. Ali, castanha, borracha e açaí são colhidos com a floresta em pé. Sua missão agora é transformar a resistência em uma economia que valoriza a mata.'
  },
  3: {
    fase: 'Fase 3 · Consolidar',
    titulo: 'A floresta também forma lideranças',
    texto: 'Marina Silva, seringueira nascida no Acre, tornou-se ministra do Meio Ambiente e mostrou ao mundo que a floresta forma lideranças. O período eleitoral é decisivo: candidatos que defendem a floresta ou o desmatamento? Seu apoio político define o futuro.'
  }
};

const historiasEleicao = {
  vitoria: {
    titulo: '🗳️ A floresta venceu as eleições',
    texto: 'Os candidatos que defendem a floresta venceram. Novas políticas de proteção foram aprovadas e o agro sustentável ganhou apoio. O pragmatismo das comunidades foi ouvido.'
  },
  derrota: {
    titulo: '🗳️ O desmatamento ganhou as urnas',
    texto: 'Candidatos ligados ao agro avançaram. Queimadas e desmatamento ganharam força. Mas a luta continua — a floresta ainda depende de você.'
  }
};

const avisos = [
  { tipo: 'frase', texto: '🌳 Mantenha a floresta em pé: é o bem de todos. Uma árvore a menos, um futuro a menos.' },
  { tipo: 'frase', texto: '🌎 A floresta em pé refrigeri o planeta. Cada ação sua aqui ajuda o mundo inteiro.' },
  { tipo: 'frase', texto: '🛡️ Empate não é derrota: é coragem. Foi assim que Chico Mendes segurou o desmate.' },
  { tipo: 'frase', texto: '💧 Floresta gera chuva. Quem derruba a mata, seca o próprio rio.' },
  { tipo: 'familia', texto: 'Cuidadora Maria das Graças, 52: "Quando o rio subiu, minha família passou três dias sem luz. A gente perdeu tudo, mas não o chão de luta."' },
  { tipo: 'familia', texto: 'Seu Raimundo, pescador: "O igarapé entupido de lixo levou a cheia pra porta de casa. Quem devia limpar, não veio."' },
  { tipo: 'familia', texto: 'Dona Selma, costureira e chefe de família: "Depois da enchente, as aulas pararam. A professora da esquina ficou ilhada."' },
  { tipo: 'familia', texto: 'João, 15: "No Acre, a gente aprende cedo: quem vive da floresta, vive em paz com ela."' },
  { tipo: 'reportagem', texto: 'Em 2024, a Amazônia teve 132 mil focos de incêndio — o maior número em mais de uma década. (INPE)' },
  { tipo: 'reportagem', texto: 'Cada árvore madura absorve cerca de 22 kg de CO₂ por ano. Uma floresta é uma usina limpa. (Fonte: IPCC)' },
  { tipo: 'reportagem', texto: '59% da Amazônia sofreu seca severa em 2024. O rio que sempre deu a vida começou a secar. (OMM/ONU)' },
  { tipo: 'reportagem', texto: 'Enchentes aumentaram nos últimos anos: Rio Branco teve 43 desde 1971. A cada cheia, novos ilhados. (MIDR/Atlas de Desastres)' }
];

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
  {
    nome: 'Enchente histórica do Rio Acre',
    tipo: 'ruim',
    chance: 0.22,
    aplicar: () => {
      estado.ribeirinho = Math.max(0, estado.ribeirinho - 12);
      estado.urbano = Math.max(0, estado.urbano - 6);
      estado.dinheiro -= 5000;
      return 'O Rio Acre subiu e atingiu ribeirinhos e bairros de Rio Branco.';
    }
  },
  {
    nome: 'Preço da castanha dispara',
    tipo: 'bom',
    chance: 0.16,
    aplicar: () => {
      estado.extrativista = Math.min(100, estado.extrativista + 8);
      estado.dinheiro += 8000;
      return 'A castanha do Brasil valorizou no mercado: a floresta em pé rendeu.';
    }
  },
  {
    nome: 'Grande seca no rio',
    tipo: 'ruim',
    chance: 0.14,
    aplicar: () => {
      estado.floresta = Math.max(0, estado.floresta - 3);
      estado.ribeirinho = Math.max(0, estado.ribeirinho - 8);
      return 'A seca encolheu os rios e estressou a floresta.';
    }
  },
  {
    nome: 'Prêmio internacional de conservação',
    tipo: 'bom',
    chance: 0.12,
    aplicar: () => {
      estado.floresta = Math.min(100, estado.floresta + 3);
      estado.dinheiro += 6000;
      estado.apoio = Math.min(100, estado.apoio + 5);
      return 'A reserva ganhou um prêmio mundial: reconhecimento e recursos.';
    }
  },
  {
    nome: 'Turismo comunitário cresce',
    tipo: 'bom',
    chance: 0.1,
    aplicar: () => {
      estado.ribeirinho = Math.min(100, estado.ribeirinho + 6);
      estado.extrativista = Math.min(100, estado.extrativista + 6);
      estado.dinheiro += 5000;
      return 'Visitantes chegaram para conhecer a floresta em pé: renda local.';
    }
  }
];

function rodarEvento() {
  const pesoTotal = eventos.reduce((s, e) => s + e.chance, 0);
  let sorteio = Math.random() * pesoTotal;
  for (const e of eventos) {
    sorteio -= e.chance;
    if (sorteio <= 0) {
      adicionarLog(e.nome, e.tipo, e.aplicar());
      return;
    }
  }
}

function avancoDoAgro() {
  const faseMultiplicador = { 1: 18, 2: 12, 3: 8 };
  const base = faseMultiplicador[estado.fase];
  const reduz = estado.demarcado ? 6 : 0;
  estado.pressao += Math.max(6, base - reduz);
}

function impactoDoAgro() {
  if (estado.pressao >= 100) {
    estado.floresta = Math.max(0, estado.floresta - 15);
    estado.pressao = 30;
    adicionarLog('Queimada para abrir pasto', 'ruim', 'O gado avançou: queimada devastou parte da floresta.');
    return;
  }
  if (estado.pressao >= 70) {
    estado.floresta = Math.max(0, estado.floresta - 5);
    adicionarLog('Desmatamento acelerado', 'ruim', 'O agro pressiona: árvores caíram para virar pasto.');
  } else if (estado.pressao >= 40) {
    estado.floresta = Math.max(0, estado.floresta - 3);
    adicionarLog('Pressão do gado', 'evento', 'O desmatamento avança lentamente nas bordas da reserva.');
  } else {
    estado.floresta = Math.max(0, estado.floresta - 1);
    adicionarLog('Resistência firme', 'evento', 'Os empates seguram o avanço: quase nenhuma perda.');
  }
}

function rendaAnual() {
  const rendaFloresta = Math.round(estado.floresta / 100 * 10000);
  const rendaApoio = Math.round(estado.apoio / 100 * 3000);
  const total = rendaFloresta + rendaApoio;
  estado.dinheiro += total;
  adicionarLog('Renda anual', 'evento', `+R$ ${total.toLocaleString('pt-BR')} vindos da floresta em pé e de apoios.`);
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

  adicionarLog('Queimadas à vista!', 'ruim', 'Focos de incêndio ameaçam a reserva. Proteja a floresta!');
  iniciarDesafioQueimadas();

  estado.ano += 1;
  estado.escolhas = {};

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

  atualizarPainel();
  mostrarAviso();
  verificarDerrota();
}

let ultimoAviso = -1;

function mostrarAviso() {
  const el = document.getElementById('aviso');
  let indice = Math.floor(Math.random() * avisos.length);
  if (indice === ultimoAviso && avisos.length > 1) {
    indice = (indice + 1) % avisos.length;
  }
  ultimoAviso = indice;
  const aviso = avisos[indice];
  el.textContent = aviso.texto;
  el.className = `aviso-item aviso-${aviso.tipo}`;
  el.hidden = false;
  clearTimeout(window.__avisoTimer);
  window.__avisoTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

function verificarDerrota() {
  const comunidades = [estado.extrativista, estado.ribeirinho, estado.urbano];
  if (estado.floresta <= 0 || comunidades.some((c) => c <= 0)) {
    finalizar(false);
  }
}

function finalizar(venceu) {
  const painel = document.getElementById('painel');
  painel.hidden = true;
  const fim = document.getElementById('fim');
  fim.hidden = false;

  const mediaComunidades = (estado.extrativista + estado.ribeirinho + estado.urbano) / 3;
  const vitoria = venceu !== false && estado.floresta >= 50 && mediaComunidades >= 40;

  fim.className = `fim ${vitoria ? 'vitoria' : 'derrota'}`;

  document.getElementById('fim-titulo').textContent = vitoria
    ? '🏆 Floresta em pé! Você venceu.'
    : 'A floresta está em perigo...';

  document.getElementById('fim-mensagem').textContent = vitoria
    ? `Após ${ANOS} anos, a floresta permanece em ${estado.floresta}% e as comunidades com ${Math.round(mediaComunidades)} de bem-estar. Os empates, a educação e o voto venceram o desmatamento. Chico Mendes ficaria orgulhoso.`
    : `A floresta chegou a ${estado.floresta}% e o bem-estar médio foi ${Math.round(mediaComunidades)}. O gado e as queimadas venceram desta vez — mas a luta pela justiça climática continua.`;

  if (vitoria) lancarConfete();
  if (typeof registrarEvolucao === 'function') registrarEvolucao(vitoria, estado);
}

function adicionarLog(titulo, tipo, mensagem) {
  const log = document.getElementById('log');
  const item = document.createElement('div');
  item.className = `log-item ${tipo || 'evento'}`;
  item.innerHTML = `<strong>${titulo}</strong><br>${mensagem}`;
  log.prepend(item);

  if (tipo === 'ruim') tremerTela();
}

function feedbackFlutuante(texto, posX, posY, cor) {
  const painel = document.getElementById('painel');
  const el = document.createElement('span');
  el.className = 'feedback';
  el.textContent = texto;
  el.style.left = `${posX}px`;
  el.style.top = `${posY}px`;
  el.style.color = cor || '#2f7a3d';
  painel.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function tremerTela() {
  const painel = document.getElementById('painel');
  painel.classList.remove('tremendo');
  void painel.offsetWidth;
  painel.classList.add('tremendo');
}

function lancarConfete() {
  const fim = document.getElementById('fim');
  const cores = ['#58c07a', '#f1c40f', '#e74c3c', '#5d9cec', '#a86ce0', '#eaffdf'];
  for (let i = 0; i < 60; i++) {
    const peca = document.createElement('div');
    peca.className = 'confete';
    peca.style.left = `${Math.random() * 100}%`;
    peca.style.background = cores[Math.floor(Math.random() * cores.length)];
    peca.style.animationDelay = `${Math.random() * 2.5}s`;
    peca.style.animationDuration = `${2.5 + Math.random() * 2}s`;
    fim.appendChild(peca);
  }
}

function selecionarAcao(personagemId, acao) {
  if (estado.dinheiro < acao.custo) return;
  const jaEscolhida = estado.escolhas[personagemId];
  if (jaEscolhida && jaEscolhida.acao.nome === acao.nome) {
    delete estado.escolhas[personagemId];
  } else {
    estado.escolhas[personagemId] = { personagem: personagens.find((p) => p.id === personagemId), acao };
    const card = document.getElementById(`personagem-${personagemId}`);
    const retangulo = card.getBoundingClientRect();
    const painelRetangulo = document.getElementById('painel').getBoundingClientRect();
    feedbackFlutuante(
      `✔ ${acao.nome}`,
      retangulo.left - painelRetangulo.left + retangulo.width / 2 - 40,
      retangulo.top - painelRetangulo.top,
      '#2f7a3d'
    );
  }
  atualizarPainel();
}

function montarPersonagens() {
  const grade = document.getElementById('grade-acoes');
  grade.innerHTML = '';
  personagens.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'personagem';
    card.id = `personagem-${p.id}`;
    card.innerHTML = `
      <div class="personagem-cabecalho">
        <div class="avatar" style="background:${p.cor}">${p.emoji}</div>
        <div>
          <div class="avatar-nome">${p.nome}</div>
          <div class="avatar-papel">${p.papel}</div>
        </div>
      </div>
      <div class="personagem-acoes"></div>
    `;
    const container = card.querySelector('.personagem-acoes');
    p.acoes.forEach((a) => {
      const botao = document.createElement('button');
      botao.className = 'cartao-acao';
      botao.dataset.acao = a.nome;
      botao.innerHTML = `<strong>${a.nome}</strong>${a.desc}<br><span class="custo">💰 R$ ${a.custo.toLocaleString('pt-BR')}</span>`;
      botao.addEventListener('click', () => selecionarAcao(p.id, a));
      container.appendChild(botao);
    });
    grade.appendChild(card);
  });
}

function atualizarPainel() {
  document.getElementById('ano').textContent = estado.ano;
  document.getElementById('info-fase').textContent = historias[estado.fase].fase;
  document.getElementById('dinheiro').textContent = estado.dinheiro.toLocaleString('pt-BR');

  const limitar = (v) => Math.max(0, Math.min(100, v));
  estado.floresta = limitar(estado.floresta);
  estado.pressao = limitar(estado.pressao);
  estado.extrativista = limitar(estado.extrativista);
  estado.ribeirinho = limitar(estado.ribeirinho);
  estado.urbano = limitar(estado.urbano);
  estado.apoio = limitar(estado.apoio);

  const configMedidores = [
    ['floresta', 'floresta', '%', estado.floresta],
    ['pressao', 'pressao', '%', estado.pressao],
    ['extrativista', 'extrativista', '', estado.extrativista],
    ['ribeirinho', 'ribeirinho', '', estado.ribeirinho],
    ['urbano', 'urbano', '', estado.urbano],
    ['apoio', 'apoio', '', estado.apoio]
  ];

  configMedidores.forEach(([id, _classe, unidade, valor]) => {
    const barra = document.getElementById(`${id}-barra`);
    barra.style.width = `${Math.max(0, valor)}%`;
    document.getElementById(`${id}-texto`).textContent = `${Math.max(0, valor)}${unidade}`;

    barra.classList.remove('critico', 'alto');
    if (id === 'pressao') {
      if (valor >= 70) barra.classList.add('critico');
      else if (valor >= 40) barra.classList.add('alto');
    } else if (valor <= 25) {
      barra.classList.add('critico');
    } else if (valor >= 75) {
      barra.classList.add('alto');
    }
  });

  personagens.forEach((p) => {
    const card = document.getElementById(`personagem-${p.id}`);
    const escolhido = estado.escolhas[p.id];
    card.classList.toggle('ativo', !!escolhido);
    p.acoes.forEach((a) => {
      const botao = card.querySelector(`.cartao-acao[data-acao="${a.nome}"]`);
      const ehSelecionada = escolhido && escolhido.acao.nome === a.nome;
      botao.classList.toggle('selecionada', ehSelecionada);
      botao.disabled = false;
      if (escolhido && !ehSelecionada) botao.disabled = true;
      if (!escolhido && estado.dinheiro < a.custo) botao.disabled = true;
    });
  });

  const todasEscolhidas = personagens.every((p) => estado.escolhas[p.id]);
  document.getElementById('botao-avancar').disabled = !todasEscolhidas;
}

function mostrarHistoria(fase) {
  const h = historias[fase];
  document.getElementById('historia-fase').textContent = h.fase;
  document.getElementById('historia-titulo').textContent = h.titulo;
  document.getElementById('historia-texto').textContent = h.texto;
  document.getElementById('historia').hidden = false;
  document.getElementById('painel').hidden = true;
}

function comecar() {
  if (!jogadorAtual) {
    document.getElementById('login-area').hidden = false;
    return;
  }
  document.getElementById('intro').hidden = true;
  montarPersonagens();
  mostrarHistoria(1);
}

let casoRealMostrado = false;

function continuarDaHistoria() {
  document.getElementById('historia').hidden = true;
  if (estado.fase === 2 && !casoRealMostrado) {
    casoRealMostrado = true;
    document.getElementById('caso-real').hidden = false;
    return;
  }
  document.getElementById('painel').hidden = false;
  atualizarPainel();
  verificarDerrota();
}

function continuarDoCasoReal() {
  document.getElementById('caso-real').hidden = true;
  document.getElementById('painel').hidden = false;
  atualizarPainel();
  verificarDerrota();
}

document.getElementById('botao-comecar').addEventListener('click', comecar);
document.getElementById('botao-historia').addEventListener('click', continuarDaHistoria);
document.getElementById('botao-caso').addEventListener('click', continuarDoCasoReal);
document.getElementById('botao-avancar').addEventListener('click', rodarAno);
document.getElementById('botao-reiniciar').addEventListener('click', () => {
  Object.assign(estado, {
    ano: 1, dinheiro: 30000, floresta: 70, pressao: 30,
    extrativista: 50, ribeirinho: 50, urbano: 50, apoio: 30,
    demarcado: false, fase: 1, escolhas: {}
  });
  document.getElementById('fim').hidden = true;
  document.getElementById('log').innerHTML = '';
  casoRealMostrado = false;
  comecar();
});
