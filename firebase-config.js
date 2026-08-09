/* ===== Configuração do Firebase (Floresta em Pé) ===== */
/* Chaves públicas do app — seguras para expor no front-end.
   A proteção dos dados acontece pelas regras do Firestore. */

const firebaseConfig = {
  apiKey: "AIzaSyDIQRNYeXbYtVZggX_mBkrWc7PF2fUmN1c",
  authDomain: "floresta-em-pe-8d981.firebaseapp.com",
  projectId: "floresta-em-pe-8d981",
  storageBucket: "floresta-em-pe-8d981.firebasestorage.app",
  messagingSenderId: "200588101720",
  appId: "1:200588101720:web:cfa5fee61aa3ea603c222d",
  measurementId: "G-185XDTD0QR"
};

let appFirebase = null;

function iniciarFirebase() {
  if (typeof firebase === 'undefined' || appFirebase) return;
  appFirebase = firebase.initializeApp(firebaseConfig);
}

/* ===== Login com Google ===== */

function loginGoogle() {
  iniciarFirebase();
  const provedor = new firebase.auth.GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: 'select_account' });
  return firebase.auth().signInWithPopup(provedor);
}

function sairJogo() {
  if (appFirebase) firebase.auth().signOut();
}

function quandoUsuarioMudar(callback) {
  iniciarFirebase();
  firebase.auth().onAuthStateChanged(callback);
}

function usuarioAtual() {
  if (!appFirebase) return null;
  return firebase.auth().currentUser;
}

/* ===== Contador de acessos ===== */
function registrarAcesso() {
  if (!appFirebase) return;
  const banco = firebase.firestore();
  const ref = banco.collection('metricas').doc('acessos');
  ref.set({ total: firebase.firestore.FieldValue.increment(1) }, { merge: true })
    .catch(() => {});
}

function lerTotalAcessos(callback) {
  if (!appFirebase) {
    callback(0);
    return;
  }
  const banco = firebase.firestore();
  banco.collection('metricas').doc('acessos').get()
    .then((doc) => {
      callback(doc.exists ? (doc.data().total || 0) : 0);
    })
    .catch(() => callback(0));
}

/* ===== Perfil do jogador ===== */
function carregarJogador(uid) {
  if (!appFirebase) return Promise.resolve(null);
  return firebase.firestore()
    .collection('jogadores')
    .doc(uid)
    .get()
    .then((doc) => (doc.exists ? doc.data() : null))
    .catch(() => null);
}

function salvarJogador(dados) {
  if (!appFirebase || !dados.uid) return Promise.resolve();
  return firebase.firestore()
    .collection('jogadores')
    .doc(dados.uid)
    .set(dados, { merge: true });
}

/* ===== Evolução ===== */

function nivelPorPontos(pontos) {
  return Math.floor(pontos / 400) + 1;
}

function espacoVerdeDe(pontos) {
  return Math.min(100, pontos * 3);
}