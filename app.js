const $ = (id) => document.getElementById(id);
const KEY = 'fuelnote.v1';
const PIN_KEY = 'fuelnote.pin';
const MEALS = ['Breakfast','Lunch','Dinner','Snacks'];
const STARTER_FOODS = [
  ['Chicken breast, cooked','Protein',165,31,0,3.6,'chicken breast grilled roast'],
  ['Chicken breast, raw','Protein',120,22.5,0,2.6,'chicken uncooked'],
  ['White rice, cooked','Grains',130,2.7,28.2,0.3,'rice basmati'],
  ['Brown rice, cooked','Grains',123,2.7,25.6,1,'rice'],
  ['White rice, dry','Grains',365,7.1,80,0.7,'uncooked rice'],
  ['Oats, rolled, dry','Grains',389,16.9,66.3,6.9,'oatmeal porridge raw'],
  ['Egg, whole, boiled','Protein',155,12.6,1.1,10.6,'eggs'],
  ['Egg, whole, raw','Protein',143,12.6,0.7,9.5,'eggs'],
  ['Egg whites','Protein',52,10.9,0.7,0.2,'egg'],
  ['Lean beef mince, cooked','Protein',217,26,0,12,'ground beef'],
  ['Beef steak, lean, grilled','Protein',194,29,0,7,'sirloin beef'],
  ['Tuna, canned in water, drained','Protein',116,25.5,0,0.8,'fish'],
  ['Salmon, cooked','Protein',206,22.1,0,12.4,'fish'],
  ['Hake, cooked','Protein',111,23,0,1.5,'fish'],
  ['Whey protein powder','Protein',400,80,8,6,'protein supplement shake varies by brand'],
  ['Greek yogurt, plain, 2%','Dairy',73,10,3.9,2,'yoghurt'],
  ['Plain yogurt, full-fat','Dairy',61,3.5,4.7,3.3,'yoghurt'],
  ['Cottage cheese, low-fat','Dairy',84,11,4.3,2.3,'cheese'],
  ['Milk, whole','Dairy',61,3.2,4.8,3.3,'full cream milk'],
  ['Milk, low-fat, 2%','Dairy',50,3.4,4.8,2,'milk'],
  ['Cheddar cheese','Dairy',403,25,1.3,33,'cheese'],
  ['Banana','Fruit',89,1.1,22.8,0.3,'fruit'],
  ['Apple, with skin','Fruit',52,0.3,13.8,0.2,'fruit'],
  ['Orange','Fruit',47,0.9,11.8,0.1,'fruit'],
  ['Strawberries','Fruit',32,0.7,7.7,0.3,'berries'],
  ['Blueberries','Fruit',57,0.7,14.5,0.3,'berries'],
  ['Avocado','Fruit',160,2,8.5,14.7,'avo'],
  ['Broccoli, boiled','Vegetables',35,2.4,7.2,0.4,'veg'],
  ['Spinach, raw','Vegetables',23,2.9,3.6,0.4,'vegetable'],
  ['Carrots, raw','Vegetables',41,0.9,9.6,0.2,'carrot'],
  ['Tomato, raw','Vegetables',18,0.9,3.9,0.2,'tomatoes'],
  ['Potato, boiled','Vegetables',87,1.9,20.1,0.1,'potatoes'],
  ['Sweet potato, baked','Vegetables',90,2,20.7,0.2,'sweetpotato'],
  ['Mixed vegetables, cooked','Vegetables',60,2.5,11,0.5,'vegetables'],
  ['Pap / maize meal porridge, cooked','South African',110,2.5,24,0.5,'mielie pap maize stiff porridge approximate varies by water'],
  ['Maize meal, dry','South African',362,8.1,76.9,3.6,'pap dry mielie'],
  ['Samp, cooked','South African',122,3.1,26.5,0.8,'maize samp'],
  ['Sugar beans, cooked','South African',127,8.7,22.8,0.5,'beans'],
  ['Chakalaka, prepared','South African',90,2,10,4.5,'relish varies by recipe'],
  ['Boerewors, grilled','South African',310,15,3,26,'sausage varies by brand'],
  ['Wholewheat bread','Grains',247,13,41,4.2,'bread whole grain'],
  ['White bread','Grains',266,8.9,49,3.2,'bread'],
  ['Peanut butter','Fats',588,25,20,50,'nut butter'],
  ['Almonds','Fats',579,21.2,21.6,49.9,'nuts'],
  ['Olive oil','Fats',884,0,0,100,'oil'],
  ['Butter','Fats',717,0.9,0.1,81.1,'fat'],
  ['Honey','Other',304,0.3,82.4,0,'sweetener'],
  ['Sugar','Other',387,0,100,0,'sucrose'],
  ['Pasta, cooked','Grains',158,5.8,30.9,0.9,'spaghetti macaroni'],
  ['Lentils, cooked','Protein',116,9,20.1,0.4,'legumes'],
  ['Chickpeas, cooked','Protein',164,8.9,27.4,2.6,'beans'],
  ['Chicken thigh, cooked, skinless','Protein',209,26,0,10.9,'chicken']
].map(([name,category,kcal,protein,carbs,fat,tags],i)=>({id:'local-'+i,name,category,kcal,protein,carbs,fat,tags,source:'Generic estimate'}));
const DEFAULT = {goals:{cal:2400,protein:150,carbs:270,fat:80}, entries:[],custom:[],favorites:[],profile:null,water:[],waterGoal:2500};
const LIQUID_FOODS = [
  ['Orange juice, unsweetened','Drinks',45,0.7,10.4,0.2,'juice orange'],
  ['Apple juice','Drinks',46,0.1,11.3,0.1,'juice apple'],
  ['Cola, regular','Drinks',42,0,10.6,0,'soft drink soda coke'],
  ['Cola, sugar free','Drinks',0,0,0,0,'soft drink cola diet'],
  ['Sports drink','Drinks',25,0,6.2,0,'sports isotonic'],
  ['Coffee, brewed, black','Drinks',1,0.1,0,0,'coffee'],
  ['Tea, unsweetened','Drinks',1,0,0,0,'tea'],
  ['Milk, whole (per 100ml)','Dairy',62,3.2,4.8,3.5,'milk liquid'],
  ['Milk, low-fat (per 100ml)','Dairy',48,3.4,4.9,1.8,'milk liquid'],
].map(([name,category,kcal,protein,carbs,fat,tags],i)=>({id:'drink-'+i,name,category,kcal,protein,carbs,fat,tags,basis:'ml',source:'Generic drink estimate · per 100ml'}));
let suggestedPlan = null;
let portionChoices = [];
let store = loadStore();
let selectedDate = todayKey();
let currentPage = 'today';
let currentFood = null;
let editingEntryId = null;
let latestFoods = [];
let activeFoodFilter = 'popular';
let remoteFoods = [];
let querySeq = 0;
let searchTimer;
let photoData = null;
let photoThumb = null;
let aiItems = [];
let aiNotes = '';
let reviewAiIndex = null;
let scanner = null;
let scanWorking = false;
let stopToast;

function loadStore(){try{const data=JSON.parse(localStorage.getItem(KEY));if(data&&Array.isArray(data.entries)&&data.goals)return {...DEFAULT,...data,goals:{...DEFAULT.goals,...data.goals},custom:Array.isArray(data.custom)?data.custom:[],favorites:Array.isArray(data.favorites)?data.favorites:[],water:Array.isArray(data.water)?data.water:[],profile:data.profile&&typeof data.profile==='object'?data.profile:null,waterGoal:Number(data.waterGoal)>0?Number(data.waterGoal):2500};}catch{}return structuredClone(DEFAULT)}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(store));return true;}catch(e){if(e.name==='QuotaExceededError'){store.entries=store.entries.map(x=>({...x,photo:null}));try{localStorage.setItem(KEY,JSON.stringify(store));toast('Storage full — older photo thumbnails were removed.');return true;}catch{}}toast('Unable to save; check available device storage.');return false}}
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateObject(key){return new Date(key+'T12:00:00')}
function shiftDate(key,amount){const d=dateObject(key);d.setDate(d.getDate()+amount);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function num(x){return Number.isFinite(Number(x))?Number(x):0}
function fmt(x){return Math.round(num(x)).toLocaleString('en-ZA')}
function fmtG(x){return num(x).toFixed(1).replace(/\.0$/,'')}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(stopToast);stopToast=setTimeout(()=>el.classList.remove('show'),3000)}
function saveEntry(entry){store.entries.push(entry);persist();renderToday();toast('Added to your food diary');}
function foodIcon(food) {
  const s = (food.category || '').toLowerCase();
  const icons = {
    protein: '<path d="M12 22c4.4 0 8-3.2 8-7.6C20 9.6 16.5 2 12 2S4 9.6 4 14.4C4 18.8 7.6 22 12 22Z"/>',
    fruit: '<path d="M12 7C9 4 5 5 4 9c-1 4 1 13 6 13 1 0 1.3-.5 2-.5s1 .5 2 .5c5 0 7-9 6-13-1-4-5-5-8-2Z"/><path d="M12 7c0-3 1-4 4-5"/>',
    dairy: '<path d="M9 2h6v4H9z"/><path d="m9 6-3 4v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10l-3-4"/><path d="M6 13h12"/>',
    grain: '<path d="M12 22V2"/><path d="M12 7C8 7 7 6 6 3c4 0 5 1 6 4ZM12 11c4 0 5-1 6-4-4 0-5 1-6 4ZM12 15c-4 0-5-1-6-4 4 0 5 1 6 4ZM12 19c4 0 5-1 6-4-4 0-5 1-6 4Z"/>',
    vegetable: '<path d="M20 4C12 4 5 6 5 15a5 5 0 0 0 5 5c9 0 11-7 10-16Z"/><path d="M4 21c2-6 6-10 12-13"/>',
    fats: '<path d="M12 22a8 8 0 0 0 8-8c0-4-8-12-8-12S4 10 4 14a8 8 0 0 0 8 8Z"/>',
    other: '<path d="M4 2v7a3 3 0 0 0 6 0V2M7 2v20M20 22V2c-4 2-5 7-5 11h5"/>'
  };
  let type = 'other';
  if (/protein|meat|chicken|fish|egg|poultry/.test(s)) type = 'protein';
  else if (/fruit/.test(s)) type = 'fruit';
  else if (/dairy|milk|cheese|yogurt/.test(s)) type = 'dairy';
  else if (/grain|cereal|bread|rice|pasta/.test(s)) type = 'grain';
  else if (/vegetable|salad/.test(s)) type = 'vegetable';
  else if (/fat|oil|nut/.test(s)) type = 'fats';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[type]}</svg>`;
}
function goPage(page){if(!['today','search','scan','photo','settings','profile'].includes(page))return;if(currentPage==='scan'&&page!=='scan')stopScanner();currentPage=page;document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id==='page-'+page));document.querySelectorAll('.nav-item').forEach(e=>e.classList.toggle('active',e.dataset.go===page));window.scrollTo({top:0,behavior:'instant'});if(page==='today')renderToday();if(page==='search')renderSearch($('food-query').value);if(page==='settings')loadSettings();if(page==='profile')loadProfile();}
function recalcFor(food,grams){const factor=grams/100;return {kcal:num(food.kcal)*factor,protein:num(food.protein)*factor,carbs:num(food.carbs)*factor,fat:num(food.fat)*factor}}
function entryNutrients(entry){return recalcFor(entry,entry.grams)}
function renderToday(){
  const today=store.entries.filter(e=>e.date===selectedDate);renderWater();
  const totals=today.reduce((s,e)=>{const n=entryNutrients(e);for(const key of ['kcal','protein','carbs','fat'])s[key]+=n[key];return s},{kcal:0,protein:0,carbs:0,fat:0});
  $('selected-date').textContent=selectedDate===todayKey()?'Today':selectedDate===shiftDate(todayKey(),-1)?'Yesterday':dateObject(selectedDate).toLocaleDateString('en-ZA',{weekday:'long'});
  $('selected-date-sub').textContent=dateObject(selectedDate).toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'});
  $('cal-eaten').textContent=fmt(totals.kcal);
  $('cal-left').textContent=fmt(store.goals.cal-totals.kcal);
  $('cal-goal').textContent=fmt(store.goals.cal);
  const percent=Math.min(100,Math.max(0,totals.kcal/Math.max(1,store.goals.cal)*100));
  $('cal-ring').style.background=`conic-gradient(var(--lime) ${percent*3.6}deg,#40513e ${percent*3.6}deg)`;
  $('cal-ring').setAttribute('aria-label',`${fmt(totals.kcal)} of ${fmt(store.goals.cal)} calories eaten`);
  for(const key of ['protein','carbs','fat']){$(key+'-value').innerHTML=`${fmtG(totals[key])} <small>g</small>`;$(key+'-goal').textContent=`of ${fmtG(store.goals[key])}g`;$(key+'-bar').style.width=Math.min(100,totals[key]/Math.max(1,store.goals[key])*100)+'%'}
  const html=MEALS.map(meal=>{const entries=today.filter(e=>e.meal===meal);if(!entries.length)return '';const kcal=entries.reduce((s,e)=>s+entryNutrients(e).kcal,0);return `<section class="meal-section"><div class="meal-header"><span>${meal}</span><span>${fmt(kcal)} kcal</span></div>${entries.map(e=>`<div class="food-entry" data-edit="${esc(e.id)}"><div class="entry-thumb">${e.photo?`<img class="entry-image" alt="" src="${esc(e.photo)}">`:`<span class="entry-placeholder">${foodIcon(e)}</span>`}</div><div class="entry-main"><b>${esc(e.name)}</b><span>${esc(e.portionLabel||fmtG(e.grams)+(e.basis==='ml'?'ml':'g'))} · ${fmtG(entryNutrients(e).protein)}g protein</span></div><div class="entry-kcal"><b>${fmt(entryNutrients(e).kcal)}</b><small>kcal</small></div><button class="delete-entry" type="button" aria-label="Remove ${esc(e.name)}" data-delete="${esc(e.id)}">×</button></div>`).join('')}</section>`}).join('');
  $('diary').innerHTML=html||`<div class="empty-diary"><div class="empty-glyph">♧</div><b>A fresh start</b><p>No food logged for this day yet. Start with a meal, snack or your post-workout protein.</p><button type="button" data-go="search">＋ Log your first food</button></div>`;
}
// Prioritize the foods gym-goers frequently log; other foods are still searchable.
// Names are stable so existing saved food IDs and diary entries are untouched.
const FEATURED_FOOD_NAMES = [
 'Chicken breast, cooked', 'Beef steak, lean, grilled', 'Hake, cooked',
 'Salmon, cooked', 'Tuna, canned in water, drained', 'Egg, whole, boiled',
 'Lean beef mince, cooked', 'Chicken thigh, cooked, skinless',
 'White rice, cooked', 'Brown rice, cooked', 'Potato, boiled',
 'Sweet potato, baked', 'Pasta, cooked', 'Wholewheat bread',
 'Broccoli, boiled', 'Mixed vegetables, cooked', 'Spinach, raw',
 'Carrots, raw', 'Banana', 'Greek yogurt, plain, 2%',
 'Whey protein powder'
];
const FEATURED_FOODS = FEATURED_FOOD_NAMES.map(name=>STARTER_FOODS.find(f=>f.name===name)).filter(Boolean);
// Favourite foods and recent entries are retained on this device with the diary.
// Use a stable name key so local, scanned and online foods can be recognised again.
function foodKey(food){return String(food?.barcode||'').replace(/\D/g,'') || String(food?.name||'').trim().toLocaleLowerCase();}
function isFavourite(food){return store.favorites.some(f=>foodKey(f)===foodKey(food));}
function toggleFavourite(food){
  const key=foodKey(food),idx=store.favorites.findIndex(f=>foodKey(f)===key);
  if(idx>=0)store.favorites.splice(idx,1);
  else store.favorites.unshift({...food,photo:undefined,portionLabel:undefined,portionQty:undefined,portionUnit:undefined,grams:undefined});
  store.favorites=store.favorites.slice(0,150);
  persist();renderSearch($('food-query').value);
  toast(idx>=0?'Removed from Favourites':'Added to Favourites');
  const b=$('toggle-favorite');if(b){b.textContent=isFavourite(food)?'★ Saved to Favourites':'☆ Save to Favourites';b.setAttribute('aria-pressed',String(isFavourite(food)));}
}
function recentFoods(){
  const found=new Set();
  return [...store.entries].reverse().filter(e=>{const k=foodKey(e);if(!k||found.has(k))return false;found.add(k);return true;})
    .map(e=>({name:e.name,category:e.category||'Other',id:'recent-'+foodKey(e),source:e.source||'Previously logged',barcode:e.barcode||'',basis:e.basis||'g',servingGrams:e.servingGrams,kcal:e.kcal,protein:e.protein,carbs:e.carbs,fat:e.fat}))
    .slice(0,30);
}
const CATEGORY_LABELS = {favorites:'Your favourites',recent:'Recently logged foods',popular:'Popular gym foods',protein:'Protein foods',carbs:'Carbohydrate sources',vegetables:'Vegetables',fruit:'Fruit',drinks:'Drinks',supplements:'Supplements'};
function matchesFoodCategory(food,category){
 const name=(food.name||'').toLowerCase(),kind=(food.category||'').toLowerCase();
 switch(category){
  case 'protein': return kind==='protein' && !/whey|protein powder|mass gainer|supplement/.test(name);
  case 'carbs': return kind==='grains'||/potato|samp|maize meal|pap|porridge|pasta|rice|bread|quinoa/.test(name);
  case 'vegetables': return kind==='vegetables' && !/potato/.test(name);
  case 'fruit': return kind==='fruit';
  case 'drinks': return food.basis==='ml'||kind==='drinks';
  case 'supplements': return /whey|protein powder|mass gainer|fast grow|creatine|supplement/.test(name+' '+(food.tags||''));
  default: return true;
 }
}
function sortTrainingFoods(foods){
 const rank = new Map(FEATURED_FOOD_NAMES.map((name,i)=>[name,i]));
 return [...foods].sort((a,b)=>(rank.get(a.name)??1000)-(rank.get(b.name)??1000));
}
function renderSearch(q=''){
 const query=q.trim().toLowerCase(),tokens=query.split(/\s+/).filter(Boolean);
 const all=[...store.custom,...store.favorites,...STARTER_FOODS,...LIQUID_FOODS];
 let local;
 if(query){
   local=all.filter(f=>tokens.every(t=>(f.name+' '+(f.tags||'')+' '+(f.category||'')).toLowerCase().includes(t)));
 }else if(activeFoodFilter==='favorites'){
   local=[...store.favorites];
 }else if(activeFoodFilter==='recent'){
   local=recentFoods();
 }else if(activeFoodFilter==='popular'){
   local=[...store.custom.slice(0,3),...FEATURED_FOODS];
 }else{
   local=sortTrainingFoods(all.filter(f=>matchesFoodCategory(f,activeFoodFilter)));
 }
 const candidates=local.concat(query?remoteFoods:[]),seen=new Set();
 latestFoods=candidates.filter(f=>{const k=foodKey(f);if(!k||seen.has(k))return false;seen.add(k);return true;}).slice(0,40);
 document.querySelectorAll('[data-category]').forEach(btn=>{
   const selected=!query&&btn.dataset.category===activeFoodFilter;
   btn.classList.toggle('active',selected);
   btn.setAttribute('aria-pressed',String(selected));
 });
 $('results-title').textContent=query?'Food matches':CATEGORY_LABELS[activeFoodFilter]||'Popular gym foods';
 $('results-count').textContent=`${latestFoods.length} items · per 100g or 100ml`;
 $('search-results').innerHTML=latestFoods.map((f,i)=>`<div class="food-result-row">
   <button class="food-result" data-food-index="${i}" type="button"><span class="food-result-icon">${foodIcon(f)}</span><span class="food-result-name"><b>${esc(f.name)}</b><small>${esc(f.source||f.category||'Food')} · P ${fmtG(f.protein)}g · C ${fmtG(f.carbs)}g · F ${fmtG(f.fat)}g</small></span><span class="food-result-cal"><strong>${fmt(f.kcal)}</strong><small>kcal / 100${f.basis==='ml'?'ml':'g'}</small></span></button>
   <button type="button" class="favourite-toggle ${isFavourite(f)?'saved':''}" data-favorite-index="${i}" aria-label="${isFavourite(f)?'Remove':'Add'} ${esc(f.name)} ${isFavourite(f)?'from':'to'} favourites" aria-pressed="${isFavourite(f)}">${isFavourite(f)?'★':'☆'}</button>
  </div>`).join('')||`<div class="subtle-empty">${activeFoodFilter==='favorites'&&!query?'No favourites yet. Tap the star beside any food to save it here.':activeFoodFilter==='recent'&&!query?'Foods you log will appear here for quick reuse.':'No foods found. Try another search or create a custom food.'}</div>`;
}
async function remoteSearch(query){const thisSeq=++querySeq;remoteFoods=[];if(query.length<3){renderSearch(query);return;}$('search-spinner').hidden=false;
 try{const payload=await requestFood('q',query);if(thisSeq!==querySeq)return;remoteFoods=(payload.foods||[]).slice(0,18);renderSearch(query);}catch(e){if(thisSeq===querySeq){renderSearch(query);if(![...store.custom,...STARTER_FOODS].some(f=>f.name.toLowerCase().includes(query.toLowerCase())))$('search-results').insertAdjacentHTML('beforeend','<p class="helper-note">Online product search is unavailable. Everyday foods and your custom foods still work.</p>');}}finally{if(thisSeq===querySeq)$('search-spinner').hidden=true;}}
async function requestFood(type,value){
 let resp;try{resp=await fetch('/api/food?'+new URLSearchParams({[type]:value}),{cache:'no-store'});if(resp.ok)return await resp.json();if(resp.status!==404)throw Error('Product lookup unavailable');}catch(e){if(resp&&resp.status!==404)throw e;}
 const fields='code,product_name,brands,nutriments,quantity';
 const url=type==='barcode'?`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(value)}.json?fields=${fields}`:`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(value)}&search_simple=1&action=process&json=1&page_size=15&fields=${fields}`;
 const off=await fetch(url);if(!off.ok)throw Error('Food database unavailable');const data=await off.json();return {foods:(type==='barcode'?(data.status===1?[data.product]:[]):data.products||[]).map(normalizeOff).filter(Boolean)};
}
function normalizeOff(p){const n=p?.nutriments||{};const kcal=Number.isFinite(Number(n['energy-kcal_100g']))?Number(n['energy-kcal_100g']):Number.isFinite(Number(n['energy-kj_100g']))?Number(n['energy-kj_100g'])/4.184:NaN;const name=[p.product_name,p.brands].filter(Boolean).join(' · ');if(!name||!Number.isFinite(kcal)||kcal<=0||kcal>1000)return null;return {id:'off-'+(p.code||name),name,category:'Packaged',kcal,protein:num(n.proteins_100g),carbs:num(n.carbohydrates_100g),fat:num(n.fat_100g),source:'Open Food Facts · check label'};}
function openSheet(title,html){$('sheet-title').textContent=title;$('sheet-content').innerHTML=html;$('modal-backdrop').hidden=false;document.body.style.overflow='hidden';}
function closeSheet(){$('modal-backdrop').hidden=true;document.body.style.overflow='';currentFood=null;editingEntryId=null;reviewAiIndex=null}
function portionsFor(food){
  const name=(food.name||'').toLowerCase();
  const units=[{id:'g',label:'Grams (g)',factor:1}];
  if(food.basis==='ml'){
    units.splice(0,1,{id:'ml',label:'Millilitres (ml)',factor:1},
      {id:'cup',label:'Cups (250ml)',factor:250},{id:'glass',label:'Glasses (200ml)',factor:200},
      {id:'bottle',label:'Bottles (500ml)',factor:500},{id:'litre',label:'Litres (L)',factor:1000});
    if(food.servingMl)units.push({id:'serving',label:`Servings (${fmtG(food.servingMl)}ml)`,factor:num(food.servingMl)});
    return units;
  }
  if(/\begg\b/.test(name)&&!/egg whites?/.test(name))units.push({id:'small-egg',label:'Small egg (~40g)',factor:40},{id:'medium-egg',label:'Medium egg (~44g)',factor:44},{id:'large-egg',label:'Large egg (~50g)',factor:50});
  if(/bread|toast/.test(name))units.push({id:'slice',label:'Slices (~30g)',factor:30});
  if(/banana/.test(name))units.push({id:'banana',label:'Medium bananas (~118g)',factor:118});
  if(/apple/.test(name))units.push({id:'apple',label:'Medium apples (~182g)',factor:182});
  if(/peanut butter/.test(name))units.push({id:'tbsp',label:'Tablespoons (~16g)',factor:16},{id:'tsp',label:'Teaspoons (~5g)',factor:5});
  if(/white rice, cooked|brown rice, cooked/.test(name))units.push({id:'cup',label:'Cups of cooked rice (~158g)',factor:158});
  if(/oats, rolled, dry/.test(name))units.push({id:'half-cup',label:'Half-cups of dry oats (~40g)',factor:40});
  if(/pap.*cooked|porridge, cooked/.test(name))units.push({id:'cup',label:'Cups (~240g; varies)',factor:240});
  if(/whey|protein powder|mass gainer|fast grow/.test(name)||food.servingGrams)units.push({id:'scoop',label:`Scoops / servings (~${Math.max(1,num(food.servingGrams)||30)}g)`,factor:Math.max(1,num(food.servingGrams)||30)});
  return units;
}
function portionWeight(){
  const u=portionChoices.find(x=>x.id===$('log-unit')?.value)||portionChoices[0];
  return Number($('log-qty')?.value)*(u?.factor||1);
}
function portionLabel(){
  const u=portionChoices.find(x=>x.id===$('log-unit').value)||portionChoices[0];
  const q=Number($('log-qty').value);
  if(u.id==='g'||u.id==='ml')return `${fmtG(q)} ${u.id}`;
  if(u.id.endsWith('-egg'))return `${fmtG(q)} ${u.id.split('-')[0]} egg${q===1?'':'s'} (~${fmtG(q*u.factor)}g)`;
  return `${fmtG(q)} × ${u.label}`;
}
function openFood(food,entry=null){
  currentFood=food;editingEntryId=entry?.id||null;
  const meal=entry?.meal||autoMeal();
  portionChoices=portionsFor(food);
  const prior=entry || [...store.entries].reverse().find(e=>foodKey(e)===foodKey(food));
  const savedUnit=prior?.portionUnit;
  const selected=portionChoices.find(x=>x.id===savedUnit)||portionChoices[0];
  const quantity=prior?.portionQty || (prior?prior.grams/selected.factor : (selected.id==='g'||selected.id==='ml'?100:1));
  openSheet(entry?'Edit food':'Log food',`<div class="source-label">${esc(food.name)}<br>${esc(food.source||'Custom')} · nutrition per 100${food.basis==='ml'?'ml':'g'}. Portion conversions are approximate.</div>
    <div class="field-row portion-inputs"><label class="block-label">Quantity<input id="log-qty" inputmode="decimal" type="number" min="0.1" max="10000" step="0.1" value="${fmtG(quantity)}" required></label>
    <label class="block-label">Measure<select id="log-unit">${portionChoices.map(u=>`<option value="${esc(u.id)}" ${selected.id===u.id?'selected':''}>${esc(u.label)}</option>`).join('')}</select></label></div>
    <p class="portion-equivalent" id="portion-equivalent"></p>
    <button type="button" id="toggle-favorite" class="sheet-favourite" aria-pressed="${isFavourite(food)}">${isFavourite(food)?'★ Saved to Favourites':'☆ Save to Favourites'}</button>
    <label class="block-label">Add to meal<select id="log-meal">${MEALS.map(m=>`<option value="${m}" ${m===meal?'selected':''}>${m}</option>`).join('')}</select></label>
    <div class="sheet-summary"><div><b id="preview-kcal">0</b><small>kcal</small></div><div><b id="preview-protein">0g</b><small>protein</small></div><div><b id="preview-carbs">0g</b><small>carbs</small></div><div><b id="preview-fat">0g</b><small>fat</small></div></div>
    <button type="button" id="confirm-food" class="btn-primary">${entry?'Save changes':'＋ Add to my diary'}</button>`);
  $('log-qty').addEventListener('input',updateFoodPreview);
  $('log-unit').addEventListener('change',()=>{const u=portionChoices.find(x=>x.id===$('log-unit').value);$('log-qty').value=u.id==='g'||u.id==='ml'?'100':'1';updateFoodPreview();});
  $('confirm-food').addEventListener('click',confirmFood);
  $('toggle-favorite').addEventListener('click',()=>toggleFavourite(food));
  updateFoodPreview();
}
function updateFoodPreview(){
  if(!currentFood)return;
  const w=Math.max(0,portionWeight()),n=recalcFor(currentFood,w);
  $('portion-equivalent').textContent=$('log-unit').value.endsWith('-egg')?`Estimated weight: ${fmtG(w)}g`:`Equivalent: ${fmtG(w)} ${currentFood.basis==='ml'?'ml':'g'}`;
  for(const [id,key] of [['preview-kcal','kcal'],['preview-protein','protein'],['preview-carbs','carbs'],['preview-fat','fat']])$(id).textContent=fmtG(n[key])+(key==='kcal'?'':'g');
}

function autoMeal(){const h=new Date().getHours();return h<11?'Breakfast':h<15?'Lunch':h<21?'Dinner':'Snacks'}
function confirmFood(){
  const grams=portionWeight();
  if(!Number.isFinite(grams)||grams<=0||grams>10000){toast('Enter a valid quantity');return;}
  const meal=$('log-meal').value;if(!MEALS.includes(meal))return;
  const portionUnit=$('log-unit').value, portionQty=Number($('log-qty').value), label=portionLabel();
  if(editingEntryId){
    const entry=store.entries.find(e=>e.id===editingEntryId);
    if(entry){Object.assign(entry,{grams,meal,portionUnit,portionQty,portionLabel:label});persist();renderToday();toast('Food updated')}
  }else{
    saveEntry({id:crypto.randomUUID(),date:selectedDate,meal,grams,portionUnit,portionQty,portionLabel:label,basis:currentFood.basis||'g',servingGrams:currentFood.servingGrams||null,barcode:currentFood.barcode||'',name:currentFood.name,kcal:currentFood.kcal,protein:currentFood.protein,carbs:currentFood.carbs,fat:currentFood.fat,category:currentFood.category||'',source:currentFood.source||'',photo:photoThumb||null});
    if(reviewAiIndex!==null){aiItems.splice(reviewAiIndex,1);reviewAiIndex=null;closeSheet();if(aiItems.length){renderAiResults(aiNotes);showStatus('photo-status','Item saved. Review the remaining foods or add them all.');goPage('photo');return;}photoThumb=null;photoData=null;resetPhoto();goPage('today');return;}
    if(photoThumb){photoThumb=null;photoData=null;resetPhoto();}
  }
  closeSheet();goPage('today');
}

function openCustom(){
  openSheet('Create custom food',`<p class="source-label">Enter the numbers exactly as shown on the nutrition label. Choose whether the label lists nutrition per 100g, 100ml or per serving.</p>
    <label class="block-label">Food / drink name<input id="custom-name" placeholder="e.g. Strawberry protein shake" maxlength="100" required></label>
    <div class="field-row"><label class="block-label">Nutrition basis<select id="custom-basis"><option value="g">Per 100g</option><option value="ml">Per 100ml</option><option value="serving-g">Per serving (g)</option><option value="serving-ml">Per serving (ml)</option></select></label>
    <label class="block-label">Serving size (g or ml) <small>Required when entering per-serving values</small><input id="custom-serving" type="number" min="1" max="2000" step="0.1" placeholder="e.g. 30"></label></div>
    <div class="field-row"><label class="block-label">Calories<input id="custom-kcal" type="number" min="0" max="1000" step="0.1" placeholder="0"></label><label class="block-label">Protein (g)<input id="custom-protein" type="number" min="0" max="100" step="0.1" placeholder="0"></label></div>
    <div class="field-row"><label class="block-label">Carbohydrates (g)<input id="custom-carbs" type="number" min="0" max="100" step="0.1" placeholder="0"></label><label class="block-label">Fat (g)<input id="custom-fat" type="number" min="0" max="100" step="0.1" placeholder="0"></label></div>
    <button type="button" id="custom-save" class="btn-primary">Save &amp; log</button>`);
  $('custom-save').addEventListener('click',()=>{
    const name=$('custom-name').value.trim(),rawBasis=$('custom-basis').value,servingSize=$('custom-serving').value?Number($('custom-serving').value):null;
    const basis=rawBasis.endsWith('ml')?'ml':'g';
    const perServing=rawBasis.startsWith('serving-');
    const vals=['kcal','protein','carbs','fat'].map(k=>Number($('custom-'+k).value));
    if(!name||!['g','ml'].includes(basis)||vals.some(v=>!Number.isFinite(v)||v<0)||(perServing&&servingSize===null)||(servingSize!==null&&(!Number.isFinite(servingSize)||servingSize<1||servingSize>2000))){toast('Check the name, units and nutrition values');return;}
    const converted=vals.map(v=>v*(perServing?100/servingSize:1));
    if(converted[0]>1000||converted.slice(1).some(v=>v>100)){toast('Check the label values and serving size');return;}
    const f={id:'custom-'+crypto.randomUUID(),name,category:basis==='ml'?'Drinks':'Custom',source:'Your custom food',basis,servingGrams:basis==='g'?servingSize:null,servingMl:basis==='ml'?servingSize:null,kcal:converted[0],protein:converted[1],carbs:converted[2],fat:converted[3]};
    store.custom.unshift(f);persist();closeSheet();openFood(f);
  });
}
// South African barcode enhancement: use local barcode entries before the online
// database; if unavailable, offer a label-based manual entry rather than a dead end.
function barcodeVariants(code) {
  const value = String(code).replace(/\D/g,'');
  const versions = [value];
  if (value.length === 12) versions.push('0' + value); // UPC-A / EAN-13
  if (value.length === 13 && value[0] === '0') versions.push(value.slice(1));
  if (value.length === 14 && value[0] === '0') versions.push(value.slice(1));
  return [...new Set(versions)];
}
function localBarcodeFood(code) {
  const equivalents = new Set(barcodeVariants(code));
  return store.custom.find(f => f.barcode && barcodeVariants(f.barcode).some(c => equivalents.has(c)));
}
function openMissingBarcode(code, suggestedName = '') {
  const opts = '<option value="100g">Per 100g</option><option value="serving">Per serving</option>';
  openSheet('Add a missing product', `
    <p class="source-label">Barcode <b>${esc(code)}</b> was read, but complete nutrition data was not found online. Enter the information from the <b>exact product and flavour</b>. It will be saved to this device for future scans.</p>
    <label class="block-label">Product name and flavour
      <input id="sa-name" maxlength="100" placeholder="e.g. USN Fast Grow, chocolate" value="${esc(suggestedName)}" required>
    </label>
    <div class="field-row">
      <label class="block-label">Nutrition label values
        <select id="sa-basis">${opts}</select>
      </label>
      <label class="block-label">Serving weight (g)
        <input id="sa-serving" type="number" min="1" max="2000" step="0.1" value="100" disabled>
      </label>
    </div>
    <div class="field-row">
      <label class="block-label">Energy
        <input id="sa-energy" type="number" inputmode="decimal" min="0" step="0.1" placeholder="From label" required>
      </label>
      <label class="block-label">Unit
        <select id="sa-energy-unit"><option value="kj">kJ</option><option value="kcal">kcal</option></select>
      </label>
    </div>
    <div class="field-row">
      <label class="block-label">Protein (g)
        <input id="sa-protein" type="number" inputmode="decimal" min="0" step="0.1" placeholder="From label" required>
      </label>
      <label class="block-label">Carbohydrates (g)
        <input id="sa-carbs" type="number" inputmode="decimal" min="0" step="0.1" placeholder="From label" required>
      </label>
    </div>
    <label class="block-label">Fat (g)
      <input id="sa-fat" type="number" inputmode="decimal" min="0" step="0.1" placeholder="From label" required>
    </label>
    <p class="helper-note">For South African labels, energy is usually shown in kJ. If the label only gives values per serving, select “Per serving” and enter the serving weight in grams. Do not enter guessed or blank values.</p>
    <button type="button" id="sa-save" class="btn-primary full-button">Save product and log food</button>
    <button type="button" id="sa-find-name" class="btn-secondary full-button">Search the online food database by name</button>
  `);
  $('sa-basis').addEventListener('change', () => {
    $('sa-serving').disabled = $('sa-basis').value !== 'serving';
  });
  $('sa-find-name').addEventListener('click', () => {
    const name = $('sa-name').value.trim();
    if (!name) { toast('Enter a product name first'); return; }
    closeSheet();
    goPage('search');
    $('food-query').value = name;
    querySeq++;
    remoteFoods = [];
    renderSearch(name);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => remoteSearch(name), 200);
    toast('Check the flavour and nutrition label before logging a match');
  });
  $('sa-save').addEventListener('click', () => {
    const name = $('sa-name').value.trim();
    const fields = ['energy','protein','carbs','fat'].map(k => $('sa-' + k).value.trim());
    const values = fields.map(Number);
    const perServing = $('sa-basis').value === 'serving';
    const grams = perServing ? Number($('sa-serving').value) : 100;
    if (!name || fields.some(s => s === '') ||
        values.some(v => !Number.isFinite(v) || v < 0) ||
        !Number.isFinite(grams) || grams <= 0 || grams > 2000) {
      toast('Enter the food name and all values from the nutrition label');
      return;
    }
    const multiplier = 100 / grams;
    const kcal = ($('sa-energy-unit').value === 'kj' ? values[0] / 4.184 : values[0]) * multiplier;
    const protein = values[1] * multiplier;
    const carbs = values[2] * multiplier;
    const fat = values[3] * multiplier;
    if (kcal <= 0 || kcal > 1000 || [protein,carbs,fat].some(v => v > 100)) {
      toast('Check the label units and serving weight');
      return;
    }
    const food = {
      id: 'custom-barcode-' + crypto.randomUUID(), name, barcode: code,
      category: 'Packaged', tags: code + ' ' + name,
      source: 'Manually entered nutrition label · verify packaging',
      kcal: Math.round(kcal * 10) / 10,
      protein: Math.round(protein * 100) / 100,
      carbs: Math.round(carbs * 100) / 100,
      fat: Math.round(fat * 100) / 100,
      servingGrams: perServing ? grams : null
    };
    store.custom.unshift(food);
    if (!persist()) { store.custom.shift(); return; }
    closeSheet();
    openFood(food);
    if (perServing) {
      $('log-unit').value = 'g';
      $('log-qty').value = String(grams);
      updateFoodPreview();
    }
    toast('Barcode saved to this device. Future scans will recognize it');
  });
}
async function lookupBarcode(code) {
  const clean = String(code).trim().replace(/\D/g,'');
  if (clean.length < 6 || clean.length > 14) {
    showStatus('scan-status','Barcode should be 6–14 digits.',true);
    return;
  }
  $('barcode-input').value = clean;
  const local = localBarcodeFood(clean);
  if (local) {
    showStatus('scan-status','Saved product found: ' + local.name);
    openFood(local);
    return;
  }
  showStatus('scan-status','Barcode ' + clean + ' detected. Looking up nutrition...');
  try {
    const data = await requestFood('barcode', clean);
    const product = (data.foods || [])[0];
    if (product) {
      showStatus('scan-status','Found: ' + product.name + '. Confirm the label values.');
      openFood(product);
    } else {
      showStatus('scan-status','Barcode detected, but no complete nutrition record is available. Add this product from its label.',true);
      openMissingBarcode(clean, data.incomplete?.name || '');
    }
  } catch(e) {
    showStatus('scan-status','Online lookup unavailable. You can still add this barcode from the package label.',true);
    openMissingBarcode(clean);
  }
}
function showStatus(id,msg,error=false){$(id).textContent=msg;$(id).classList.toggle('error',error)}
function loadScript(url){return new Promise((resolve,reject)=>{if(window.Html5Qrcode){resolve();return;}const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(new Error('Scanner library unavailable'));document.head.appendChild(s);});}
// Barcode scanning v1.2: Decode the FULL camera image, rather than a fixed 235px-wide
// crop. The small crop worked for QR codes but could cut off long EAN/UPC food barcodes.
async function startScanner(){
 if(scanWorking||scanner)return;
 scanWorking=true;
 $('start-scanner').disabled=true;
 showStatus('scan-status','Starting barcode scanner...');
 try{
  await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');
  const F=window.Html5QrcodeSupportedFormats;
  scanner=new window.Html5Qrcode('reader',{
   formatsToSupport:[F.EAN_13,F.EAN_8,F.UPC_A,F.UPC_E,F.CODE_128],
   useBarCodeDetectorIfSupported:false,
   verbose:false
  });
  let handled=false;
  const onDetected=async (code)=>{
   if(handled||!scanner)return;
   handled=true;
   showStatus('scan-status','Barcode detected. Looking up product...');
   await stopScanner();
   await lookupBarcode(code);
  };
  // videoConstraints are best-effort. A higher-resolution rear camera image
  // helps with thin one-dimensional barcodes. If unsupported, fall back.
  try{
   await scanner.start({facingMode:'environment'}, {
    fps:12,
    disableFlip:true,
    videoConstraints:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}
    // No qrbox: scan the entire video frame, including both ends of the code.
   },onDetected,()=>{});
  }catch(highResError){
   await scanner.start({facingMode:'environment'}, {
    fps:10,disableFlip:true
   },onDetected,()=>{});
  }
  $('scan-placeholder').hidden=true;
  $('stop-scanner').hidden=false;
  showStatus('scan-status','Hold the full barcode horizontally in view. Keep it sharp and well lit. If it still will not scan, use a barcode photo or type the digits below.');
 }catch(e){
  showStatus('scan-status','Unable to start scanner. Check Safari camera permissions, or use barcode photo/manual lookup. '+(e.message||''),true);
  await stopScanner();
 }finally{
  scanWorking=false;
  $('start-scanner').disabled=false;
 }
}
async function stopScanner(){if(scanner){const active=scanner;scanner=null;try{if(active.isScanning)await active.stop();await active.clear();}catch{}}$('reader').innerHTML='';$('scan-placeholder').hidden=false;$('stop-scanner').hidden=true;}
async function scanFile(file){if(!file)return;showStatus('scan-status','Reading barcode image...');let imageScanner=null;try{await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');await stopScanner();imageScanner=new window.Html5Qrcode('reader');const code=await imageScanner.scanFile(file,true);await lookupBarcode(code);}catch(e){showStatus('scan-status','Could not read barcode from that image. Try a sharper photo or enter the digits below.',true)}finally{if(imageScanner){try{await imageScanner.clear()}catch{}}}}
function imageAsData(file,maxDim,quality){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/')){reject(new Error('Select an image file'));return;}const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{try{const ratio=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*ratio));c.height=Math.max(1,Math.round(img.naturalHeight*ratio));c.getContext('2d',{alpha:false}).drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',quality));}catch(e){reject(e)}finally{URL.revokeObjectURL(url)}};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Unable to open image'))};img.src=url;});}
async function selectPhoto(file){if(!file)return;try{photoData=await imageAsData(file,1024,.74);photoThumb=await imageAsData(file,200,.5);$('photo-preview').src=photoData;$('photo-preview').hidden=false;$('photo-empty').hidden=true;$('photo-analyze').disabled=false;aiItems=[];aiNotes='';reviewAiIndex=null;$('photo-results').innerHTML='';showStatus('photo-status','Picture ready. Log the food manually to attach its photo.');}catch(e){showStatus('photo-status',e.message,true)}}
function resetPhoto(){$('photo-preview').removeAttribute('src');$('photo-preview').hidden=true;$('photo-empty').hidden=false;$('photo-analyze').disabled=true;$('photo-results').innerHTML='';showStatus('photo-status','');}
async function analyzePhoto(){if(!photoData)return;const button=$('photo-analyze');button.disabled=true;button.textContent='Estimating your meal…';showStatus('photo-status','AI is checking visible foods and estimating their portions.');
 try{const headers={'content-type':'application/json'};const pin=localStorage.getItem(PIN_KEY)||'';if(pin)headers['x-app-pin']=pin;const res=await fetch('/api/analyze',{method:'POST',headers,body:JSON.stringify({image:photoData})});let data={};try{data=await res.json()}catch{}if(!res.ok)throw Error(data.error||'AI photo service not configured on this deployment.');if(!Array.isArray(data.items)||!data.items.length)throw Error('No food detected. Try a clearer photo or use manual logging.');aiItems=data.items.filter(x=>x.name&&num(x.grams)>0).slice(0,8);if(!aiItems.length)throw Error('No identifiable food was found.');aiNotes=data.notes||'';showStatus('photo-status','Review the estimates before saving.');renderAiResults(aiNotes);}catch(e){showStatus('photo-status',e.message||'Unable to analyze photo. Manual tracking is still available.',true);}finally{button.disabled=!photoData;button.textContent='✦ Estimate calories with AI';}}
function renderAiResults(notes){const sum=aiItems.reduce((s,x)=>s+num(x.kcal),0);$('photo-results').innerHTML=`<div class="ai-total"><b>≈ ${fmt(sum)} kcal</b><small>AI estimate • review portions before logging</small></div>${aiItems.map((x,i)=>`<div class="ai-item"><div><strong>${esc(x.name)}</strong><small>~${fmt(x.grams)}g · ${fmt(x.kcal)} kcal · P ${fmtG(x.protein)}g / C ${fmtG(x.carbs)}g / F ${fmtG(x.fat)}g</small></div><button type="button" data-ai-item="${i}">Review</button></div>`).join('')}<p class="helper-note">${esc(notes)}</p><button type="button" id="ai-add-all" class="btn-primary full-button">＋ Add all estimated foods</button>`;}
function aiFood(x){const grams=Math.max(1,num(x.grams));return {id:'ai-'+crypto.randomUUID(),name:x.name,category:'AI estimate',source:'AI photo estimate · verify portions',kcal:num(x.kcal)*100/grams,protein:num(x.protein)*100/grams,carbs:num(x.carbs)*100/grams,fat:num(x.fat)*100/grams};}
function addAllAi(){if(!aiItems.length)return;const meal=autoMeal();aiItems.forEach((x,i)=>{const f=aiFood(x);store.entries.push({...f,id:crypto.randomUUID(),date:selectedDate,meal,grams:Math.max(1,num(x.grams)),photo:i===0?photoThumb:null});});persist();toast(`${aiItems.length} items added to your diary`);aiItems=[];aiNotes='';reviewAiIndex=null;photoData=null;photoThumb=null;resetPhoto();goPage('today');}
// Profile estimates use the adult Mifflin–St Jeor RMR equation and a selected
// activity factor. Training sessions are included in activity; no double count.
function calculatePlan(p){
  const base=10*p.weight+6.25*p.height-5*p.age;
  const rmr=base+(p.equation==='male'?5:p.equation==='female'?-161:-78);
  const maintenance=rmr*p.activity;
  const adjustments={gain:1.10,lose:0.85,maintain:1,recomp:0.95};
  const calories=Math.round(maintenance*adjustments[p.goal]/10)*10;
  const factor=({gain:2.0,lose:2.2,maintain:1.6,recomp:2.0})[p.goal];
  const protein=Math.round(p.weight*factor),fat=Math.round(p.weight*0.8);
  const carbs=Math.max(0,Math.round((calories-protein*4-fat*9)/4));
  return {cal:calories,protein,carbs,fat,maintenance:Math.round(maintenance),rmr:Math.round(rmr)};
}
function loadProfile(){
  const p=store.profile;
  if(!p){$('profile-results').hidden=true;suggestedPlan=null;return;}
  for(const k of ['age','weight','height','equation','activity','goal'])if($('profile-'+k))$('profile-'+k).value=(k==='activity'&&Number(p.activity)===1.9)?1.725:p[k];
  showPlan(calculatePlan({...p,activity:Number(p.activity)===1.9?1.725:p.activity}));
}
function showPlan(plan){
  suggestedPlan=plan;
  $('profile-results').hidden=false;
  $('recommend-cal').textContent=fmt(plan.cal);
  $('recommend-resting').textContent=fmt(plan.rmr)+' kcal';
  $('recommend-maintenance').textContent=fmt(plan.maintenance)+' kcal';
  for(const key of ['protein','carbs','fat'])$('recommend-'+key).textContent=fmt(plan[key])+'g';
}
function submitProfile(e){
  e.preventDefault();
  const p={age:Number($('profile-age').value),weight:Number($('profile-weight').value),height:Number($('profile-height').value),
    equation:$('profile-equation').value,activity:Number($('profile-activity').value),goal:$('profile-goal').value};
  if(!Number.isInteger(p.age)||p.age<18||p.age>100||p.weight<30||p.weight>350||p.height<120||p.height>230||!['male','female','average'].includes(p.equation)||![1.2,1.375,1.55,1.725].includes(p.activity)||!['gain','lose','maintain','recomp'].includes(p.goal)){
    toast('Please check your profile information');return;
  }
  store.profile=p;persist();showPlan(calculatePlan(p));toast('Profile saved. Review the suggestions before applying.');
  $('profile-results').scrollIntoView({behavior:'smooth',block:'start'});
}
function applyProfilePlan(){
  if(!suggestedPlan)return;
  if(!confirm('Replace your current daily calorie and macro targets with this estimate? Your saved meals will not be changed.'))return;
  const {cal,protein,carbs,fat}=suggestedPlan;
  store.goals={cal,protein,carbs,fat};persist();renderToday();loadSettings();toast('Suggested targets applied');goPage('today');
}
function renderWater(){
  const logs=Array.isArray(store.water)?store.water:[];
  const total=logs.filter(x=>x.date===selectedDate).reduce((v,x)=>v+num(x.ml),0);
  const goal=Number(store.waterGoal)||2500;
  $('water-total').textContent=total>=1000?fmtG(total/1000)+' L':fmt(total)+' ml';
  $('water-goal-label').textContent=`of ${fmt(goal)} ml`;
  $('water-bar').style.width=Math.min(100,100*total/goal)+'%';
  $('water-undo').disabled=!logs.some(x=>x.date===selectedDate);
}
function addWater(ml){
  if(!Number.isFinite(ml)||ml<1||ml>5000){toast('Enter a valid amount, up to 5,000ml at a time');return;}
  store.water.push({id:crypto.randomUUID(),date:selectedDate,ml});persist();renderWater();toast(`${fmt(ml)}ml water added`);
}
function undoWater(){
  for(let i=store.water.length-1;i>=0;i--){if(store.water[i].date===selectedDate){store.water.splice(i,1);persist();renderWater();toast('Last water entry removed');return;}}
}
function saveWaterGoal(){
  const goal=Number($('settings-water-goal').value);
  if(!Number.isFinite(goal)||goal<250||goal>10000){toast('Choose a water goal from 250 to 10,000ml');return;}
  store.waterGoal=goal;persist();renderWater();toast('Water goal saved');
}

function loadSettings(){for(const [k,v] of Object.entries(store.goals))$('target-'+k).value=v;$('ai-pin').value=localStorage.getItem(PIN_KEY)||'';$('settings-water-goal').value=store.waterGoal||2500;}
function saveGoals(e){e.preventDefault();const next={};for(const k of ['cal','protein','carbs','fat']){const value=Number($('target-'+k).value);if(!Number.isFinite(value)||value<(k==='cal'?500:0)||value>10000){toast('Enter valid targets');return;}next[k]=value;}store.goals=next;persist();renderToday();toast('Daily goals saved');}
function exportBackup(){const data=JSON.stringify({...store,exportedAt:new Date().toISOString()},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='fuelnote-backup-'+todayKey()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Backup downloaded');}
async function importBackup(file){if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.entries)||!data.goals||!Array.isArray(data.custom||[]))throw Error('Invalid Fuelnote backup');if(!confirm('Replace the current diary and goals with this backup?'))return;store={goals:{...DEFAULT.goals,...data.goals},entries:data.entries.filter(e=>e.id&&e.name&&e.date),custom:data.custom||[],favorites:Array.isArray(data.favorites)?data.favorites:[],profile:data.profile||null,water:Array.isArray(data.water)?data.water:[],waterGoal:Number(data.waterGoal)>0?Number(data.waterGoal):2500};persist();loadSettings();renderToday();toast('Backup imported');}catch(e){toast(e.message||'Import failed')}}
function attachEvents(){
 document.addEventListener('click',e=>{const nav=e.target.closest('[data-go]');if(nav){goPage(nav.dataset.go);return;}const fav=e.target.closest('[data-favorite-index]');if(fav){const food=latestFoods[Number(fav.dataset.favoriteIndex)];if(food)toggleFavourite(food);return;}const result=e.target.closest('[data-food-index]');if(result){openFood(latestFoods[Number(result.dataset.foodIndex)]);return;}const deleteBtn=e.target.closest('[data-delete]');if(deleteBtn){const entry=store.entries.find(x=>x.id===deleteBtn.dataset.delete);if(entry&&confirm(`Remove ${entry.name} from the diary?`)){store.entries=store.entries.filter(x=>x.id!==entry.id);persist();renderToday();toast('Food removed')}return;}const review=e.target.closest('[data-ai-item]');if(review){const index=Number(review.dataset.aiItem);const x=aiItems[index];if(x){reviewAiIndex=index;const f=aiFood(x);openFood(f);$('log-unit').value='g';$('log-qty').value=num(x.grams);updateFoodPreview();}return;}const toEdit=e.target.closest('[data-edit]');if(toEdit){const entry=store.entries.find(x=>x.id===toEdit.dataset.edit);if(entry)openFood(entry,entry);return;}if(e.target.id==='ai-add-all'){addAllAi();}});
 // Header hamburger menu — preserve working navigation.
 const menuButton = $('settings-shortcut');
 const headerMenu = $('header-menu');
 if (menuButton && headerMenu) {
   const closeHeaderMenu = () => {
     headerMenu.hidden = true;
     menuButton.setAttribute('aria-expanded', 'false');
   };
   menuButton.addEventListener('click', () => {
     const opening = headerMenu.hidden;
     headerMenu.hidden = !opening;
     menuButton.setAttribute('aria-expanded', String(opening));
   });
   headerMenu.addEventListener('click', e => {
     if (e.target.closest('[data-go]')) closeHeaderMenu();
   });
   document.addEventListener('click', e => {
     if (!e.target.closest('.header-menu-wrap')) closeHeaderMenu();
   });
   document.addEventListener('keydown', e => {
     if (e.key === 'Escape') closeHeaderMenu();
   });
 } else if (menuButton) {
   menuButton.addEventListener('click', () => goPage('settings'));
 }
 $('date-prev').addEventListener('click',()=>{selectedDate=shiftDate(selectedDate,-1);renderToday()});
 $('date-next').addEventListener('click',()=>{selectedDate=shiftDate(selectedDate,1);renderToday()});
 $('food-query').addEventListener('input',e=>{const q=e.target.value;querySeq++;remoteFoods=[];renderSearch(q);clearTimeout(searchTimer);if(q.trim().length>=3)searchTimer=setTimeout(()=>remoteSearch(q.trim()),650)});
 ['quick-chips','quick-access'].forEach(id=>$(id).addEventListener('click',e=>{const btn=e.target.closest('[data-category]');if(!btn)return;activeFoodFilter=btn.dataset.category;$('food-query').value='';remoteFoods=[];querySeq++;clearTimeout(searchTimer);renderSearch('')}));
 $('create-custom').addEventListener('click',openCustom);
 $('modal-close').addEventListener('click',closeSheet);
 $('modal-backdrop').addEventListener('click',e=>{if(e.target===$('modal-backdrop'))closeSheet()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal-backdrop').hidden)closeSheet()});
 $('barcode-form').addEventListener('submit',e=>{e.preventDefault();lookupBarcode($('barcode-input').value)});
 $('start-scanner').addEventListener('click',startScanner);
 $('stop-scanner').addEventListener('click',stopScanner);
 $('barcode-file').addEventListener('change',e=>{scanFile(e.target.files?.[0]);e.target.value=''});
 $('camera-input').addEventListener('change',e=>{selectPhoto(e.target.files?.[0]);e.target.value=''});
 $('library-input').addEventListener('change',e=>{selectPhoto(e.target.files?.[0]);e.target.value=''});
 $('photo-analyze').addEventListener('click',analyzePhoto);
 $('photo-manual').addEventListener('click',()=>{if(!photoThumb){toast('Choose a photo first, or search for your food');}goPage('search')});
 $('settings-form').addEventListener('submit',saveGoals);
 $('profile-form').addEventListener('submit',submitProfile);
 $('apply-plan').addEventListener('click',applyProfilePlan);
 $('save-water-goal').addEventListener('click',saveWaterGoal);
 $('edit-water-goal').addEventListener('click',()=>goPage('settings'));
 document.querySelectorAll('[data-water]').forEach(b=>b.addEventListener('click',()=>addWater(Number(b.dataset.water))));
 $('water-custom').addEventListener('click',()=>{const ml=Number(prompt('How many millilitres of water did you drink?','300'));if(ml>0)addWater(ml);});
 $('water-undo').addEventListener('click',undoWater);
 $('save-pin').addEventListener('click',()=>{localStorage.setItem(PIN_KEY,$('ai-pin').value);toast('Access PIN saved on this device')});
 $('export-data').addEventListener('click',exportBackup);
 $('import-data').addEventListener('change',e=>{importBackup(e.target.files?.[0]);e.target.value=''});
 $('clear-data').addEventListener('click',()=>{if(confirm('Delete EVERY food diary entry on this device? This cannot be undone without a backup.')){store.entries=[];persist();renderToday();toast('Diary entries cleared')}});
}
attachEvents();renderToday();renderSearch();if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
