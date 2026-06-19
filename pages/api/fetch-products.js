import { queryAPI, CATEGORIES } from '../../lib/aliexpress'
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['authorization']?.replace('Bearer ','')
  if (secret !== (process.env.CRON_SECRET || 'matanot_secret_2026')) return res.status(401).json({error:'Unauthorized'})

  // טען כותרות קיימות מה-DB כדי למנוע כפילויות גם מול מוצרים שכבר נשמרו בעבר
  const { data: existing } = await supabase.from('products').select('title_en')
  const existingTitles = new Set((existing || []).map(p => p.title_en))

  const all = []
  const seenIds = new Set()
  const seenTitles = new Set()
  const log = {}

  for (const [cat, kws] of Object.entries(CATEGORIES)) {
    log[cat] = []
    for (const kw of kws) {
      try {
        const products = await queryAPI(kw, 1)
        let added = 0, skippedDup = 0
        for (const p of products) {
          if (seenIds.has(p.id)) { skippedDup++; continue }
          // דלג אם כבר ראינו את אותה כותרת בריצה הזו (כפילות וריאציה)
          if (seenTitles.has(p.title_en)) { skippedDup++; continue }
          // דלג אם הכותרת כבר קיימת ב-DB (מוצר שכבר נמשך בעבר תחת ID אחר)
          if (existingTitles.has(p.title_en)) { skippedDup++; continue }

          seenIds.add(p.id)
          seenTitles.add(p.title_en)
          all.push({...p, cat_tag: cat, active: true, created_at: new Date().toISOString(), last_checked: new Date().toISOString()})
          added++
        }
        log[cat].push({kw, found: products.length, added, skippedDup})
        await new Promise(r => setTimeout(r, 300))
      } catch(e) { log[cat].push({kw, error: e.message}) }
    }
  }

  if (!all.length) return res.status(200).json({success: false, message: 'לא נמצאו מוצרים חדשים', log})

  const { error } = await supabase.from('products').upsert(all, {onConflict: 'id'})
  if (error) return res.status(500).json({error: error.message})

  return res.status(200).json({success: true, count: all.length, log})
}
