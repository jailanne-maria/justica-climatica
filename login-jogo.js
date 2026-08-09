/* ===== Integração do jogo com Firebase ===== */
let jogadorAtual = null;
let progressoPerfil = null;
let desafiosAtivo = false;
let desafioTimer = null;

function aplicativoPronto() {
  return typeof firebase !== 'undefined';
}

/* ─── Tela de login ─── */
document.addEventListener('DOMContentLoaded', () => {
  const botaoLogin = document.getElementById('botao-login');
  const botaoSair = document.getElementById('botao-sair');
  const areaLogin = document.getElementById('login-area');
  const areaPerfil = document.getElementById('perfil-area');

  if (aplicativoPronto()) {
    lerTotalAcessos((n) => {
      const el = document.getElementById('total-acessos');
      if (el) el.textContent = n.toLocaleString('pt-BR');
    });
  }

  const botaoChat = document.getElementById('chat-botao');
  const botaoFecharChat = document.getElementById('chat-fechar');

  function ligarChat() {
    if (botaoChat) botaoChat.hidden = jogadorAtual ? false : true;
    if (botaoChat) botaoChat.onclick = alternarChat;
    if (botaoFecharChat) botaoFecharChat.onclick = alternarChat;
    if (jogadorAtual) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'c' || e.key === 'C') alternarChat();
      });
    }
  }

  ligarChat();

  restaurarSessao();

  botaoLogin.addEventListener('click', async () => {
    botaoLogin.disabled = true;
    botaoLogin.textContent = 'Abrindo Google...';
    try {
      const resultado = await loginGoogle();
      const usuario = resultado.user;

      const dadosBanco = await carregarJogador(usuario.uid);
      progressoPerfil = Object.assign(
        { pontos: 0, partidas: 0, vitorias: 0, nivel: 1, espacoVerde: 0 },
        dadosBanco || {}
      );
      progressoPerfil.nome = usuario.displayName || 'Guardiã';

      jogadorAtual = {
        uid: usuario.uid,
        nome: progressoPerfil.nome,
        email: usuario.email || ''
      };

      registrarAcesso();
      mostrarPerfil();
    } catch (erro) {
      botaoLogin.disabled = false;
      botaoLogin.textContent = 'Entrar com Google';
      document.getElementById('login-erro').hidden = false;
      console.error('Erro no login:', erro);
    }
  });

  botaoSair.addEventListener('click', () => {
    pararChat();
    sairJogo();
    jogadorAtual = null;
    progressoPerfil = null;
    areaPerfil.hidden = true;
    areaLogin.hidden = false;
    atualizarBotaoChat();
  });

  areaLogin.hidden = false;
  areaPerfil.hidden = true;
});

function restaurarSessao() {
  if (!aplicativoPronto()) return;
  quandoUsuarioMudar(async (usuario) => {
    if (!usuario) {
      pararChat();
      jogadorAtual = null;
      progressoPerfil = null;
      const areaLogin = document.getElementById('login-area');
      const areaPerfil = document.getElementById('perfil-area');
      if (areaLogin) areaLogin.hidden = false;
      if (areaPerfil) areaPerfil.hidden = true;
      atualizarBotaoChat();
      return;
    }

    const dadosBanco = await carregarJogador(usuario.uid);
    progressoPerfil = Object.assign(
      { pontos: 0, partidas: 0, vitorias: 0, nivel: 1, espacoVerde: 0 },
      dadosBanco || {}
    );
    progressoPerfil.nome = usuario.displayName || 'Guardiã';

    jogadorAtual = {
      uid: usuario.uid,
      nome: progressoPerfil.nome,
      email: usuario.email || ''
    };

    mostrarPerfil();
  });
}

function mostrarPerfil() {
  const areaLogin = document.getElementById('login-area');
  const areaPerfil = document.getElementById('perfil-area');
  areaLogin.hidden = true;
  areaPerfil.hidden = false;
  atualizarPerfil();
  pararChat();
  atualizarBotaoChat();
}

function atualizarBotaoChat() {
  const botaoChat = document.getElementById('chat-botao');
  if (botaoChat) botaoChat.hidden = !jogadorAtual;
}

function atualizarPerfil() {
  if (!progressoPerfil) return;
  const nomeEl = document.getElementById('perfil-nome');
  if (nomeEl) nomeEl.textContent = progressoPerfil.nome || 'Guardiã';
  const pontosEl = document.getElementById('perfil-pontos');
  if (pontosEl) pontosEl.textContent = (progressoPerfil.pontos || 0).toLocaleString('pt-BR');
  const nivelEl = document.getElementById('perfil-nivel');
  if (nivelEl) nivelEl.textContent = progressoPerfil.nivel || 1;
  const verdeEl = document.getElementById('perfil-verde');
  if (verdeEl) verdeEl.textContent = `${progressoPerfil.espacoVerde || 0}%`;
  const barra = document.getElementById('barra-espaco-verde');
  if (barra) barra.style.width = `${progressoPerfil.espacoVerde || 0}%`;
}

/* ─── Evolução após cada partida ─── */
function registrarEvolucao(ganhou, restoAtual) {
  if (!jogadorAtual || !progressoPerfil) return;

  progressoPerfil.partidas = (progressoPerfil.partidas || 0) + 1;
  if (ganhou) progressoPerfil.vitorias = (progressoPerfil.vitorias || 0) + 1;

  const pontosGanhos = ganhou
    ? Math.round(100 + (restoAtual.floresta || 0))
    : Math.round(20 + Math.max(0, (restoAtual.floresta || 0)));

  progressoPerfil.pontos = (progressoPerfil.pontos || 0) + pontosGanhos;
  progressoPerfil.espacoVerde = espacoVerdeDe(progressoPerfil.pontos);
  progressoPerfil.nivel = nivelPorPontos(progressoPerfil.pontos);

  salvarJogador(Object.assign({ uid: jogadorAtual.uid }, progressoPerfil));

  const el = document.getElementById('fim-evolucao');
  if (el) {
    el.hidden = false;
    el.innerHTML = `<strong>+${pontosGanhos} pontos</strong> · Nível ${progressoPerfil.nivel} · 🌱 Espaço verde ${progressoPerfil.espacoVerde}%`;
  }
  atualizarPerfil();
}

/* ─── Desafio das Queimadas (mini-jogo) ─── */
function iniciarDesafioQueimadas() {
  if (!aplicativoPronto() || !jogadorAtual || desafiosAtivo) return;
  desafiosAtivo = true;

  const tempoTotal = 12;
  let tempoRestante = tempoTotal;
  let apagados = 0;
  const total = 8;

  const container = document.getElementById('queimadas');
  const area = document.getElementById('queimadas-area');
  document.getElementById('queimadas-tempo').textContent = `${tempoTotal}s`;
  document.getElementById('queimadas-contador').textContent = `0/${total}`;
  container.hidden = false;
  area.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const fogo = document.createElement('button');
    fogo.className = 'fogo';
    fogo.textContent = '🔥';
    fogo.style.left = `${8 + Math.random() * 80}%`;
    fogo.style.top = `${8 + Math.random() * 70}%`;
    fogo.addEventListener('click', () => {
      if (fogo.disabled) return;
      fogo.classList.add('apagado');
      fogo.textContent = '💨';
      fogo.disabled = true;
      apagados++;
      document.getElementById('queimadas-contador').textContent = `${apagados}/${total}`;
      if (apagados === total) finalizarDesafio(true, tempoRestante);
    });
    area.appendChild(fogo);
  }

  desafioTimer = setInterval(() => {
    tempoRestante--;
    document.getElementById('queimadas-tempo').textContent = `${tempoRestante}s`;
    if (tempoRestante <= 0 && apagados < total) {
      clearInterval(desafioTimer);
      finalizarDesafio(false, 0);
    }
  }, 1000);
}

function finalizarDesafio(venceu, tempoRestante) {
  desafiosAtivo = false;
  clearInterval(desafioTimer);
  document.getElementById('queimadas').hidden = true;
  const aviso = document.getElementById('queimadas-resultado');
  if (venceu) {
    const bonus = Math.min(20, tempoRestante + 2);
    estado.pressao = Math.max(0, estado.pressao - 15 - bonus);
    estado.apoio = Math.min(100, estado.apoio + 8);
    aviso.textContent = '🔥 Queimada contida! A pressão do fogo diminuiu.';
    aviso.className = 'feedback-vitoria';
  } else {
    estado.floresta = Math.max(0, estado.floresta - 6);
    aviso.textContent = 'O fogo avançou e a floresta sofreu... mas a luta continua.';
    aviso.className = 'feedback-derrota';
  }
  aviso.hidden = false;
  if (typeof atualizarPainel === 'function') atualizarPainel();
  setTimeout(() => { aviso.hidden = true; }, 4000);
  desafioTimer = null;
}

/* ─── Chat da comunidade ─── */
let chatAtivo = false;
let chatListener = null;

function iniciarChat() {
  if (!aplicativoPronto() || !jogadorAtual || chatAtivo) return;
  chatAtivo = true;
  const lista = document.getElementById('chat-msgs');
  lista.innerHTML = '';

  const banco = firebase.firestore();
  chatListener = banco
    .collection('mensagens')
    .orderBy('data', 'desc')
    .limit(30)
    .onSnapshot((snap) => {
      lista.innerHTML = '';
      snap.forEach((doc) => {
        const m = doc.data();
        const item = document.createElement('div');
        item.className = 'chat-msg';
        const ehEu = m.uid === jogadorAtual.uid;
        if (ehEu) item.classList.add('minha');
        item.innerHTML = `<span class="chat-nome">${m.nome || 'Guardiã'}</span><span class="chat-texto">${m.texto}</span>`;
        lista.appendChild(item);
      });
      lista.scrollTop = 0;
    });

  const botao = document.getElementById('chat-enviar');
  const campo = document.getElementById('chat-input');
  botao.onclick = enviarMensagem;
  campo.onkeydown = (e) => {
    if (e.key === 'Enter') enviarMensagem();
  };
}

function enviarMensagem() {
  const campo = document.getElementById('chat-input');
  const texto = campo.value.trim();
  if (!texto || !jogadorAtual) return;
  campo.value = '';
  firebase.firestore().collection('mensagens').add({
    nome: jogadorAtual.nome,
    texto: texto,
    data: firebase.firestore.FieldValue.serverTimestamp()
  }).catch((e) => console.error('Erro ao enviar mensagem:', e));
}

function alternarChat() {
  const painel = document.getElementById('chat-painel');
  const aberto = !painel.hidden;
  painel.hidden = aberto;
  if (!aberto && !chatAtivo) iniciarChat();
}

function pararChat() {
  if (chatListener) chatListener();
  chatAtivo = false;
  chatListener = null;
}

/* Barra de evolução usada na tela de login */
const elementoNovaVisita = null;