const C=window.CAFE,M=window.MENU,$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// контакты
$('#rate').textContent=`${C.rating} · ${C.reviews} отзывов`;$('#st1').textContent=C.rating;$('#st2').textContent=C.reviews;
$('#hrs').textContent=$('#c2').textContent=C.hours;$('#adr').textContent=$('#c1').textContent=C.address;
for(const s of ['#phoneLink','#c3']){$(s).textContent=C.phone;$(s).href='tel:'+C.phoneRaw}
$('#c4').href='https://wa.me/'+C.whatsapp;$('#c5').href='https://t.me/'+C.telegram;
$('#route').href='https://yandex.ru/maps/?rtext=~'+C.mapLat+','+C.mapLon+'&rtt=auto';
const d=.004;$('#map').src=`https://www.openstreetmap.org/export/embed.html?bbox=${C.mapLon-d},${C.mapLat-d},${C.mapLon+d},${C.mapLat+d}&marker=${C.mapLat},${C.mapLon}`;
$('#yr').textContent=new Date().getFullYear();
$('#burger').onclick=()=>$('#menuNav').classList.toggle('open');
document.querySelectorAll('#menuNav a').forEach(a=>a.onclick=()=>$('#menuNav').classList.remove('open'));
// фото: положите файлы в assets/photos/1.jpg … 8.jpg
const gal=$('#gal');const labels=['Зал','Мидии','Лазанья с красной рыбой','Том ям','Барабуля','Бар','Летняя зона','Десерты'];
labels.forEach((l,i)=>{gal.insertAdjacentHTML('beforeend',`<div class="photo" data-photo="${i+2}">${l}</div>`)});
document.querySelectorAll('[data-photo]').forEach(el=>{const t=el.textContent,img=new Image();img.alt=t;
 img.onload=()=>{el.textContent='';el.appendChild(img)};img.src=`assets/photos/${el.dataset.photo}.jpg`;});
// меню
let cat=M[0].id;const tabs=$('#tabs'),box=$('#dishes');
tabs.innerHTML=M.map(c=>`<button class="tab" data-c="${c.id}">${esc(c.title)}</button>`).join('');
tabs.onclick=e=>{if(e.target.dataset.c){cat=e.target.dataset.c;$('#q').value='';render()}};
$('#q').oninput=render;$('#hitOnly').onchange=render;
function render(){
 const q=$('#q').value.trim().toLowerCase(),hit=$('#hitOnly').checked;
 tabs.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',!q&&!hit&&t.dataset.c===cat));
 let list=(q||hit?M.flatMap(c=>c.items):M.find(c=>c.id===cat).items).filter(i=>(!hit||i.tag)&&(!q||(i.n+i.d).toLowerCase().includes(q)));
 box.innerHTML=list.length?list.map(i=>`<article class="dish"><div class="em" aria-hidden="true">${i.e}</div><div style="flex:1"><h3><span>${esc(i.n)}${i.tag?`<span class="tag">${i.tag}</span>`:''}${i.spicy?' 🌶':''}</span><span class="pr">${i.p} ₽</span></h3><p>${esc(i.d)}</p></div></article>`).join(''):'<p>Ничего не найдено</p>';
}
render();
// бронирование
const date=$('#date'),slots=$('#slots'),g=$('#guests');let time='';
const pad=n=>String(n).padStart(2,'0'),iso=x=>`${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`;
date.min=date.value=iso(new Date());date.max=iso(new Date(Date.now()+60*864e5));
g.innerHTML=Array.from({length:C.maxGuests},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')+'<option value="13+">Больше 12</option>';g.value='2';
function drawSlots(){
 const now=new Date(),today=date.value===iso(now);time='';let h='';
 for(let t=C.open*60;t<=C.close*60-60;t+=30){const lab=`${pad(Math.floor(t/60))}:${pad(t%60)}`;
  const off=today&&t<=now.getHours()*60+now.getMinutes()+30;h+=`<button type="button" class="slot" ${off?'disabled':''}>${lab}</button>`}
 slots.innerHTML=h||'';
}
slots.onclick=e=>{if(e.target.classList.contains('slot')&&!e.target.disabled){slots.querySelectorAll('.slot').forEach(s=>s.classList.remove('on'));e.target.classList.add('on');time=e.target.textContent}};
date.onchange=drawSlots;drawSlots();
$('#form').onsubmit=e=>{
 e.preventDefault();const err=$('#err'),name=$('#name').value.trim(),tel=$('#tel').value.trim();
 if(!date.value)return err.textContent='Выберите дату';
 if(!time)return err.textContent='Выберите время';
 if(name.length<2)return err.textContent='Укажите имя';
 if(tel.replace(/\D/g,'').length<10)return err.textContent='Укажите корректный телефон';
 err.textContent='';
 const [y,m,dd]=date.value.split('-'),dt=`${dd}.${m}.${y}`;
 const msg=`Здравствуйте! Хочу забронировать столик в РыбаБаре.\nДата: ${dt}\nВремя: ${time}\nГостей: ${g.value}\nИмя: ${name}\nТелефон: ${tel}${$('#comment').value?'\nПожелания: '+$('#comment').value:''}`;
 try{const a=JSON.parse(localStorage.getItem('rb_bookings')||'[]');a.push({dt,time,guests:g.value,name,tel});localStorage.setItem('rb_bookings',JSON.stringify(a))}catch{}
 $('#okText').textContent=`${dt} в ${time}, гостей: ${g.value}. Отправьте заявку в мессенджер — администратор подтвердит бронь.`;
 $('#waBtn').href='https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent(msg);
 $('#tgBtn').href='https://t.me/'+C.telegram+'?text='+encodeURIComponent(msg);
 $('#ok').style.display='block';$('#ok').scrollIntoView({behavior:'smooth',block:'center'});
};
// анимации
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
