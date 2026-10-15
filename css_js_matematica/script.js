/* =========================================================
   ALVO — interações da página
   ========================================================= */

/* ---------- utilitários ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const superscript = n => String(n).split('').map(c => SUP[c] || c).join('');
function scientific(value) {
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  return mantissa.toFixed(6).replace('.', ',') + ' × 10' + superscript(exponent);
}
const fmt = (n, digits = 3) => n.toLocaleString('pt-BR', { maximumFractionDigits: digits });

// gerador pseudo-aleatório com semente (o mapa fica sempre igual)
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* ---------- menu mobile ---------- */
const navToggle = $('#navToggle');
const navLinks = $('#navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

/* ---------- imagens ausentes viram placeholder ---------- */
$$('img[data-fallback]').forEach(img => {
  const fail = () => img.parentElement.classList.add('no-img');
  if (img.complete && img.naturalWidth === 0) fail();
  img.addEventListener('error', fail);
});

/* =========================================================
   FAT MAN — etapas "Como funcionava?"
   ========================================================= */
(function fatMan() {
  const stepBtns = $$('#fmStepper button');
  const dots = $$('#fmDots button');
  const cards = $$('#fmTrack .fm-card');
  const track = $('#fmTrack');
  let current = 0;

  // blocos de explosivo (lentes) em volta do núcleo
  const lens = $('#lensBlocks');
  const blocks = 12;
  for (let i = 0; i < blocks; i++) {
    const a0 = (i / blocks) * Math.PI * 2 + 0.04;
    const a1 = ((i + 1) / blocks) * Math.PI * 2 - 0.04;
    const r0 = 30, r1 = 64;
    const p = (r, a) => `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${p(r0, a0)} ${p(r1, a0)} ${p(r1, a1)} ${p(r0, a1)}`);
    poly.setAttribute('fill', i % 2 ? '#e4b51c' : '#c99a12');
    poly.setAttribute('stroke', '#5a4708');
    lens.appendChild(poly);
  }

  function setStep(i) {
    current = (i + cards.length) % cards.length;
    stepBtns.forEach((b, k) => b.classList.toggle('active', k === current));
    dots.forEach((b, k) => b.classList.toggle('active', k === current));
    cards.forEach((c, k) => c.classList.toggle('active', k === current));
    // em telas menores o trilho rola até o cartão ativo
    if (track.scrollWidth > track.clientWidth) {
      const card = cards[current];
      track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  stepBtns.forEach(b => b.addEventListener('click', () => setStep(+b.dataset.step)));
  dots.forEach(b => b.addEventListener('click', () => setStep(+b.dataset.step)));
  cards.forEach((c, k) => c.addEventListener('click', () => setStep(k)));
  $('#fmPrev').addEventListener('click', () => setStep(current - 1));
  $('#fmNext').addEventListener('click', () => setStep(current + 1));
})();

/* =========================================================
   MAPA DAS ALEUTAS (gerado)
   ========================================================= */
(function aleutas() {
  const g = $('#aleutasIslands');
  if (!g) return;
  const rand = seeded(42);
  const NS = 'http://www.w3.org/2000/svg';

  function island(cx, cy, size, cls) {
    const pts = [];
    const n = 5 + Math.floor(rand() * 4);
    const stretch = 1 + rand() * 1.8;
    const rot = -0.4 + rand() * 0.3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = size * (0.6 + rand() * 0.6);
      const x = Math.cos(a) * r * stretch, y = Math.sin(a) * r;
      pts.push(`${(cx + x * Math.cos(rot) - y * Math.sin(rot)).toFixed(1)},${(cy + x * Math.sin(rot) + y * Math.cos(rot)).toFixed(1)}`);
    }
    const poly = document.createElementNS(NS, 'polygon');
    poly.setAttribute('points', pts.join(' '));
    poly.setAttribute('class', cls);
    g.appendChild(poly);
  }

  // arco do arquipélago (curva de Bézier quadrática)
  const P0 = [230, 250], P1 = [560, 260], P2 = [880, 80];
  const bez = t => [
    (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0],
    (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1],
  ];
  for (let t = 0; t <= 1; t += 0.035 + rand() * 0.03) {
    const [x, y] = bez(t);
    island(x + (rand() - 0.5) * 30, y + (rand() - 0.5) * 22, 4 + rand() * 7, 'island');
  }
  // Shemya e ilhas próximas
  island(40, 225, 5, 'island');
  island(70, 232, 4, 'island');
  // Ilhas Rat (destacadas)
  [[110, 262], [140, 270], [165, 258], [190, 280], [125, 300], [205, 262]].forEach(([x, y]) => island(x, y, 4 + rand() * 4, 'island rat'));
  // costa do Alasca
  const coast = document.createElementNS(NS, 'path');
  coast.setAttribute('d', 'M880 80 L905 70 L915 52 L940 48 L950 30 L975 26 L990 10 L1000 0 M890 95 L920 88 L948 70 L970 72 L1000 50');
  coast.setAttribute('class', 'island');
  g.appendChild(coast);
})();

/* =========================================================
   SISMÓGRAFO (linha da seção "O que causou")
   ========================================================= */
(function seismo() {
  const line = $('#seismoLine');
  if (!line) return;
  const rand = seeded(7);
  const pts = [];
  for (let x = 0; x <= 300; x += 4) {
    const env = Math.exp(-Math.pow((x - 120) / 45, 2)) * 70 + Math.exp(-Math.pow((x - 200) / 40, 2)) * 25 + 4;
    const y = 80 + (rand() - 0.5) * 2 * env * (x % 8 === 0 ? 1 : -1);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  line.setAttribute('points', pts.join(' '));
})();

/* =========================================================
   SIMULADOR 1 — ENERGIA POTENCIAL
   ========================================================= */
(function simPotencial() {
  const mass = 6.8e11, gravity = 9.81;
  const slider = $('#epHeight');
  const heightValue = $('#epHeightValue');
  const heightLabel = $('#epHeightLabel');
  const energyValue = $('#epEnergy');
  const interpretation = $('#epInterp');
  const stored = $('#epStored');
  const aura = $('#epAura');
  const heightLine = $('#epHeightLine');
  const playButton = $('#epPlay');
  const resetButton = $('#epReset');
  const flows = $$('#simPotencial .lava-flow');
  let animating = false;

  function update() {
    const h = Number(slider.value);
    const energy = mass * gravity * h;
    heightValue.textContent = h.toLocaleString('pt-BR') + ' m';
    heightLabel.textContent = 'h = ' + h.toLocaleString('pt-BR') + ' m';
    energyValue.textContent = scientific(energy);
    interpretation.textContent = 'Na altura de ' + h.toLocaleString('pt-BR') + ' m, o modelo calcula aproximadamente ' + fmt(energy / 1e15) + ' × 10¹⁵ J de energia potencial gravitacional.';
    const scale = h / 760;
    aura.setAttribute('rx', 100 + scale * 35);
    aura.setAttribute('ry', 100 + scale * 35);
    stored.style.opacity = String(0.45 + 0.5 * (h / 1000));
    stored.style.filter = 'drop-shadow(0 0 ' + (5 + h / 80) + 'px #ff202e) drop-shadow(0 0 ' + (12 + h / 35) + 'px #ff202e88)';
    heightLine.style.opacity = String(0.35 + 0.65 * h / 1000);
  }
  const setFlow = d => flows.forEach(el => (el.style.animationDuration = d));

  slider.addEventListener('input', update);
  playButton.addEventListener('click', () => {
    animating = !animating;
    playButton.textContent = animating ? 'Pausar animação' : 'Animar energia';
    stored.classList.toggle('pulse', animating);
    setFlow(animating ? '.55s' : '1.1s');
  });
  resetButton.addEventListener('click', () => {
    slider.value = 760;
    animating = false;
    playButton.textContent = 'Animar energia';
    stored.classList.remove('pulse');
    setFlow('1.1s');
    update();
  });
  update();
})();

/* =========================================================
   SIMULADOR 2 — ENERGIA CINÉTICA
   ========================================================= */
(function simCinetica() {
  const mass = 6.8e11;
  const slider = $('#ecSpeed');
  const speedValue = $('#ecSpeedValue');
  const energyValue = $('#ecEnergy');
  const interpretation = $('#ecInterp');
  const rock = $('#ecRock');
  const speedLines = $('#ecSpeedLines');
  const playButton = $('#ecPlay');
  const resetButton = $('#ecReset');
  let running = false, frame = 0, animationId = null;

  const place = p => rock.setAttribute('transform', 'translate(' + (296 + p * 109) + ' ' + (166 + p * 155) + ') rotate(' + (p * 32) + ')');

  function update() {
    const v = Number(slider.value);
    const energy = 0.5 * mass * v * v;
    speedValue.textContent = v.toLocaleString('pt-BR') + ' m/s';
    energyValue.textContent = scientific(energy);
    interpretation.textContent = v === 0
      ? 'Com velocidade igual a zero, a energia cinética calculada é zero, pois o material está parado no modelo.'
      : 'A ' + v.toLocaleString('pt-BR') + ' m/s, o modelo calcula ' + fmt(energy / 1e15) + ' × 10¹⁵ J de energia cinética.';
    const t = v / 120;
    rock.style.opacity = v === 0 ? '.55' : '1';
    rock.style.filter = 'drop-shadow(0 0 ' + (3 + t * 16) + 'px #ff202e)';
    speedLines.style.opacity = String(0.15 + 0.85 * t);
    speedLines.style.transform = 'translate(' + (-8 - t * 18) + 'px,' + (t * 4) + 'px)';
    if (!running) place(t);
  }
  function animate() {
    if (!running) return;
    frame += 1 + (Number(slider.value) / 120) * 4;
    place((frame % 100) / 100);
    animationId = requestAnimationFrame(animate);
  }
  function stop() {
    running = false;
    if (animationId) cancelAnimationFrame(animationId);
    playButton.textContent = 'Iniciar movimento';
  }

  slider.addEventListener('input', update);
  playButton.addEventListener('click', () => {
    if (running) { stop(); update(); return; }
    running = true;
    playButton.textContent = 'Pausar movimento';
    animate();
  });
  resetButton.addEventListener('click', () => {
    stop();
    frame = 0;
    slider.value = 100;
    update();
  });
  update();
})();

/* =========================================================
   SIMULADOR 3 — ENERGIA MECÂNICA
   ========================================================= */
(function simMecanica() {
  const mass = 6.8e11, g = 9.81;
  const height = $('#emHeight'), speed = $('#emSpeed');
  const heightValue = $('#emHeightValue'), speedValue = $('#emSpeedValue');
  const epValue = $('#emEp'), ecValue = $('#emEc'), emValue = $('#emEm');
  const interpretation = $('#emInterp');
  const rock = $('#emRock');
  const stored = $('#emStored');
  const playButton = $('#emPlay'), resetButton = $('#emReset');
  let running = false, frame = 0, raf = null;

  const place = p => rock.setAttribute('transform', 'translate(' + (300 + p * 105) + ' ' + (195 + p * 115) + ') rotate(' + (p * 32) + ')');

  function update() {
    const h = Number(height.value), v = Number(speed.value);
    const ep = mass * g * h, ec = 0.5 * mass * v * v, em = ep + ec;
    heightValue.textContent = h.toLocaleString('pt-BR') + ' m';
    speedValue.textContent = v.toLocaleString('pt-BR') + ' m/s';
    epValue.textContent = scientific(ep);
    ecValue.textContent = scientific(ec);
    emValue.textContent = scientific(em);
    interpretation.textContent = 'Com altura de ' + h.toLocaleString('pt-BR') + ' m e velocidade de ' + v + ' m/s, a soma das energias no modelo é ' + fmt(em / 1e15) + ' × 10¹⁵ J.';
    rock.style.filter = 'drop-shadow(0 0 ' + (5 + v / 8) + 'px #ff202e)';
    stored.style.opacity = String(0.4 + 0.6 * (h / 1000));
    if (!running) place(v / 120);
  }
  function animate() {
    if (!running) return;
    frame += 1 + Number(speed.value) / 30;
    place((frame % 100) / 100);
    raf = requestAnimationFrame(animate);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    playButton.textContent = 'Animar deslizamento';
  }

  height.addEventListener('input', update);
  speed.addEventListener('input', update);
  playButton.addEventListener('click', () => {
    if (running) { stop(); update(); return; }
    running = true;
    playButton.textContent = 'Pausar deslizamento';
    animate();
  });
  resetButton.addEventListener('click', () => {
    stop();
    frame = 0;
    height.value = 760;
    speed.value = 100;
    update();
  });
  update();
})();

/* =========================================================
   BOLHAS — Energia x Mortes
   ========================================================= */
(function bubbles() {
  const wrap = $('#bubbles');
  const toggle = $('#bubbleToggle');
  const lblE = $('#lblEnergia'), lblM = $('#lblMortes');
  const listValues = $$('.compare-grid .event-list b');

  const data = {
    energia: {
      fatman: { v: 8.8e13, txt: '8,8 × 10¹³ J', pos: [12, 34] },
      rat:    { v: 2.83e17, txt: '2,83 × 10¹⁷ J', pos: [52, 55] },
      unzen:  { v: 8.46e15, txt: '8,46 × 10¹⁵ J', pos: [90, 72] },
    },
    mortes: { // estimativas: Fat Man 50–100 mil (média 75 mil); Unzen ≈ 15 mil; Ilhas Rat: nenhuma
      fatman: { v: 75000, txt: '50 mil – 100 mil', pos: [45, 52] },
      rat:    { v: 0, txt: '0 mortes', pos: [92, 30] },
      unzen:  { v: 15000, txt: '≈ 15 mil', pos: [88, 80] },
    },
  };
  const names = { fatman: 'Fat Man', rat: 'Ilhas Rat', unzen: 'Unzen' };
  let mode = 'energia';

  function render() {
    const set = data[mode];
    const max = Math.max(...Object.values(set).map(d => d.v));
    const R = Math.min(wrap.clientWidth, wrap.clientHeight) * 0.42;
    $$('.bubble', wrap).forEach(b => {
      const d = set[b.dataset.key];
      const r = Math.max(5, R * Math.sqrt(d.v / max));
      b.style.width = b.style.height = (r * 2) + 'px';
      b.style.left = d.pos[0] + '%';
      b.style.top = d.pos[1] + '%';
      b.classList.toggle('big', r > 55);
      $('.b-label', b).innerHTML = names[b.dataset.key] + '<br><small>' + d.txt + '</small>';
    });
    listValues.forEach(el => (el.textContent = mode === 'energia' ? el.dataset.energy : el.dataset.deaths));
    toggle.setAttribute('aria-pressed', mode === 'mortes');
    lblE.classList.toggle('on', mode === 'energia');
    lblM.classList.toggle('on', mode === 'mortes');
  }
  toggle.addEventListener('click', () => {
    mode = mode === 'energia' ? 'mortes' : 'energia';
    render();
  });
  window.addEventListener('resize', render);
  render();
})();

/* =========================================================
   SÃO PAULO — quanto tempo cada desastre abasteceria a cidade
   ========================================================= */
const SP_KWH_DIA = 400e6;
(function saoPaulo() {
  const items = $$('#spList li');
  const values = items.map(li => Number(li.dataset.kwh));
  const max = Math.max(...values);
  items.forEach((li, i) => {
    const days = values[i] / SP_KWH_DIA;
    const d = Math.floor(days);
    const h = Math.round((days - d) * 24);
    li.querySelector('b').innerHTML = values[i].toLocaleString('pt-BR') + ' kwh <em>⟶</em> ' + d + ' dias e ' + h + ' horas';
  });
  $$('#spChart .sp-bar').forEach((bar, i) => (bar.dataset.h = (values[i] / max) * 100));
})();

/* =========================================================
   ANIMAÇÕES AO ROLAR
   ========================================================= */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');

    if (el.id === 'barsCard') {
      $$('.bar-fill', el).forEach(bar => (bar.style.width = (Number(bar.dataset.value) / 9) * 100 + '%'));
    }
    if (el.id === 'spChart') {
      $$('.sp-bar', el).forEach(bar => (bar.style.height = Math.max(1.5, bar.dataset.h) + '%'));
    }
    if (el.classList.contains('magnitude')) countUp($('strong', el), 8.7, 1);
    io.unobserve(el);
  });
}, { threshold: 0.2 });

$$('.reveal, #spChart').forEach(el => io.observe(el));

function countUp(el, target, decimals) {
  const start = performance.now(), dur = 1400;
  (function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
