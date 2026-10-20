/** Vercel function: server-side Open Food Facts product search and barcode lookup. */
function n(value){const v=Number(value);return Number.isFinite(v)?v:0;}
function formatFood(p){
  if(!p||typeof p!=='object')return null;
  const m=p.nutriments||{};
  const kcal=Number.isFinite(Number(m['energy-kcal_100g']))?Number(m['energy-kcal_100g']):Number.isFinite(Number(m['energy-kj_100g']))?Number(m['energy-kj_100g'])/4.184:NaN;
  const name=[p.product_name,p.brands].filter(Boolean).join(' · ');
  if(!name||!Number.isFinite(kcal)||kcal<=0||kcal>1000)return null;
  return {id:'off-'+(p.code||name),name,category:'Packaged',kcal,protein:n(m.proteins_100g),carbs:n(m.carbohydrates_100g),fat:n(m.fat_100g),source:'Open Food Facts · check label'};
}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const barcode=String(req.query.barcode||'').replace(/\D/g,'');
  const q=String(req.query.q||'').trim();
  if((!barcode&&!q)||(barcode&&(barcode.length<6||barcode.length>14))||q.length>90)return res.status(400).json({error:'Invalid search'});
  const fields='code,product_name,brands,nutriments,quantity';
  const url=barcode?`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`:
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15&fields=${fields}`;
  try{
    const response=await fetch(url,{headers:{'User-Agent':'Fuelnote/1.0 (Personal nutrition tracking PWA)'}});
    if(!response.ok)throw new Error(`Open Food Facts returned ${response.status}`);
    const data=await response.json();
    const products=barcode?(data.status===1?[data.product]:[]):(data.products||[]);
    res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=1200');
    return res.status(200).json({foods:products.map(formatFood).filter(Boolean)});
  }catch(err){return res.status(502).json({error:'Food lookup currently unavailable. Try again.'});}
}
