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
const DEFAULT = {goals:{cal:2400,protein:150,carbs:270,fat:80}, entries:[],custom:[]};
let store = loadStore();
let selectedDate = todayKey();
let currentPage = 'today';
let currentFood = null;
let editingEntryId = null;
let latestFoods = [];
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

function loadStore(){try{const data=JSON.parse(localStorage.getItem(KEY));if(data&&Array.isArray(data.entries)&&data.goals)return {...DEFAULT,...data,goals:{...DEFAULT.goals,...data.goals},custom:Array.isArray(data.custom)?data.custom:[]};}catch{}return structuredClone(DEFAULT)}
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
function foodIcon(food){const s=(food.category||'').toLowerCase();return s.includes('protein')?'♧':s.includes('fruit')?'◒':s.includes('dairy')?'◈':s.includes('grain')?'≋':s.includes('vegetable')?'✿':s.includes('fats')?'◉':'✳'}
function goPage(page){if(!['today','search','scan','photo','settings'].includes(page))return;if(currentPage==='scan'&&page!=='scan')stopScanner();currentPage=page;document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id==='page-'+page));document.querySelectorAll('.nav-item').forEach(e=>e.classList.toggle('active',e.dataset.go===page));window.scrollTo({top:0,behavior:'instant'});if(page==='today')renderToday();if(page==='search')renderSearch($('food-query').value);if(page==='settings')loadSettings();}
function recalcFor(food,grams){const factor=grams/100;return {kcal:num(food.kcal)*factor,protein:num(food.protein)*factor,carbs:num(food.carbs)*factor,fat:num(food.fat)*factor}}
function entryNutrients(entry){return recalcFor(entry,entry.grams)}
function renderToday(){
  const today=store.entries.filter(e=>e.date===selectedDate);
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
  const html=MEALS.map(meal=>{const entries=today.filter(e=>e.meal===meal);if(!entries.length)return '';const kcal=entries.reduce((s,e)=>s+entryNutrients(e).kcal,0);return `<section class="meal-section"><div class="meal-header"><span>${meal}</span><span>${fmt(kcal)} kcal</span></div>${entries.map(e=>`<div class="food-entry" data-edit="${esc(e.id)}"><div class="entry-thumb">${e.photo?`<img class="entry-image" alt="" src="${esc(e.photo)}">`:`<span class="entry-placeholder">${foodIcon(e)}</span>`}</div><div class="entry-main"><b>${esc(e.name)}</b><span>${fmtG(e.grams)}g · ${fmtG(entryNutrients(e).protein)}g protein</span></div><div class="entry-kcal"><b>${fmt(entryNutrients(e).kcal)}</b><small>kcal</small></div><button class="delete-entry" type="button" aria-label="Remove ${esc(e.name)}" data-delete="${esc(e.id)}">×</button></div>`).join('')}</section>`}).join('');
  $('diary').innerHTML=html||`<div class="empty-diary"><div class="empty-glyph">♧</div><b>A fresh start</b><p>No food logged for this day yet. Start with a meal, snack or your post-workout protein.</p><button type="button" data-go="search">＋ Log your first food</button></div>`;
}
function renderSearch(q=''){
 const query=q.trim().toLowerCase();const tokens=query.split(/\s+/).filter(Boolean);
 let local=[...store.custom,...STARTER_FOODS].filter(f=>tokens.every(t=>(f.name+' '+(f.tags||'')).toLowerCase().includes(t)));
 if(!query)local=local.slice(0,14);
 const candidates=local.concat(query?remoteFoods:[]);const seen=new Set();latestFoods=candidates.filter(f=>{const k=f.name.toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).slice(0,35);
 $('results-title').textContent=query?'Food matches':'Everyday foods';$('results-count').textContent=`${latestFoods.length} items · per 100g`;
 $('search-results').innerHTML=latestFoods.map((f,i)=>`<button class="food-result" data-food-index="${i}" type="button"><span class="food-result-icon">${foodIcon(f)}</span><span class="food-result-name"><b>${esc(f.name)}</b><small>${esc(f.source||f.category||'Food')} · P ${fmtG(f.protein)}g · C ${fmtG(f.carbs)}g · F ${fmtG(f.fat)}g</small></span><span class="food-result-cal"><strong>${fmt(f.kcal)}</strong><small>kcal / 100g</small></span></button>`).join('')||'<div class="subtle-empty">No foods found. Try another search or create a custom food.</div>';
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
function openFood(food,entry=null){currentFood=food;editingEntryId=entry?.id||null;const grams=entry?.grams||100;const meal=entry?.meal||autoMeal();openSheet(entry?'Edit food':'Log food',`<div class="source-label">${esc(food.name)}<br>${esc(food.source||'Custom')} · nutrient values per 100 grams</div><label class="block-label">How much did you eat? (grams)<input id="log-grams" inputmode="decimal" type="number" min="1" step="1" max="10000" value="${grams}" required></label><label class="block-label">Add to meal<select id="log-meal">${MEALS.map(m=>`<option value="${m}" ${m===meal?'selected':''}>${m}</option>`).join('')}</select></label><div class="sheet-summary"><div><b id="preview-kcal">0</b><small>kcal</small></div><div><b id="preview-protein">0g</b><small>protein</small></div><div><b id="preview-carbs">0g</b><small>carbs</small></div><div><b id="preview-fat">0g</b><small>fat</small></div></div><button type="button" id="confirm-food" class="btn-primary">${entry?'Save changes':'＋ Add to my diary'}</button>`);$('log-grams').addEventListener('input',updateFoodPreview);$('confirm-food').addEventListener('click',confirmFood);updateFoodPreview();}
function updateFoodPreview(){if(!currentFood)return;const n=recalcFor(currentFood,Math.max(0,num($('log-grams')?.value)));for(const [id,key] of [['preview-kcal','kcal'],['preview-protein','protein'],['preview-carbs','carbs'],['preview-fat','fat']])$(id).textContent=fmtG(n[key])+(key==='kcal'?'':'g');}
function autoMeal(){const h=new Date().getHours();return h<11?'Breakfast':h<15?'Lunch':h<21?'Dinner':'Snacks'}
function confirmFood(){const grams=Number($('log-grams').value);if(!Number.isFinite(grams)||grams<=0||grams>10000){toast('Enter a valid weight in grams');return;}const meal=$('log-meal').value;if(!MEALS.includes(meal))return;
 if(editingEntryId){const entry=store.entries.find(e=>e.id===editingEntryId);if(entry){entry.grams=grams;entry.meal=meal;persist();renderToday();toast('Food updated')}}else{saveEntry({id:crypto.randomUUID(),date:selectedDate,meal,grams,name:currentFood.name,kcal:currentFood.kcal,protein:currentFood.protein,carbs:currentFood.carbs,fat:currentFood.fat,category:currentFood.category||'',source:currentFood.source||'',photo:photoThumb||null});if(reviewAiIndex!==null){aiItems.splice(reviewAiIndex,1);reviewAiIndex=null;closeSheet();if(aiItems.length){renderAiResults(aiNotes);showStatus('photo-status','Item saved. Review the remaining foods or add them all.');goPage('photo');return;}photoThumb=null;photoData=null;resetPhoto();goPage('today');return;}if(photoThumb){photoThumb=null;photoData=null;resetPhoto();}}closeSheet();goPage('today');}
function openCustom(){openSheet('Create custom food',`<p class="source-label">Enter values from a nutrition label. All nutrients should be entered per 100 grams.</p><label class="block-label">Food name<input id="custom-name" placeholder="e.g. Homemade protein pancakes" maxlength="100" required></label><div class="field-row"><label class="block-label">Calories / 100g<input id="custom-kcal" type="number" min="0" max="1000" step="0.1" placeholder="0"></label><label class="block-label">Protein / 100g<input id="custom-protein" type="number" min="0" max="100" step="0.1" placeholder="0"></label></div><div class="field-row"><label class="block-label">Carbs / 100g<input id="custom-carbs" type="number" min="0" max="100" step="0.1" placeholder="0"></label><label class="block-label">Fat / 100g<input id="custom-fat" type="number" min="0" max="100" step="0.1" placeholder="0"></label></div><button type="button" id="custom-save" class="btn-primary">Save & log food</button>`);$('custom-save').addEventListener('click',()=>{const name=$('custom-name').value.trim();const vals=['kcal','protein','carbs','fat'].map(k=>Number($('custom-'+k).value));if(!name||vals.some(v=>!Number.isFinite(v)||v<0)||vals[0]>1000||vals.slice(1).some(v=>v>100)){toast('Fill in a name and valid nutrition values');return;}const f={id:'custom-'+crypto.randomUUID(),name,category:'Custom',source:'Your custom food',kcal:vals[0],protein:vals[1],carbs:vals[2],fat:vals[3]};store.custom.unshift(f);persist();closeSheet();openFood(f);});}
async function lookupBarcode(code){const clean=String(code).trim().replace(/\D/g,'');if(clean.length<6||clean.length>14){showStatus('scan-status','Barcode should be 6–14 digits.',true);return;}showStatus('scan-status','Looking up barcode '+clean+'...');
 try{const data=await requestFood('barcode',clean);const product=(data.foods||[])[0];if(!product){showStatus('scan-status','Product not found or no nutritional values available. Try searching by name or add a custom food.',true);return;}showStatus('scan-status','Found: '+product.name);openFood(product);}catch(e){showStatus('scan-status','Barcode lookup failed. Check your internet connection or enter the food manually.',true)}}
function showStatus(id,msg,error=false){$(id).textContent=msg;$(id).classList.toggle('error',error)}
function loadScript(url){return new Promise((resolve,reject)=>{if(window.Html5Qrcode){resolve();return;}const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(new Error('Scanner library unavailable'));document.head.appendChild(s);});}
async function startScanner(){if(scanWorking||scanner)return;scanWorking=true;$('start-scanner').disabled=true;showStatus('scan-status','Loading camera scanner...');
 try{await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');scanner=new window.Html5Qrcode('reader',{formatsToSupport:[window.Html5QrcodeSupportedFormats.EAN_13,window.Html5QrcodeSupportedFormats.EAN_8,window.Html5QrcodeSupportedFormats.UPC_A,window.Html5QrcodeSupportedFormats.UPC_E,window.Html5QrcodeSupportedFormats.CODE_128],verbose:false});await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:235,height:135}},async result=>{if(!scanner)return;await stopScanner();await lookupBarcode(result);},()=>{});$('scan-placeholder').hidden=true;$('stop-scanner').hidden=false;showStatus('scan-status','Hold the barcode steady inside the frame.');}catch(e){showStatus('scan-status','Could not start camera. Allow camera permission in Safari, or enter a barcode manually. '+(e.message||''),true);await stopScanner();}finally{scanWorking=false;$('start-scanner').disabled=false;}}
async function stopScanner(){if(scanner){const active=scanner;scanner=null;try{if(active.isScanning)await active.stop();await active.clear();}catch{}}$('reader').innerHTML='';$('scan-placeholder').hidden=false;$('stop-scanner').hidden=true;}
async function scanFile(file){if(!file)return;showStatus('scan-status','Reading barcode image...');let imageScanner=null;try{await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');await stopScanner();imageScanner=new window.Html5Qrcode('reader');const code=await imageScanner.scanFile(file,true);await lookupBarcode(code);}catch(e){showStatus('scan-status','Could not read barcode from that image. Try a sharper photo or enter the digits below.',true)}finally{if(imageScanner){try{await imageScanner.clear()}catch{}}}}
function imageAsData(file,maxDim,quality){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/')){reject(new Error('Select an image file'));return;}const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{try{const ratio=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*ratio));c.height=Math.max(1,Math.round(img.naturalHeight*ratio));c.getContext('2d',{alpha:false}).drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',quality));}catch(e){reject(e)}finally{URL.revokeObjectURL(url)}};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Unable to open image'))};img.src=url;});}
async function selectPhoto(file){if(!file)return;try{photoData=await imageAsData(file,1024,.74);photoThumb=await imageAsData(file,200,.5);$('photo-preview').src=photoData;$('photo-preview').hidden=false;$('photo-empty').hidden=true;$('photo-analyze').disabled=false;aiItems=[];aiNotes='';reviewAiIndex=null;$('photo-results').innerHTML='';showStatus('photo-status','Picture ready. Analyze with AI or log foods manually.');}catch(e){showStatus('photo-status',e.message,true)}}
function resetPhoto(){$('photo-preview').removeAttribute('src');$('photo-preview').hidden=true;$('photo-empty').hidden=false;$('photo-analyze').disabled=true;$('photo-results').innerHTML='';showStatus('photo-status','');}
async function analyzePhoto(){if(!photoData)return;const button=$('photo-analyze');button.disabled=true;button.textContent='Estimating your meal…';showStatus('photo-status','AI is checking visible foods and estimating their portions.');
 try{const headers={'content-type':'application/json'};const pin=localStorage.getItem(PIN_KEY)||'';if(pin)headers['x-app-pin']=pin;const res=await fetch('/api/analyze',{method:'POST',headers,body:JSON.stringify({image:photoData})});let data={};try{data=await res.json()}catch{}if(!res.ok)throw Error(data.error||'AI photo service not configured on this deployment.');if(!Array.isArray(data.items)||!data.items.length)throw Error('No food detected. Try a clearer photo or use manual logging.');aiItems=data.items.filter(x=>x.name&&num(x.grams)>0).slice(0,8);if(!aiItems.length)throw Error('No identifiable food was found.');aiNotes=data.notes||'';showStatus('photo-status','Review the estimates before saving.');renderAiResults(aiNotes);}catch(e){showStatus('photo-status',e.message||'Unable to analyze photo. Manual tracking is still available.',true);}finally{button.disabled=!photoData;button.textContent='✦ Estimate calories with AI';}}
function renderAiResults(notes){const sum=aiItems.reduce((s,x)=>s+num(x.kcal),0);$('photo-results').innerHTML=`<div class="ai-total"><b>≈ ${fmt(sum)} kcal</b><small>AI estimate • review portions before logging</small></div>${aiItems.map((x,i)=>`<div class="ai-item"><div><strong>${esc(x.name)}</strong><small>~${fmt(x.grams)}g · ${fmt(x.kcal)} kcal · P ${fmtG(x.protein)}g / C ${fmtG(x.carbs)}g / F ${fmtG(x.fat)}g</small></div><button type="button" data-ai-item="${i}">Review</button></div>`).join('')}<p class="helper-note">${esc(notes)}</p><button type="button" id="ai-add-all" class="btn-primary full-button">＋ Add all estimated foods</button>`;}
function aiFood(x){const grams=Math.max(1,num(x.grams));return {id:'ai-'+crypto.randomUUID(),name:x.name,category:'AI estimate',source:'AI photo estimate · verify portions',kcal:num(x.kcal)*100/grams,protein:num(x.protein)*100/grams,carbs:num(x.carbs)*100/grams,fat:num(x.fat)*100/grams};}
function addAllAi(){if(!aiItems.length)return;const meal=autoMeal();aiItems.forEach((x,i)=>{const f=aiFood(x);store.entries.push({...f,id:crypto.randomUUID(),date:selectedDate,meal,grams:Math.max(1,num(x.grams)),photo:i===0?photoThumb:null});});persist();toast(`${aiItems.length} items added to your diary`);aiItems=[];aiNotes='';reviewAiIndex=null;photoData=null;photoThumb=null;resetPhoto();goPage('today');}
function loadSettings(){for(const [k,v] of Object.entries(store.goals))$('target-'+k).value=v;$('ai-pin').value=localStorage.getItem(PIN_KEY)||'';}
function saveGoals(e){e.preventDefault();const next={};for(const k of ['cal','protein','carbs','fat']){const value=Number($('target-'+k).value);if(!Number.isFinite(value)||value<(k==='cal'?500:0)||value>10000){toast('Enter valid targets');return;}next[k]=value;}store.goals=next;persist();renderToday();toast('Daily goals saved');}
function exportBackup(){const data=JSON.stringify({...store,exportedAt:new Date().toISOString()},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='fuelnote-backup-'+todayKey()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Backup downloaded');}
async function importBackup(file){if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.entries)||!data.goals||!Array.isArray(data.custom||[]))throw Error('Invalid Fuelnote backup');if(!confirm('Replace the current diary and goals with this backup?'))return;store={goals:{...DEFAULT.goals,...data.goals},entries:data.entries.filter(e=>e.id&&e.name&&e.date),custom:data.custom||[]};persist();loadSettings();renderToday();toast('Backup imported');}catch(e){toast(e.message||'Import failed')}}
function attachEvents(){
 document.addEventListener('click',e=>{const nav=e.target.closest('[data-go]');if(nav){goPage(nav.dataset.go);return;}const result=e.target.closest('[data-food-index]');if(result){openFood(latestFoods[Number(result.dataset.foodIndex)]);return;}const deleteBtn=e.target.closest('[data-delete]');if(deleteBtn){const entry=store.entries.find(x=>x.id===deleteBtn.dataset.delete);if(entry&&confirm(`Remove ${entry.name} from the diary?`)){store.entries=store.entries.filter(x=>x.id!==entry.id);persist();renderToday();toast('Food removed')}return;}const review=e.target.closest('[data-ai-item]');if(review){const index=Number(review.dataset.aiItem);const x=aiItems[index];if(x){reviewAiIndex=index;const f=aiFood(x);openFood(f);$('log-grams').value=num(x.grams);updateFoodPreview();}return;}const toEdit=e.target.closest('[data-edit]');if(toEdit){const entry=store.entries.find(x=>x.id===toEdit.dataset.edit);if(entry)openFood(entry,entry);return;}if(e.target.id==='ai-add-all'){addAllAi();}});
 $('settings-shortcut').addEventListener('click',()=>goPage('settings'));
 $('date-prev').addEventListener('click',()=>{selectedDate=shiftDate(selectedDate,-1);renderToday()});
 $('date-next').addEventListener('click',()=>{selectedDate=shiftDate(selectedDate,1);renderToday()});
 $('food-query').addEventListener('input',e=>{const q=e.target.value;querySeq++;remoteFoods=[];renderSearch(q);clearTimeout(searchTimer);if(q.trim().length>=3)searchTimer=setTimeout(()=>remoteSearch(q.trim()),650)});
 $('quick-chips').addEventListener('click',e=>{const btn=e.target.closest('[data-search]');if(!btn)return;$('food-query').value=btn.dataset.search;remoteFoods=[];querySeq++;renderSearch(btn.dataset.search);clearTimeout(searchTimer);searchTimer=setTimeout(()=>remoteSearch(btn.dataset.search),400)});
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
 $('save-pin').addEventListener('click',()=>{localStorage.setItem(PIN_KEY,$('ai-pin').value);toast('Access PIN saved on this device')});
 $('export-data').addEventListener('click',exportBackup);
 $('import-data').addEventListener('change',e=>{importBackup(e.target.files?.[0]);e.target.value=''});
 $('clear-data').addEventListener('click',()=>{if(confirm('Delete EVERY food diary entry on this device? This cannot be undone without a backup.')){store.entries=[];persist();renderToday();toast('Diary entries cleared')}});
}
attachEvents();renderToday();renderSearch();if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
