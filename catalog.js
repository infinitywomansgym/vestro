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
const CATS = { saree:'Sarees', modern:'Modern wear', workwear:'Work wear' };
function catOf(p){ return CATS[p.category] ? p.category : 'saree'; }

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
/* link that opens the site straight onto this product's photos, so the
   order message shows exactly which piece is meant */
function productLink(id){
  return `${location.origin}${location.pathname}#p=${encodeURIComponent(id)}`;
}
function singleOrderLink(p){
  const price = p.price ? ` (${p.price})` : '';
  const msg = `Hi Vestro by RA! I'd like to order the *${p.name}*${price} ✨\n📷 ${productLink(p.id)}\nPlease confirm availability & delivery.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}
/* always use the latest name/price from the loaded products, not what
   was stored when the customer first tapped "Add to order" */
function liveItem(c){
  const p = products.find(x => x.id === c.id);
  return p ? { name: p.name, price: p.price || '' } : { name: c.name, price: c.price || '' };
}

function basketOrderLink(items){
  const lines = items.map((c,i)=>{
    const t = liveItem(c);
    return `${i+1}. ${t.name}${t.price ? ' — '+t.price : ''}\n   📷 ${productLink(c.id)}`;
  });
  const msg = `Hi Vestro by RA! ✨ I'd like to order these:\n\n${lines.join('\n')}\n\nTotal pieces: ${items.length}\nPlease confirm availability, price & delivery.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

/* ---------- render ---------- */
const grid = document.getElementById('productGrid');
const bar       = document.getElementById('cartBar');
const barCount  = document.getElementById('cartCount');
const barSend   = document.getElementById('cartSend');
const barClear  = document.getElementById('cartClear');
const barPanel  = document.getElementById('cartPanel');
const barToggle = document.getElementById('cartToggle');
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

function imagesOf(p){
  if(p.images && p.images.length) return p.images;
  return p.image ? [p.image] : [];
}

/* pull the number out of a price like "QR 450" so we can compute % off */
function priceNum(s){
  const m = String(s || '').replace(/[,\s]/g,'').match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}
function percentOff(p){
  const now = priceNum(p.price), was = priceNum(p.oldPrice);
  if(now == null || was == null || was <= now) return null;
  const pct = Math.round((was - now) / was * 100);
  return (pct >= 1 && pct <= 90) ? pct : null;
}

/* the 2 most recently added pieces get a "New" tag (live products only) */
const newIds = new Set(
  products.length > 3
    ? products.filter(p => p.createdAt).slice(0, 2).map(p => p.id)
    : []
);

function drapeFor(p){
  const cover = imagesOf(p)[0];
  if(cover){
    const d = el('div','drape drape-photo');
    d.style.backgroundImage = `url("${cover.replace(/"/g,'%22')}")`;
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

function removeFromCart(id){
  cart = cart.filter(c => c.id !== id);
  writeCart(cart);
  const btn = grid.querySelector(`.chip-add[data-id="${CSS.escape(id)}"]`);
  if(btn){ btn.textContent = 'Add to order'; btn.classList.remove('chip-added'); }
  updateBar();
}

/* mini thumbnails for the basket list */
const THUMB_GRAD = {
  goldtissue:'linear-gradient(140deg,#f4e6c6 0%,#e3c88e 42%,#cda760 74%,#b98a3e 100%)',
  saffron:   'linear-gradient(140deg,#fbf6ea 0%,#f2ead6 55%,#e0904c 100%)',
  temple:    'linear-gradient(140deg,#f8f1de 0%,#efe2c2 60%,#e0cb9c 100%)',
  marigold:  'linear-gradient(140deg,#eec886 0%,#dfa858 45%,#cd8038 100%)'
};

function renderPanel(){
  if(!barPanel) return;
  barPanel.textContent = '';
  cart.forEach(c=>{
    const p = products.find(x => x.id === c.id) || {};
    const row = el('div','cart-item');
    const thumb = el('div','cart-item-thumb');
    const cover = imagesOf(p)[0];
    if(cover){ thumb.style.backgroundImage = `url("${cover.replace(/"/g,'%22')}")`; }
    else{ thumb.style.background = THUMB_GRAD[p.style] || THUMB_GRAD.goldtissue; }
    row.appendChild(thumb);
    const info = el('div','cart-item-info');
    const t = liveItem(c);
    info.appendChild(el('h4', null, t.name));
    if(t.price) info.appendChild(el('p', null, t.price));
    row.appendChild(info);
    const x = el('button','cart-item-x','×');
    x.type = 'button';
    x.setAttribute('aria-label', `Remove ${c.name} from order`);
    x.addEventListener('click', ()=> removeFromCart(c.id));
    row.appendChild(x);
    barPanel.appendChild(row);
  });
}

let panelOpen = false;
function setPanel(open){
  panelOpen = open;
  if(barPanel) barPanel.hidden = !open;
  if(barToggle) barToggle.setAttribute('aria-expanded', String(open));
}

function updateBar(){
  if(!bar) return;
  if(cart.length === 0){ bar.hidden = true; setPanel(false); return; }
  bar.hidden = false;
  barCount.textContent = cart.length === 1 ? '1 piece selected' : `${cart.length} pieces selected`;
  barSend.href = basketOrderLink(cart);
  renderPanel();
}

function cardFor(p, i){
  const card = el('article','card reveal');
  card.setAttribute('data-tilt','');
  if(i) card.style.transitionDelay = (Math.min(i,4) * .08) + 's';

  const inner = el('div','card-inner');
  const drape = drapeFor(p);
  if(p.status === 'soldout'){
    drape.appendChild(el('span','sold-badge','Sold out'));
  }else{
    const pct = percentOff(p);
    if(pct) drape.appendChild(el('span','off-badge', `${pct}% off`));
    if(newIds.has(p.id)) drape.appendChild(el('span','new-badge','New'));
  }
  drape.classList.add('drape-click');
  drape.setAttribute('role','button');
  drape.setAttribute('tabindex','0');
  drape.setAttribute('aria-label', `View ${p.name}`);
  drape.addEventListener('click', ()=> openViewer(p));
  drape.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openViewer(p); } });
  inner.appendChild(drape);
  inner.appendChild(el('h3', null, p.name));
  if(p.weave) inner.appendChild(el('p','weave', p.weave));
  if(p.price){
    const priceEl = el('p','price', p.price);
    if(p.oldPrice && percentOff(p)){
      const was = el('s','price-old', p.oldPrice);
      priceEl.append(' ', was);
    }
    inner.appendChild(priceEl);
  }

  const foot = el('div','card-foot');
  if(p.status === 'soldout'){
    foot.appendChild(el('span','chip chip-sold','Sold out'));
    const ask = el('a','chip','Ask on WhatsApp');
    ask.href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi! Will the "${p.name}" be back in stock? 🤍\n📷 ${productLink(p.id)}`)}`;
    ask.target = '_blank'; ask.rel = 'noopener';
    foot.appendChild(ask);
  }else{
    const add = el('button','chip chip-add', inCart(p) ? 'Added ✓' : 'Add to order');
    if(inCart(p)) add.classList.add('chip-added');
    add.type = 'button';
    add.dataset.id = p.id;
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

/* ---------- category filters + grid rendering ---------- */
const filterRow = document.getElementById('filterRow');
const catRow = document.getElementById('catRow');
let activeCat = 'all';

function setCat(val){
  activeCat = val;
  renderCats(); renderFilters(); renderGrid();
}

/* shop-by-category circles (Laly's-style), built from the live products */
function renderCats(){
  if(!catRow) return;
  const present = [...new Set(products.map(catOf))];
  if(present.length < 2){ catRow.hidden = true; return; }
  catRow.hidden = false;
  catRow.textContent = '';
  Object.keys(CATS).filter(c => present.includes(c)).forEach(c=>{
    const items = products.filter(p => catOf(p) === c);
    const b = el('button','cat-circle' + (activeCat === c ? ' cat-on' : ''));
    b.type = 'button';
    const img = el('span','cat-img');
    const cover = items.map(p => imagesOf(p)[0]).find(Boolean);
    if(cover) img.style.backgroundImage = `url("${cover.replace(/"/g,'%22')}")`;
    b.appendChild(img);
    b.appendChild(el('b', null, CATS[c]));
    b.appendChild(el('small', null, items.length === 1 ? '1 piece' : `${items.length} pieces`));
    b.addEventListener('click', ()=> setCat(activeCat === c ? 'all' : c));
    catRow.appendChild(b);
  });
}

function bindFx(scope){
  scope.querySelectorAll('.reveal').forEach(n=> io.observe(n));
  if(finePointer && !reduced){
    scope.querySelectorAll('[data-tilt]').forEach(attachTilt);
  }
}

function renderGrid(){
  grid.textContent = '';
  const list = activeCat === 'all' ? products : products.filter(p => catOf(p) === activeCat);
  if(list.length === 0){
    grid.appendChild(el('p','lead','New drop loading — message us on WhatsApp to see what’s in ✨'));
  }else{
    list.forEach((p,i)=> grid.appendChild(cardFor(p,i)));
  }
  bindFx(grid);
}

function renderFilters(){
  if(!filterRow) return;
  const present = [...new Set(products.map(catOf))];
  if(present.length < 2){ filterRow.hidden = true; return; }
  filterRow.hidden = false;
  filterRow.textContent = '';
  const mk = (val, label)=>{
    const b = el('button','chip' + (activeCat === val ? ' chip-on' : ''), label);
    b.type = 'button';
    b.addEventListener('click', ()=> setCat(val));
    filterRow.appendChild(b);
  };
  mk('all','All');
  Object.keys(CATS).filter(c => present.includes(c)).forEach(c => mk(c, CATS[c]));
}

/* ---------- product viewer (click a saree to open) ---------- */
const pmBackdrop = document.getElementById('pmBackdrop');
const pmImg   = document.getElementById('pmImg');
const pmCount = document.getElementById('pmCount');
const pmDots  = document.getElementById('pmDots');
const pmName  = document.getElementById('pmName');
const pmWeave = document.getElementById('pmWeave');
const pmPrice = document.getElementById('pmPrice');
const pmAdd   = document.getElementById('pmAdd');
const pmBuy   = document.getElementById('pmBuy');
const pmSold  = document.getElementById('pmSold');

let pmProduct = null, pmIndex = 0, pmImages = [];

function pmRender(){
  const many = pmImages.length > 1;
  if(pmImages.length){
    pmImg.style.background = '';
    pmImg.style.backgroundImage = `url("${pmImages[pmIndex].replace(/"/g,'%22')}")`;
  }else{
    pmImg.style.backgroundImage = '';
    pmImg.style.background = THUMB_GRAD[pmProduct.style] || THUMB_GRAD.goldtissue;
  }
  document.getElementById('pmPrev').hidden = !many;
  document.getElementById('pmNext').hidden = !many;
  pmCount.hidden = !many;
  pmCount.textContent = `${pmIndex + 1} / ${pmImages.length}`;
  pmDots.textContent = '';
  if(many){
    pmImages.forEach((_, i)=>{
      const d = el('i', i === pmIndex ? 'on' : null);
      d.addEventListener('click', ()=>{ pmIndex = i; pmRender(); });
      pmDots.appendChild(d);
    });
  }
}

function pmSyncAdd(){
  if(!pmProduct) return;
  const added = inCart(pmProduct);
  pmAdd.textContent = added ? 'Added ✓' : 'Add to order';
  pmAdd.classList.toggle('chip-added', added);
}

function openViewer(p){
  pmProduct = p; pmImages = imagesOf(p); pmIndex = 0;
  pmName.textContent = p.name;
  pmWeave.textContent = p.weave || ''; pmWeave.hidden = !p.weave;
  pmPrice.textContent = p.price || ''; pmPrice.hidden = !p.price;
  if(p.price && p.oldPrice && percentOff(p)){
    const was = el('s','price-old', p.oldPrice);
    pmPrice.append(' ', was);
  }
  const sold = p.status === 'soldout';
  pmAdd.hidden = sold; pmBuy.hidden = sold; pmSold.hidden = !sold;
  pmBuy.href = singleOrderLink(p);
  pmSyncAdd();
  pmRender();
  pmBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeViewer(){
  pmBackdrop.hidden = true;
  document.body.style.overflow = '';
  pmProduct = null;
}

function pmStep(d){
  if(pmImages.length < 2) return;
  pmIndex = (pmIndex + d + pmImages.length) % pmImages.length;
  pmRender();
}

if(pmBackdrop){
  document.getElementById('pmClose').addEventListener('click', closeViewer);
  document.getElementById('pmPrev').addEventListener('click', ()=> pmStep(-1));
  document.getElementById('pmNext').addEventListener('click', ()=> pmStep(1));
  pmBackdrop.addEventListener('click', e=>{ if(e.target === pmBackdrop) closeViewer(); });
  document.addEventListener('keydown', e=>{
    if(pmBackdrop.hidden) return;
    if(e.key === 'Escape') closeViewer();
    if(e.key === 'ArrowLeft') pmStep(-1);
    if(e.key === 'ArrowRight') pmStep(1);
  });
  /* swipe between photos on touch screens */
  let touchX = null;
  pmImg.addEventListener('touchstart', e=>{ touchX = e.touches[0].clientX; }, {passive:true});
  pmImg.addEventListener('touchend', e=>{
    if(touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if(Math.abs(dx) > 45) pmStep(dx < 0 ? 1 : -1);
    touchX = null;
  }, {passive:true});
  pmAdd.addEventListener('click', ()=>{
    if(!pmProduct) return;
    const gridBtn = grid.querySelector(`.chip-add[data-id="${CSS.escape(pmProduct.id)}"]`);
    if(gridBtn){ gridBtn.click(); }
    else{ toggleCart(pmProduct, pmAdd); }
    pmSyncAdd();
  });
}

/* basket bar events */
if(barToggle) barToggle.addEventListener('click', ()=> setPanel(!panelOpen));
if(barClear) barClear.addEventListener('click', ()=>{
  cart = []; writeCart(cart); updateBar();
  grid.querySelectorAll('.chip-add').forEach(b=>{ b.textContent='Add to order'; b.classList.remove('chip-added'); });
});
updateBar();

/* ---------- reveal + tilt helpers ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.15});

function attachTilt(card){
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
}

/* ---------- first paint ---------- */
renderCats();
renderFilters();
renderGrid();

/* deep link: opening vestrobyra.com/#p=<id> (from an order message) jumps
   straight to that product's photos */
const deep = location.hash.match(/^#p=(.+)$/);
if(deep && pmBackdrop){
  const p = products.find(x => x.id === decodeURIComponent(deep[1]));
  if(p){
    document.getElementById('collection')?.scrollIntoView();
    openViewer(p);
  }
}
})();
