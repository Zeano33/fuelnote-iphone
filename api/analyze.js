/** Vercel function for optional photo estimates. Never send the OpenAI key to the browser. */
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI is not configured yet. Your app owner must add OPENAI_API_KEY to the hosting environment. You can still attach photos and log food manually.'});
  if(!process.env.APP_ACCESS_PIN)return res.status(503).json({error:'Set APP_ACCESS_PIN in your hosting environment to protect your photo-analysis credits.'});
  if(req.headers['x-app-pin']!==process.env.APP_ACCESS_PIN)return res.status(401).json({error:'Access PIN is missing or incorrect. Enter it in Settings.'});
  const {image}=req.body||{};
  if(typeof image!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>3_800_000)return res.status(400).json({error:'Select a valid meal photo below 3 MB.'});
  const schema={type:'object',additionalProperties:false,properties:{items:{type:'array',items:{type:'object',additionalProperties:false,properties:{name:{type:'string'},grams:{type:'number'},kcal:{type:'number'},protein:{type:'number'},carbs:{type:'number'},fat:{type:'number'}},required:['name','grams','kcal','protein','carbs','fat']}},notes:{type:'string'}},required:['items','notes']};
  try{
    const result=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',store:false,max_output_tokens:900,input:[{role:'user',content:[{type:'input_text',text:'Estimate visible foods and probable edible portion weights in grams and total calories/protein/carbs/fat for EACH food item in this meal photo. Return at most 8 foods. Think carefully about oil, sauces and hidden ingredients: do not invent unseen foods; mention uncertainty in notes. If no food visible, return empty items. Estimates are approximate, not precise measurements; use common nutrition values and give plausible rounded amounts. No extra text outside JSON.'},{type:'input_image',image_url:image,detail:'high'}]}],text:{format:{type:'json_schema',name:'meal_analysis',strict:true,schema}}})});
    const response=await result.json();
    if(!result.ok)return res.status(502).json({error:response.error?.message||'AI provider is unavailable.'});
    const raw=(response.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('');
    const parsed=JSON.parse(raw);
    const items=(parsed.items||[]).filter(x=>x.name&&Number(x.grams)>0).slice(0,8).map(x=>({name:String(x.name).slice(0,120),grams:Math.round(Math.max(1,Math.min(4000,Number(x.grams)))),kcal:Math.round(Math.max(0,Number(x.kcal)||0)),protein:Math.max(0,Number(x.protein)||0),carbs:Math.max(0,Number(x.carbs)||0),fat:Math.max(0,Number(x.fat)||0)}));
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({items,notes:String(parsed.notes||'').slice(0,600)});
  }catch(err){return res.status(502).json({error:'Photo estimate failed. Try again or log the food manually.'});}
}
