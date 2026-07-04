/* ==========================================================================
   VESTRO — LIVE CATALOG + WHATSAPP ORDER BASKET
   Loads products from Firebase Firestore (managed via admin.html).
   Falls back to the built-in starter sarees if Firebase isn't set up yet.
   ========================================================================== */
(async function(){
"use strict";

const WA = window.VESTRO_WHATSAPP || "97466194953";
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------- starter products (used until Firebase is configured) ---------- */
const DEFAULTS = [
  { id:'d1', name:'Antique Gold Tissue',     weave:'Featherlight tissue · full zari body',  price:'', style:'goldtissue', status:'available' },
  { id:'d2', name:'Kasavu · Saffron Border', weave:'Classic cream · saffron zari edge',     price:'', style:'saffron',    status:'available' },
  { id:'d3', name:'Ivory Temple Zari',       weave:'Soft ivory · fine gold thread lines',   price:'', style:'temple',     status:'available' },
  { id:'d4', name:'Marigold Festive',        weave:'Warm ochre · occasion wear',            price:'', style:'marigold',   status:'available' }
];
const STYLE_MAT = { goldtissue:'mat-velvet', saffron:'mat-forest', temple:'mat-velvet', marigold:'mat-forest' };

/* ---------- load products ---------- */
function firebaseReady(){
  const c = window.VESTRO_FIREBASE_CONFIG;
  return c && c.apiKey && !/^PASTE/.test(c.apiKey);
}

async function loadProducts(){
  if(!firebaseReady()) return DEFAULTS;
  try{
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } =
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app = initializeApp(window.VESTRO_FIREBASE_CONFIG);
    const db = getFirestore(app);
    const snap = await getDocs(query(collection(db,'products'), orderBy('createdAt','desc')));
    const items = [];
    snap.forEach(d => items.push({ id:d.id, ...d.data() }));
    return items.length ? items : DEFAULTS;
  }catch(err){
    console.warn('Vestro: could not load products from Firebase, showing starter collection.', err);
    return DEFAULTS;
  }
}

/* ---------- order basket (saved locally in the browser) ---------- */
const CART_KEY = 'vestro-order';
function readCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; }
}
function writeCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); }

/* ---------- WhatsApp message builders ---------- */
function singleOrderLink(p){
  const price = p.price ? ` (${p.price})` : '';
  const msg = `Hi Vestro by RA! I'd like to order the *${p.name}*${price} ✨\nPlease confirm availability & delivery.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}
function basketOrderLink(items){
  const lines = items.map((p,i)=> `${i+1}. ${p.name}${p.price ? ' — '+p.price : ''}`);
  const msg = `Hi Vestro by RA! ✨ I'd like to order these:\n\n${lines.join('\n')}\n\nTotal pieces: ${items.length}\nPlease confirm availability, price & delivery.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

/* ---------- render ---------- */
const grid = document.getElementById('productGrid');
const bar      = document.getElementById('cartBar');
const barCount = document.getElementById('cartCount');
const barSend  = document.getElementById('cartSend');
const barClear = document.getElementById('cartClear');
if(!grid) return;

let products = await loadProducts();
products = products.filter(p => p.status !== 'hidden');

/* drop basket items whose product no longer exists / is hidden or sold out */
let cart = readCart().filter(c => products.some(p => p.id === c.id && p.status !== 'soldout'));
writeCart(cart);

function el(tag, cls, text){
  const n = document.createElement(tag);
  if(cls) n.className = cls;
  if(text != null) n.textContent = text;
  return n;
}

function drapeFor(p){
  if(p.image){
    const d = el('div','drape drape-photo');
    d.style.backgroundImage = `url("${p.image.replace(/"/g,'%22')}")`;
    return d;
  }
  const style = STYLE_MAT[p.style] ? p.style : 'goldtissue';
  const d = el('div', `drape ${STYLE_MAT[style]}`);
  const fold = el('span', `fold f-${style}`);
  const tassel = el('span','tassel');
  for(let i=0;i<4;i++) tassel.appendChild(el('i'));
  fold.appendChild(tassel);
  d.appendChild(fold);
  return d;
}

function inCart(p){ return cart.some(c => c.id === p.id); }

function toggleCart(p, btn){
  if(inCart(p)){
    cart = cart.filter(c => c.id !== p.id);
    btn.textContent = 'Add to order';
    btn.classList.remove('chip-added');
  }else{
    cart.push({ id:p.id, name:p.name, price:p.price || '' });
    btn.textContent = 'Added ✓';
    btn.classList.add('chip-added');
  }
  writeCart(cart);
  updateBar();
}

function updateBar(){
  if(!bar) return;
  if(cart.length === 0){ bar.hidden = true; return; }
  bar.hidden = false;
  barCount.textContent = cart.length === 1 ? '1 saree selected' : `${cart.length} sarees selected`;
  barSend.href = basketOrderLink(cart);
}

function cardFor(p, i){
  const card = el('article','card reveal');
  card.setAttribute('data-tilt','');
  if(i) card.style.transitionDelay = (Math.min(i,4) * .08) + 's';

  const inner = el('div','card-inner');
  const drape = drapeFor(p);
  if(p.status === 'soldout') drape.appendChild(el('span','sold-badge','Sold out'));
  inner.appendChild(drape);
  inner.appendChild(el('h3', null, p.name));
  if(p.weave) inner.appendChild(el('p','weave', p.weave));
  if(p.price) inner.appendChild(el('p','price', p.price));

  const foot = el('div','card-foot');
  if(p.status === 'soldout'){
    foot.appendChild(el('span','chip chip-sold','Sold out'));
    const ask = el('a','chip','Ask on WhatsApp');
    ask.href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi! Will the "${p.name}" be back in stock? 🤍`)}`;
    ask.target = '_blank'; ask.rel = 'noopener';
    foot.appendChild(ask);
  }else{
    const add = el('button','chip chip-add', inCart(p) ? 'Added ✓' : 'Add to order');
    if(inCart(p)) add.classList.add('chip-added');
    add.type = 'button';
    add.addEventListener('click', ()=> toggleCart(p, add));
    foot.appendChild(add);

    const buy = el('a','chip chip-wa','Order now');
    buy.href = singleOrderLink(p);
    buy.target = '_blank'; buy.rel = 'noopener';
    foot.appendChild(buy);
  }
  inner.appendChild(foot);
  card.appendChild(inner);
  return card;
}

grid.textContent = '';
if(products.length === 0){
  const empty = el('p','lead','New drop loading — message us on WhatsApp to see what’s in ✨');
  grid.appendChild(empty);
}else{
  products.forEach((p,i)=> grid.appendChild(cardFor(p,i)));
}

/* basket bar events */
if(barClear) barClear.addEventListener('click', ()=>{
  cart = []; writeCart(cart); updateBar();
  grid.querySelectorAll('.chip-add').forEach(b=>{ b.textContent='Add to order'; b.classList.remove('chip-added'); });
});
updateBar();

/* ---------- reveal + tilt for the freshly rendered cards ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.15});
grid.querySelectorAll('.reveal').forEach(n=> io.observe(n));

if(finePointer && !reduced){
  grid.querySelectorAll('[data-tilt]').forEach(card=>{
    const max = 9;
    card.addEventListener('pointermove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width;
      const py = (e.clientY - r.top)/r.height;
      card.style.setProperty('--ry', ((px - .5)*max*2).toFixed(2)+'deg');
      card.style.setProperty('--rx', ((.5 - py)*max*2).toFixed(2)+'deg');
      card.style.setProperty('--mx', (px*100).toFixed(1)+'%');
      card.style.setProperty('--my', (py*100).toFixed(1)+'%');
    });
    card.addEventListener('pointerleave', ()=>{
      card.style.setProperty('--rx','0deg'); card.style.setProperty('--ry','0deg');
    });
  });
}
})();
