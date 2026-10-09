// Морская анимация в стиле Рыба Бара: живой аквариум на первом экране,
// бумажные рыбки-гирлянды (как на веранде), чайки, спасательный круг «наверх» и рыбка-прогресс.
// Всё рисуется кодом — без видеофайлов, поэтому сайт остаётся лёгким.
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= Аквариум (canvas) ================= */
const hero = document.querySelector('.hero'), cv = document.getElementById('sea');
if (hero && cv) {
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, fish = [], bubbles = [], food = [], pointer = null, running = false, last = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(16, Math.max(7, W / 95)));
    while (fish.length < n) fish.push(makeFish());
    fish.length = n;
    fish.sort((a, b) => a.size - b.size);           // дальние рисуем первыми
    if (reduce) draw(0);
  }
  function makeFish(x) {
    const depth = Math.random();                    // 0 — далеко, 1 — близко
    const size = 28 + depth * 84, dir = Math.random() < .5 ? -1 : 1, sp = 18 + depth * 40;
    return {x: x ?? rnd(0, W), y: rnd(H * .12, H * .88), vx: dir * sp, vy: rnd(-6, 6), size, sp,
      alpha: .3 + depth * .5, lw: .9 + depth * 1.2, phase: rnd(0, 6.28), ang: dir > 0 ? 0 : Math.PI,
      warm: Math.random() < .22};                   // часть рыбок — фирменного оранжевого цвета
  }

  // Рыбка-гравюра: контур, хвост, глаз, жабра, чешуя, плавник
  function drawFish(f) {
    const L = f.size, bh = L * .21, wag = Math.sin(f.phase) * .9, ty = wag * L * .05;
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ang); if (Math.cos(f.ang) < 0) ctx.scale(1, -1);
    ctx.strokeStyle = f.warm ? `rgba(255,185,142,${f.alpha})` : `rgba(232,247,255,${f.alpha})`;
    ctx.lineWidth = f.lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tb = -L * .3, tx = -L * .52, tyy = ty + wag * L * .16;
    ctx.beginPath();
    ctx.moveTo(L * .5, 0); ctx.bezierCurveTo(L * .32, -bh * 1.15, -L * .05, -bh * 1.02, tb, ty - bh * .22);
    ctx.moveTo(L * .5, 0); ctx.bezierCurveTo(L * .32, bh * 1.15, -L * .05, bh * 1.02, tb, ty + bh * .22);
    ctx.moveTo(tb, ty - bh * .22); ctx.quadraticCurveTo(tb - L * .08, ty, tx, tyy - bh * .95);
    ctx.quadraticCurveTo(tx + L * .07, tyy, tx, tyy + bh * .95); ctx.quadraticCurveTo(tb - L * .08, ty, tb, ty + bh * .22);
    ctx.moveTo(L * .14, -bh * .98); ctx.quadraticCurveTo(L * .02, -bh * 1.7, -L * .14, -bh * .82);   // спинной плавник
    ctx.moveTo(L * .05, bh * .95); ctx.quadraticCurveTo(-L * .02, bh * 1.35, -L * .1, bh * .85);    // брюшной плавник
    ctx.stroke();
    ctx.beginPath(); ctx.arc(L * .33, -bh * .18, Math.max(1.2, L * .028), 0, 6.283); ctx.stroke();  // глаз
    ctx.beginPath(); ctx.arc(L * .12, 0, bh * .85, -1.15, 1.15); ctx.stroke();                         // жабра
    if (L > 40) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-L * (.02 + i * .11), 0, bh * (.62 - i * .1), -1.1, 1.1); ctx.stroke(); }
    ctx.restore();
  }

  function step(dt) {
    // рыбки
    for (const f of fish) {
      let ax = 0, ay = 0;
      const heading = Math.atan2(f.vy, f.vx) + rnd(-1, 1) * .9 * dt;          // плавное блуждание
      const sp = Math.hypot(f.vx, f.vy) || f.sp;
      f.vx = Math.cos(heading) * sp; f.vy = Math.sin(heading) * sp;
      if (f.y < H * .1) ay += 40; if (f.y > H * .9) ay -= 40;                    // держатся в «воде»
      if (pointer) {                                                              // пугаются курсора
        const dx = f.x - pointer.x, dy = f.y - pointer.y, d = Math.hypot(dx, dy);
        if (d < 150) { const k = (150 - d) / 150 * 420; ax += dx / d * k; ay += dy / d * k; }
      }
      let best = null, bd = 1e9;                                                  // плывут к корму
      for (const c of food) { const d = Math.hypot(c.x - f.x, c.y - f.y); if (d < bd) { bd = d; best = c; } }
      if (best && bd < 520) {
        ax += (best.x - f.x) / bd * 160; ay += (best.y - f.y) / bd * 160;
        if (bd < f.size * .5) { best.eaten = true; for (let i = 0; i < 3; i++) bubble(best.x, best.y, rnd(1.5, 3)); }
      }
      f.vx += ax * dt; f.vy += ay * dt;
      const s = Math.hypot(f.vx, f.vy), max = f.sp * (pointer || food.length ? 2.6 : 1.3), min = f.sp * .6;
      if (s > max) { f.vx *= max / s; f.vy *= max / s; } else if (s < min) { f.vx *= min / s; f.vy *= min / s; }
      f.x += f.vx * dt; f.y += f.vy * dt;
      // поворот корпуса — плавно
      let da = Math.atan2(f.vy, f.vx) - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += da * Math.min(1, dt * 4);
      f.phase += dt * (4 + s * .08);
      if (f.x > W + f.size) f.x = -f.size; if (f.x < -f.size) f.x = W + f.size;  // уплывают за край и возвращаются
      if (Math.random() < dt * .25) bubble(f.x + Math.cos(f.ang) * f.size * .5, f.y, rnd(1, 2.4));
    }
    // пузырьки и корм
    if (Math.random() < dt * 2.5) bubble(rnd(0, W), H + 6, rnd(1.5, 4.5));
    for (const b of bubbles) { b.ph += dt * 2; b.y -= b.v * dt; b.x += Math.sin(b.ph) * .35; }
    bubbles = bubbles.filter(b => b.y > -10);
    for (const c of food) { c.y += 14 * dt; c.x += Math.sin(c.y * .05) * .2; }
    food = food.filter(c => !c.eaten && c.y < H - 4);
  }
  const bubble = (x, y, r) => bubbles.length < 160 && bubbles.push({x, y, r, v: 18 + r * 9, ph: rnd(0, 6)});

  // солнечные лучи сквозь воду
  const rays = Array.from({length: 6}, (_, i) => ({x: (i + .5) / 6, w: rnd(40, 110), sp: rnd(.08, .18), ph: rnd(0, 6), a: rnd(.05, .1)}));
  let clock = 0;
  function drawRays() {
    for (const r of rays) {
      const sway = Math.sin(clock * r.sp + r.ph), x = r.x * W + sway * 60, tilt = W * .12 + sway * 20;
      const g = ctx.createLinearGradient(0, 0, 0, H * .85);
      g.addColorStop(0, `rgba(170,228,255,${r.a * (1 + .4 * Math.sin(clock * .7 + r.ph))})`); g.addColorStop(1, 'rgba(170,228,255,0)');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + r.w, 0); ctx.lineTo(x + r.w * 2.2 + tilt, H * .85); ctx.lineTo(x + tilt, H * .85); ctx.closePath(); ctx.fill();
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawRays();
    for (const f of fish) drawFish(f);
    ctx.lineWidth = 1;
    for (const b of bubbles) { ctx.strokeStyle = 'rgba(220,245,255,.55)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.stroke(); }
    ctx.fillStyle = '#ffcfae';
    for (const c of food) { ctx.beginPath(); ctx.arc(c.x, c.y, 2.2, 0, 6.283); ctx.fill(); }
  }
  function loop(t) {
    if (!running) return;
    const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
    clock += dt; step(dt); draw(); requestAnimationFrame(loop);
  }
  const start = () => { if (!running && !reduce) { running = true; last = performance.now(); requestAnimationFrame(loop); } };
  const stop = () => { running = false; };

  new ResizeObserver(resize).observe(hero); resize();
  new IntersectionObserver(([e]) => e.isIntersecting && !document.hidden ? start() : stop()).observe(hero);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  const pos = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
  hero.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pointer = pos(e); });
  hero.addEventListener('pointerleave', () => pointer = null);
  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button')) return;
    const p = pos(e);
    for (let i = 0; i < 7; i++) food.push({x: p.x + rnd(-22, 22), y: p.y + rnd(-10, 10)});
    for (let i = 0; i < 6; i++) bubble(p.x + rnd(-10, 10), p.y, rnd(1.5, 4));
    document.querySelector('.hero-hint')?.classList.add('gone');
  });
}

/* ================= Бумажные рыбки на нитках (как на веранде) ================= */
document.querySelectorAll('[data-garland]').forEach(el => {
  const strings = +el.dataset.garland || 5;
  el.innerHTML = Array.from({length: strings}, (_, i) => {
    const n = 3 + (i * 7) % 3, len = 60 + (i * 37) % 70;
    const fishes = Array.from({length: n}, (_, k) => `<svg class="pf" style="top:${len * .2 + k * 44}px;--r:${(k % 2 ? 1 : -1) * (6 + (i + k) % 5)}deg" viewBox="0 0 42 24" aria-hidden="true"><use href="#i-pfish"/></svg>`).join('');
    return `<span class="g-str" style="--d:${5 + (i * 1.7) % 3}s;--del:-${(i * 1.3) % 4}s;height:${len + n * 44}px">${fishes}</span>`;
  }).join('');
});

/* ================= Чайки над акциями ================= */
document.querySelectorAll('[data-gulls]').forEach(el => {
  el.innerHTML = [0, 1, 2].map(i => `<span class="gull" style="--t:${16 + i * 5}s;--del:-${i * 6}s;--y:${12 + i * 22}%;--s:${1 - i * .2}"><svg viewBox="0 0 64 40" aria-hidden="true"><use href="#i-gull"/></svg></span>`).join('');
});

/* ================= Рыбка-прогресс и спасательный круг ================= */
const prog = document.getElementById('progress'), buoy = document.getElementById('buoy');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight, k = max > 0 ? scrollY / max : 0;
  if (prog) prog.style.setProperty('--k', k);
  if (buoy) { buoy.classList.toggle('show', scrollY > innerHeight); buoy.style.setProperty('--rot', scrollY * .25 + 'deg'); }
};
addEventListener('scroll', onScroll, {passive: true}); onScroll();
buoy?.addEventListener('click', () => scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'}));
})();
