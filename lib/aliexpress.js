import crypto from 'crypto'

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '515336'
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'KZgmteUFRQXrhcRXwdEqcIwGLDfkSoT3'
const TRACKING_ID = 'default'
const API_URL = 'https://api-sg.aliexpress.com/sync'

function getTimestamp() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const sh = new Date(utc + 8 * 3600000)
  const p = n => String(n).padStart(2,'0')
  return `${sh.getFullYear()}-${p(sh.getMonth()+1)}-${p(sh.getDate())} ${p(sh.getHours())}:${p(sh.getMinutes())}:${p(sh.getSeconds())}`
}

function sign(params) {
  const s = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()
}

// Keywords לפי "צורה/חומר" ולא נושא מופשט - לפי המלצת ג'מיני
export const CATEGORIES = {
  forhim:  ['resin desk ornament','wood carving figurine','metal keychain unique'],
  forher:  ['ceramic jewelry dish','resin flower decor','crystal night lamp'],
  kids:    ['silicone animal lamp','plush dinosaur doll','wooden puzzle toy'],
  pet:     ['ceramic pet bowl shaped','silicone pet mat funny','plush pet costume'],
  prank:   ['resin fake food prop','silicone trick toy','plastic gag prop'],
  gadget:  ['LED neon sign desk','magnetic floating display','mini desk fountain'],
  home:    ['ceramic mug shaped animal','resin succulent pot','LED moon lamp'],
  party:   ['LED balloon light decor','resin cake topper','party photo prop'],
  cheap:   ['silicone phone holder cute','resin keychain charm','wood coaster set'],
  new:     ['LED cloud lamp room','silicone ice tray shaped','resin paperweight art'],
  funny:   ['resin skull decor','ceramic funny mug shaped','plush food pillow'],
}

const DICT = {
  'funny':'מצחיק','weird':'מוזר','gift':'מתנה','prank':'פראנק',
  'resin':'שרף','desk':'שולחן','ornament':'קישוט','wood':'עץ',
  'carving':'גילוף','figurine':'פסלון','metal':'מתכת','keychain':'מחזיק מפתחות',
  'ceramic':'קרמיקה','jewelry':'תכשיטים','dish':'צלחת','flower':'פרח',
  'decor':'קישוט','crystal':'קריסטל','night':'לילה','lamp':'מנורה',
  'silicone':'סיליקון','animal':'חיה','plush':'קטיפה','dinosaur':'דינוזאור',
  'doll':'בובה','wooden':'עץ','puzzle':'פאזל','toy':'צעצוע','pet':'חיית מחמד',
  'bowl':'קערה','shaped':'בצורת','mat':'מחצלת','costume':'תחפושת',
  'fake':'מזויף','food':'אוכל','prop':'אביזר','trick':'תעלול','plastic':'פלסטיק',
  'gag':'גאג','led':'לד','neon':'ניאון','sign':'שלט','magnetic':'מגנטי',
  'floating':'מרחף','display':'תצוגה','mini':'מיני','fountain':'מזרקה',
  'mug':'ספל','succulent':'צמח','pot':'עציץ','moon':'ירח','balloon':'בלון',
  'light':'אור','cake':'עוגה','topper':'קישוט עליון','photo':'תמונה',
  'phone':'טלפון','holder':'מחזיק','cute':'חמוד','charm':'קמע','coaster':'תחתית',
  'cloud':'ענן','room':'חדר','ice':'קרח','tray':'מגש','paperweight':'משקולת נייר',
  'art':'אומנות','skull':'גולגולת','pillow':'כרית','unique':'ייחודי',
}

function translate(title) {
  const words = title.toLowerCase().replace(/[^\w\s]/g,' ').split(/\s+/)
  const out = []; const used = new Set()
  for (const w of words) {
    if (DICT[w] && !used.has(DICT[w])) { out.push(DICT[w]); used.add(DICT[w]) }
    if (out.length >= 4) break
  }
  return out.length >= 2 ? out.join(' ') : words.slice(0,5).join(' ')
}

// Heuristic filters לפי ניתוח ג'מיני
function isQualityProduct(p) {
  const title = p.product_title || ''
  const len = title.length
  const price = parseFloat(p.target_sale_price || p.sale_price || 0)

  // אורך כותרת - לא קצר מדי ולא ארוך מדי (ספאם)
  if (len < 20 || len > 130) return false

  // חסום bulk/wholesale/lot/bundle ומספרים-בכמות בכותרת
  const lower = title.toLowerCase()
  if (/\d+\s*\/\s*\d+\s*\/\s*\d+|\d+\s*(pcs|pzs|units|pieces?)\b/.test(lower)) return false
  if (/wholesale|\blot\b|bundle|sticker|decal/.test(lower)) return false

  // מחיר - מתחת ל$3 כמעט תמיד ספאם זול
  if (price > 0 && price < 3) return false

  return true
}

export async function queryAPI(keywords, page=1) {
  const params = {
    app_key: APP_KEY,
    method: 'aliexpress.affiliate.product.query',
    sign_method: 'md5',
    timestamp: getTimestamp(),
    v: '2.0',
    keywords,
    page_no: String(page),
    page_size: '20',
    sort: 'LAST_VOLUME_DESC',
    tracking_id: TRACKING_ID,
    target_currency: 'ILS',
    target_language: 'EN',
    min_sale_price: '8',
  }
  params.sign = sign(params)
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'},
    body: new URLSearchParams(params).toString(),
  })
  const data = JSON.parse(await r.text())
  const resp = data?.aliexpress_affiliate_product_query_response?.resp_result
  if (!resp || resp.resp_code !== 200) return []

  return (resp?.result?.products?.product || [])
    .filter(p => (parseFloat(p.evaluate_rate)||0) >= 80 && (parseInt(p.lastest_volume)||0) >= 50)
    .filter(isQualityProduct)
    .map(p => ({
      id: String(p.product_id),
      title: translate(p.product_title),
      title_en: p.product_title,
      rating: Math.round((parseFloat(p.evaluate_rate)||0)/20*10)/10,
      orders: parseInt(p.lastest_volume)||0,
      image: p.product_main_image_url,
      video_url: p.product_video_url || null,
      affiliate_url: p.promotion_link || p.product_detail_url,
      category: p.second_level_category_name || '',
    }))
}
