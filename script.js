// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const lista = document.querySelector('.menu-lista');

toggle.addEventListener('click', () => {
  lista.classList.toggle('aberto');
});

// Fecha o menu ao clicar em um link (celular)
lista.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    lista.classList.remove('aberto');
  });
});

// Destaca a fase atual no menu conforme a rolagem
const fases = document.querySelectorAll('.fase');
const linksFase = document.querySelectorAll('.menu-lista a[href^="#"]');

const observadorFase = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        linksFase.forEach((link) => link.classList.remove('ativo'));
        const ativo = document.querySelector(
          `.menu-lista a[href="#${entrada.target.id}"]`
        );
        if (ativo) ativo.classList.add('ativo');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

fases.forEach((f) => observadorFase.observe(f));

// Animação dos números ao aparecer na tela
const valores = document.querySelectorAll('.valor');

function animarValor(el) {
  const alvo = Number(el.dataset.alvo);
  const unidade = el.dataset.unidade || '';
  const decimais = Number(el.dataset.decimais || 0);
  const duracao = 1600;
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const valorAtual = (progresso * alvo).toFixed(decimais);
    el.textContent = valorAtual.replace('.', ',') + unidade;

    if (progresso < 1) {
      requestAnimationFrame(passo);
    } else {
      el.textContent = String(alvo).replace('.', ',') + unidade;
    }
  }

  requestAnimationFrame(passo);
}

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarValor(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.5 }
);

valores.forEach((v) => observador.observe(v));
