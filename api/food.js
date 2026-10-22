/** Fuelnote SA product lookup v1.3
 * Open Food Facts is community maintained and cannot identify every local product.
 * Results are always from verified barcode matches or named searches — never guessed.
 */
const FIELDS = 'code,product_name,product_name_en,brands,nutriments,quantity,serving_size,countries_tags';
const HEADERS = {'User-Agent': 'Fuelnote/1.3 (https://fuelnote-iphone.vercel.app)'};
function finite(value) {return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : NaN;}
function productName(p) { return [p?.product_name || p?.product_name_en, p?.brands].filter(Boolean).join(' · ').trim(); }
function servingGrams(p) {
  const raw = String(p?.serving_size || '').replace(',', '.').trim();
  const match = raw.match(/(\d+(?:\.\d+)?)\s*(g|grams?)\b/i);
  return match ? Number(match[1]) : NaN;
}
function nutrient(n, name, grams) {
  const per100 = finite(n[name + '_100g']);
  if (Number.isFinite(per100)) return per100;
  const serving = finite(n[name + '_serving']);
  return Number.isFinite(serving) && Number.isFinite(grams) && grams > 0 ? serving * 100 / grams : NaN;
}
function normalizeProduct(p) {
  const n = p?.nutriments || {}, grams = servingGrams(p);
  const name = productName(p);
  let kcal = nutrient(n, 'energy-kcal', grams);
  if (!Number.isFinite(kcal)) {
    const kj = nutrient(n, 'energy-kj', grams);
    kcal = Number.isFinite(kj) ? kj / 4.184 : NaN;
  }
  const protein = nutrient(n, 'proteins', grams);
  const carbs = nutrient(n, 'carbohydrates', grams);
  const fat = nutrient(n, 'fat', grams);
  // Incomplete Open Food Facts records can contain a name but lack macros.
  // Never silently display missing protein, carbs, or fat as zero.
  if (!name || !Number.isFinite(kcal) || kcal <= 0 || kcal > 1000 ||
      [protein,carbs,fat].some(x => !Number.isFinite(x) || x < 0 || x > 100)) return null;
  return { id: 'off-' + (p.code || name), barcode: String(p.code || ''), name,
    category: 'Packaged', kcal: Math.round(kcal * 10) / 10,
    protein: Math.round(protein * 100) / 100,
    carbs: Math.round(carbs * 100) / 100,
    fat: Math.round(fat * 100) / 100,
    source: 'Open Food Facts · compare with package label' };
}
function versions(code) {
  const v = [code];
  if (code.length === 12) v.push('0' + code);
  if (code.length === 13 && code[0] === '0') v.push(code.slice(1));
  if (code.length === 14 && code[0] === '0') v.push(code.slice(1));
  return [...new Set(v)];
}
async function openFacts(url) {
  const response = await fetch(url, {headers: HEADERS, signal: AbortSignal.timeout(9000)});
  if (!response.ok) throw new Error('Open Food Facts request failed: ' + response.status);
  return response.json();
}
function sortSearchProducts(products, q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  function score(p) {
    const name = productName(p).toLowerCase();
    const regions = Array.isArray(p.countries_tags) ? p.countries_tags : [];
    return (regions.includes('en:south-africa') ? 8 : 0)
      + (name.includes(q.toLowerCase()) ? 8 : 0)
      + terms.filter(term => name.includes(term)).length * 3;
  }
  return products.map((p,i) => ({p,i,score:score(p)}))
    .sort((a,b) => b.score-a.score || a.i-b.i).map(x=>x.p);
}
export default async function handler(req,res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const code = String(req.query.barcode || '').replace(/\D/g,'');
  const q = String(req.query.q || '').trim();
  if ((!code && !q) || (code && (code.length < 6 || code.length > 14)) || q.length > 90)
    return res.status(400).json({error:'Invalid product lookup'});
  try {
    if (code) {
      let incomplete = null;
      for (const candidate of versions(code)) {
        const data = await openFacts(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(candidate)}.json?fields=${FIELDS}&cc=za&lc=en`);
        if (data.status !== 1 || !data.product) continue;
        const food = normalizeProduct(data.product);
        if (food) {
          res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
          return res.status(200).json({foods:[food]});
        }
        const name = productName(data.product);
        if (name) incomplete = {name, code, reason:'Nutrition information incomplete'};
      }
      return res.status(200).json({foods:[], incomplete});
    }
    // World-wide search, but favour products explicitly tagged South Africa.
    // Avoid limiting to SA only because many imported products are also sold locally.
    const data = await openFacts(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=35&fields=${FIELDS}`);
    const foods = sortSearchProducts(Array.isArray(data.products) ? data.products : [],q)
      .map(normalizeProduct).filter(Boolean).slice(0,20);
    res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({foods});
  } catch (error) {
    return res.status(502).json({error:'Online product database unavailable. Try again or enter the nutrition label manually.'});
  }
}
