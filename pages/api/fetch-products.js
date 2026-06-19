import { queryAPI, CATEGORIES } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'
export default async function handler(req, res) {
  const secret=req.query.secret||req.headers['authorization']?.replace('Bearer ','')
  if (secret!==(process.env.CRON_SECRET||'matanot_secret_2026')) return res.status(401).json({error:'Unauthorized'})
  const all=[]; const seen=new Set(); const log={}
  for (const [cat,kws] of Object.entries(CATEGORIES)) {
    log[cat]=[]
    for (const kw of kws) {
      try {
        const products=await queryAPI(kw,1)
        log[cat].push({kw,found:products.length})
        for (const p of products) {
          if (seen.has(p.id)) continue
          seen.add(p.id)
          all.push({...p,cat_tag:cat,active:true,created_at:new Date().toISOString(),last_checked:new Date().toISOString()})
        }
        await new Promise(r=>setTimeout(r,300))
      } catch(e) { log[cat].push({kw,error:e.message}) }
    }
  }
  if (!all.length) return res.status(200).json({success:false,message:'לא נמצאו מוצרים',log})
  const {error}=await supabase.from('products').upsert(all,{onConflict:'id'})
  if (error) return res.status(500).json({error:error.message})
  return res.status(200).json({success:true,count:all.length,log})
}
