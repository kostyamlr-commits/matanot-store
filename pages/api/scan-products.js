import { supabase, deactivateProduct, updateProductPrice } from '../../lib/supabase'

// נקודת קצה לסריקת מחירים - רץ פעמיים ביום
export default async function handler(req, res) {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🔍 סורק מחירים ובודק מוצרים...')

    // שלוף את כל המוצרים הפעילים
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, affiliate_url, price_ils')
      .eq('active', true)
      .limit(50)

    if (error) throw error

    let updated = 0, removed = 0

    for (const product of products) {
      try {
        // בדוק אם הדף קיים
        const res = await fetch(product.affiliate_url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000),
        })

        if (res.status === 404 || res.status === 410) {
          await deactivateProduct(product.id)
          removed++
          console.log(`🗑️ הוסר: ${product.title}`)
        } else {
          // עדכן זמן בדיקה אחרון
          await updateProductPrice(product.id, product.price_ils)
          updated++
        }

        await new Promise(r => setTimeout(r, 300))
      } catch (e) {
        console.warn(`⚠️ לא ניתן לבדוק: ${product.id}`)
      }
    }

    return res.status(200).json({
      success: true,
      checked: products.length,
      updated,
      removed,
    })

  } catch (error) {
    console.error('❌ שגיאה בסריקה:', error)
    return res.status(500).json({ error: error.message })
  }
}
