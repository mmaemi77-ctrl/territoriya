(() => {
const C = window.CAFE, M = window.MENU, L = C.locations;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = id => L.find(l => l.id === id);
const price = p => p == null ? 'уточняйте' : p.toLocaleString('ru-RU') + ' ₽';
const ymOrg = l => `https://yandex.ru/maps/org/${l.yandexSlug}/${l.yandexId}/`;
const ig = 'https://www.instagram.com/' + C.instagram + '/';
const ph = f => (window.PHOTOS && window.PHOTOS[f]) || 'assets/photos/' + f;  // PHOTOS — для однофайлового превью

/* ---------- шапка ---------- */
const hdr = $('#hdr'), burger = $('#burger'), navList = $('#navList');
const onScroll = () => {
  hdr.classList.toggle('solid', scrollY > 40);
  $('#mbar').classList.toggle('show', scrollY > innerHeight * .6);
};
addEventListener('scroll', onScroll, {passive:true}); onScroll();
burger.onclick = () => { const o = navList.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
navList.addEventListener('click', e => { if (e.target.closest('a')) { navList.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

/* ---------- сегмент-переключатель заведений ---------- */
function seg(el, current, onPick) {
  el.setAttribute('role', 'tablist');
  el.innerHTML = L.map(l => `<button type="button" role="tab" data-id="${l.id}" aria-selected="${l.id === current}">${esc(l.short)}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; set(b.dataset.id); onPick(b.dataset.id); };
  const set = id => el.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.id === id));
  return set;
}

/* ---------- заведения ---------- */
const fishArt = `<svg viewBox="0 0 200 90" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M20 45c30-34 95-38 130 0-35 38-100 34-130 0z"/><path d="M150 45l32-22v44z"/><circle cx="48" cy="40" r="4"/><path d="M70 30c8 10 8 20 0 30M92 26c9 12 9 26 0 38M114 28c8 11 8 23 0 34"/></svg>`;
$('#placesList').innerHTML = L.map(l => `
 <article class="place">
  <div class="place-img">
   ${l.photo ? `<img src="${ph(l.photo + '-sm.jpg')}" srcset="${ph(l.photo + '-sm.jpg')} 640w, ${ph(l.photo + '.jpg')} 1280w" sizes="(max-width:860px) 100vw, 50vw" alt="${esc(l.title)}, ${esc(l.address)}" loading="lazy">`
             : `<div class="place-art">${fishArt}</div>`}
   <span class="place-tag">${esc(l.short)}</span>
   ${l.rating ? `<span class="place-rate">★ ${l.rating} · ${l.reviews} отзывов</span>` : ''}
  </div>
  <div class="place-body">
   <h3>${esc(l.title)}</h3>
   <p>${esc(l.about)}</p>
   <div class="place-meta"><span>📍 ${esc(l.address)}</span><span>🕚 ${esc(l.hours)}</span><a href="tel:${l.phoneRaw}">📞 ${esc(l.phone)}</a></div>
   <div class="place-btns">
    <a class="btn sm" href="#book" data-book="${l.id}">Забронировать</a>
    <a class="btn sm ghost-dark" href="#menu" data-menu="${l.id}">Меню</a>
    <a class="btn sm ghost-dark" href="${ymOrg(l)}" target="_blank" rel="noopener">Маршрут</a>
   </div>
  </div>
 </article>`).join('');
document.addEventListener('click', e => {
  const b = e.target.closest('[data-book]'); if (b) pickBookLoc(b.dataset.book);
  const m = e.target.closest('[data-menu]'); if (m) pickMenuLoc(m.dataset.menu);
});

/* ---------- меню ---------- */
let menuLoc = 'g';
const setMenuSeg = seg($('#menuLoc'), menuLoc, id => pickMenuLoc(id, true));
function pickMenuLoc(id) { menuLoc = id; setMenuSeg(id); renderMenu(); }
const q = $('#q'), fHit = $('#fHit'), fSpicy = $('#fSpicy');
[q, fHit, fSpicy].forEach(el => el.addEventListener('input', renderMenu));
const hl = (text, term) => {
  const t = esc(text); if (!term) return t;
  const i = text.toLowerCase().indexOf(term); if (i < 0) return t;
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
};
function dishHTML(i, term) {
  const badges = (i.hit ? '<span class="badge hit">хит</span>' : '') + (i.spicy ? '<span class="badge hot">🌶 остро</span>' : '');
  return `<div class="dish">
   ${i.img ? `<button class="dish-img" type="button" data-photo="${i.img}" aria-label="Фото: ${esc(i.n)}"><img src="${ph(i.img + '-sm.jpg')}" alt="" loading="lazy"></button>` : ''}
   <div class="dish-main">
    <div class="dish-top"><span class="dish-name">${hl(i.n, term)}${badges}</span><span class="dish-dots"></span><span class="dish-price">${price(i.p)}</span></div>
    ${i.d ? `<p class="dish-desc">${hl(i.d, term)}</p>` : ''}${i.w ? `<p class="dish-w">${esc(i.w)}</p>` : ''}
   </div></div>`;
}
function renderMenu() {
  const body = $('#menuBody'), cats = $('#cats'), data = M[menuLoc];
  const tools = [$('.menu-tools'), cats];
  if (!data) {
    const l = byId(menuLoc), other = L.find(x => M[x.id]);
    tools.forEach(t => t.hidden = true);
    body.innerHTML = `<div class="soon"><h3>Меню на ${esc(l.short)} скоро появится</h3>
      <p>Мы обновляем меню этого заведения на сайте. Чтобы узнать блюда дня и цены, позвоните администратору.</p>
      <div class="place-btns"><a class="btn sm" href="tel:${l.phoneRaw}">📞 ${esc(l.phone)}</a>${other ? `<button class="btn sm ghost-dark" type="button" data-menu="${other.id}">Меню на ${esc(other.short)}</button>` : ''}</div></div>`;
    return;
  }
  tools.forEach(t => t.hidden = false);
  const term = q.value.trim().toLowerCase();
  const ok = i => (!fHit.checked || i.hit) && (!fSpicy.checked || i.spicy) && (!term || (i.n + ' ' + (i.d || '') + ' ' + (i.g || '')).toLowerCase().includes(term));
  const shown = data.map(c => ({...c, items: c.items.filter(ok)})).filter(c => c.items.length);
  cats.innerHTML = shown.map(c => `<a href="#cat-${c.id}" data-cat="${c.id}">${esc(c.title)}</a>`).join('');
  body.innerHTML = shown.length ? shown.map(c => {
    let g = null, rows = '';
    c.items.forEach(i => { if (i.g && i.g !== g) { g = i.g; rows += `<p class="mgrp">${esc(g)}</p>`; } rows += dishHTML(i, term); });
    return `<section class="mcat" id="cat-${c.id}" aria-label="${esc(c.title)}"><h3>${esc(c.title)}</h3>${c.note ? `<p class="cnote">${esc(c.note)}</p>` : ''}<div class="mlist">${rows}</div></section>`;
  }).join('') : `<p class="empty">Ничего не нашлось. Попробуйте другое слово или <a href="#book">спросите у нас</a> 🙂</p>`;
  spy();
}
let spyObs;
function spy() {
  spyObs?.disconnect();
  spyObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('#cats a').forEach(a => a.classList.toggle('on', a.dataset.cat === e.target.id.slice(4)));
    $(`#cats a[data-cat="${e.target.id.slice(4)}"]`)?.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'});
  }), {rootMargin:'-140px 0px -60% 0px'});
  $$('.mcat').forEach(s => spyObs.observe(s));
}
renderMenu();

/* ---------- галерея + лайтбокс ---------- */
const PH = [
  {f:'veranda', c:'Веранда на Горького: том ям, салат и коктейли', cls:'wide'},
  {f:'interior-portholes', c:'Зал с иллюминаторами', cls:'tall'},
  {f:'seafood-assorti', c:'Ассорти морепродуктов с фирменным соусом', cls:'tall'},
  {f:'prawns', c:'Креветки на гриле с зелёным маслом'},
  {f:'mussels-dish', c:'Тёплое блюдо с мидиями'},
  {f:'exterior-night', c:'Вечерний вход в Рыба Бар 2.0', cls:'wide', pos:'center 35%'},
  {f:'hall', c:'Уютный зал с мягкими креслами', cls:'wide'}
];
$('#gal').innerHTML = PH.map((p, i) => `<button type="button" class="${p.cls || ''}" data-idx="${i}"><img src="${ph(p.f + '-sm.jpg')}" alt="${esc(p.c)}" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ''}><span>${esc(p.c)}</span></button>`).join('');
const lb = $('#lb'), lbImg = $('#lbImg'); let cur = 0;
const show = i => { cur = (i + PH.length) % PH.length; lbImg.src = ph(PH[cur].f + '.jpg'); lbImg.alt = PH[cur].c; $('#lbCap').textContent = PH[cur].c; };
const open = i => { show(i); lb.showModal ? lb.showModal() : lb.setAttribute('open', ''); };
$('#gal').onclick = e => { const b = e.target.closest('[data-idx]'); if (b) open(+b.dataset.idx); };
document.addEventListener('click', e => { const b = e.target.closest('[data-photo]'); if (b) open(PH.findIndex(p => p.f === b.dataset.photo)); });
$('#lbX').onclick = () => lb.close(); $('#lbP').onclick = () => show(cur - 1); $('#lbN').onclick = () => show(cur + 1);
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });

/* ---------- бронирование ---------- */
let bookLoc = 'g', time = '';
const setBookSeg = seg($('#bookLoc'), bookLoc, id => pickBookLoc(id));
function pickBookLoc(id) {
  bookLoc = id; setBookSeg(id);
  const l = byId(id);
  $('#bookInfo').innerHTML = `<li>📍 <span><b>${esc(l.title)}</b><br>${esc(l.address)}</span></li><li>🕚 ${esc(l.hours)}</li><li>📞 <a href="tel:${l.phoneRaw}">${esc(l.phone)}</a></li>`;
  drawSlots();
}
const date = $('#date'), guests = $('#guests'), slots = $('#slots');
const pad = n => String(n).padStart(2, '0'), iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
date.min = date.value = iso(new Date()); date.max = iso(new Date(Date.now() + 60 * 864e5));
guests.innerHTML = Array.from({length: C.maxGuests}, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('') + '<option value="13+">больше 12</option>';
guests.value = '2';
function drawSlots() {
  const l = byId(bookLoc), now = new Date(), today = date.value === iso(now);
  const keep = time; time = ''; let h = '', free = 0;
  for (let t = l.open * 60; t <= l.close * 60 - 60; t += 30) {
    const lab = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
    const off = today && t <= now.getHours() * 60 + now.getMinutes() + 30;
    if (!off) free++;
    const on = !off && lab === keep; if (on) time = lab;
    h += `<button type="button" class="slot" aria-pressed="${on}" ${off ? 'disabled' : ''}>${lab}</button>`;
  }
  slots.innerHTML = h; $('#noSlots').hidden = free > 0;
}
slots.onclick = e => {
  const b = e.target.closest('.slot'); if (!b || b.disabled) return;
  slots.querySelectorAll('.slot').forEach(s => s.setAttribute('aria-pressed', s === b)); time = b.textContent;
};
date.onchange = drawSlots;
const tel = $('#tel');
tel.addEventListener('input', () => {
  let d = tel.value.replace(/\D/g, ''); if (!d) { tel.value = ''; return; }
  if (d[0] === '8') d = '7' + d.slice(1); if (d[0] === '9') d = '7' + d; d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  tel.value = '+7' + (p[0] ? ` (${p[0]}` : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
});
let msg = '';
$('#form').onsubmit = e => {
  e.preventDefault();
  const err = $('#err'), name = $('#name').value.trim(), phone = tel.value.trim(), l = byId(bookLoc);
  const fail = (t, el) => { err.textContent = t; el?.focus(); };
  if (!date.value) return fail('Выберите дату', date);
  if (!time) return fail('Выберите время', slots.querySelector('.slot:not(:disabled)'));
  if (name.length < 2) return fail('Укажите, пожалуйста, имя', $('#name'));
  if (phone.replace(/\D/g, '').length !== 11) return fail('Проверьте номер телефона', tel);
  if (!$('#agree').checked) return fail('Нужно согласие на обработку персональных данных', $('#agree'));
  err.textContent = '';
  const [y, m, d] = date.value.split('-'), dt = `${d}.${m}.${y}`, c = $('#comment').value.trim();
  msg = `Здравствуйте! Хочу забронировать столик.\nЗаведение: ${l.title}, ${l.address}\nДата: ${dt}\nВремя: ${time}\nГостей: ${guests.value}\nИмя: ${name}\nТелефон: ${phone}` + (c ? `\nПожелания: ${c}` : '');
  $('#okText').textContent = `${l.short} · ${dt} в ${time} · гостей: ${guests.value}. Отправьте заявку в мессенджер одним нажатием или позвоните — администратор подтвердит бронь.`;
  $('#waBtn').href = `https://wa.me/${l.whatsapp}?text=${encodeURIComponent(msg)}`;
  $('#callBtn').href = 'tel:' + l.phoneRaw; $('#callBtn').textContent = '📞 ' + l.phone;
  const tg = $('#tgBtn'); tg.hidden = !C.telegram; if (C.telegram) tg.href = 'https://t.me/' + C.telegram;
  const ok = $('#ok'); ok.hidden = false; ok.focus({preventScroll:true}); ok.scrollIntoView({behavior:'smooth', block:'center'});
};
const copy = async () => {
  try { await navigator.clipboard.writeText(msg); }
  catch { const t = document.createElement('textarea'); t.value = msg; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  $('#copyBtn').textContent = 'Скопировано ✓'; setTimeout(() => $('#copyBtn').textContent = 'Скопировать заявку', 2000);
};
$('#copyBtn').onclick = copy; $('#tgBtn').addEventListener('click', copy);
pickBookLoc(bookLoc);

/* ---------- отзывы (виджет Яндекс Карт) ---------- */
const setRev = id => { const l = byId(id); $('#revFrame').src = `https://yandex.ru/maps-reviews-widget/${l.yandexId}?comments`; $('#revLink').href = ymOrg(l) + 'reviews/'; };
seg($('#revLoc'), 'g', setRev); setRev('g');

/* ---------- контакты и подвал ---------- */
$('#contactsList').innerHTML = L.map(l => `
 <article class="contact">
  <div class="map-box"><a href="${ymOrg(l)}" target="_blank" rel="noopener">Открыть карту →</a><iframe src="https://yandex.ru/map-widget/v1/org/${l.yandexSlug}/${l.yandexId}/?z=16" title="Карта: ${esc(l.address)}" loading="lazy" allowfullscreen></iframe></div>
  <div class="contact-body">
   <h3>${esc(l.title)}</h3>
   <span>📍 ${esc(l.address)}</span><span>🕚 ${esc(l.hours)}</span><a href="tel:${l.phoneRaw}">📞 ${esc(l.phone)}</a>
   <div class="place-btns"><a class="btn sm" href="#book" data-book="${l.id}">Забронировать</a><a class="btn sm ghost-dark" href="${ymOrg(l)}" target="_blank" rel="noopener">Открыть в Яндекс Картах</a></div>
  </div>
 </article>`).join('');
$('#ftrLocs').innerHTML = L.map(l => `<p><b style="color:#fff">${esc(l.short)}</b> · ${esc(l.hours.replace('Ежедневно, ', 'ежедневно '))}<br><a href="tel:${l.phoneRaw}">${esc(l.phone)}</a></p>`).join('<br>');
$('#igLink').href = $('#igLink2').href = ig;
$('#yr').textContent = new Date().getFullYear();

/* ---------- плавное появление ---------- */
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), {threshold:.12});
  $$('.place, .feat, .offer, .ev, .contact, .gallery button, .faq details').forEach(el => { el.classList.add('reveal'); io.observe(el); });
}
})();
