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

export const CATEGORIES = {
  forhim:  ['resin desk ornament','wood carving figurine','metal keychain unique'],
  forher:  ['ceramic jewelry dish','resin flower decor','crystal night lamp'],
  kids:    ['silicone animal lamp','plush dinosaur doll','wooden puzzle toy'],
  pet:     ['ceramic pet bowl shaped','plush pet costume','pet sunglasses photo'],
  prank:   ['resin fake food prop','silicone trick toy','plastic gag prop'],
  gadget:  ['magnetic floating display','mini desk fountain','LED galaxy projector'],
  home:    ['resin succulent pot','LED moon lamp','novelty night light shaped'],
  party:   ['LED balloon light decor','resin cake topper','party photo prop'],
  cheap:   ['silicone phone holder cute','resin keychain charm','wood coaster set'],
  new:     ['LED cloud lamp room','silicone ice tray shaped','galaxy projector light'],
  funny:   ['resin skull decor','ceramic funny mug shaped','plush food pillow'],
}

const DICT = {
  'funny':'מצחיק','weird':'מוזר','gift':'מתנה','prank':'פראנק','resin':'שרף',
  'desk':'שולחן','ornament':'קישוט','wood':'עץ','carving':'גילוף','figurine':'פסלון',
  'metal':'מתכת','keychain':'מחזיק מפתחות','ceramic':'קרמיקה','jewelry':'תכשיטים',
  'dish':'צלחת','flower':'פרח','decor':'קישוט','crystal':'קריסטל','night':'לילה',
  'lamp':'מנורה','silicone':'סיליקון','animal':'חיה','plush':'קטיפה','dinosaur':'דינוזאור',
  'doll':'בובה','wooden':'עץ','puzzle':'פאזל','toy':'צעצוע','pet':'חיית מחמד',
  'bowl':'קערה','shaped':'בצורת','costume':'תחפושת','fake':'מזויף','food':'אוכל',
  'prop':'אביזר','trick':'תעלול','plastic':'פלסטיק','gag':'גאג','led':'לד',
  'magnetic':'מגנטי','floating':'מרחף','display':'תצוגה','mini':'מיני','fountain':'מזרקה',
  'galaxy':'גלקסיה','projector':'מקרן','succulent':'צמח','pot':'עציץ','moon':'ירח',
  'novelty':'חידוש','balloon':'בלון','light':'אור','cake':'עוגה','topper':'קישוט עליון',
  'photo':'תמונה','phone':'טלפון','holder':'מחזיק','cute':'חמוד','charm':'קמע',
  'coaster':'תחתית','cloud':'ענן','room':'חדר','ice':'קרח','tray':'מגש',
  'skull':'גולגולת','mug':'ספל','pillow':'כרית','unique':'ייחודי','sunglasses':'משקפי שמש',
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

const BLACKLIST_WORDS = [
  'poster','canvas','nordic','organizer','storage','sticker','decal',
  'curtain','tablecloth','rug','carpet','wallpaper','case for',
  'screen protector',
]

function hasBlacklistedWord(title) {
  const lower = title.toLowerCase()
  return BLACKLIST_WORDS.some(w => lower.includes(w))
}

// רק חוסם bulk/wholesale כשהמילה צמודה למספר - לא חוסם כל מספר בכותרת
function isBulkListing(title) {
  const lower = title.toLowerCase()
  if (/\d+\s*(pcs|pzs|units|pieces?)\b/.test(lower)) return true
  if (/\bwholesale\b/.test(lower)) return true
  if (/\d+\s*\/\s*\d+\s*\/\s*\d+/.test(lower)) return true // 10/50/100pcs פורמט
  return false
}

function titleSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const w of setA) if (setB.has(w)) intersection++
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

function isDuplicate(title, existingTitles, threshold = 0.75) {
  for (const existing of existingTitles) {
    if (titleSimilarity(title, existing) >= threshold) return true
  }
  return false
}

const POSITIVE_WORDS = ['funny','gift','gag','novelty','unique','weird','cute','creative']
function heuristicScore(title) {
  const lower = title.toLowerCase()
  return POSITIVE_WORDS.reduce((score, w) => score + (lower.includes(w) ? 1 : 0), 0)
}

// ===== הפונקציה המרכזית - עכשיו חסינה לשדות חסרים =====
export function filterProducts(rawProducts, existingTitles = []) {
  const seenInBatch = []
  const clean = []

  const scored = rawProducts
    .map(p => ({ p, score: heuristicScore(p.product_title || '') }))
    .sort((a, b) => b.score - a.score)

  for (const { p } of scored) {
    const title = p.product_title || ''
    if (!title) continue

    // rate/volume - תמיד קיימים מה-API, סף סביר
    const rate = parseFloat(p.evaluate_rate) || 0
    const vol = parseInt(p.lastest_volume) || 0
    if (rate > 0 && rate < 75) continue // רק חוסם אם יש ערך והוא נמוך
    if (vol < 30) continue

    if (title.length < 15 || title.length > 150) continue
    if (hasBlacklistedWord(title)) continue
    if (isBulkListing(title)) continue
    if (isDuplicate(title, existingTitles)) continue
    if (isDuplicate(title, seenInBatch)) continue

    seenInBatch.push(title)
    clean.push(p)
  }

  return clean
}

async function rawQuery(keywords, page) {
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
  return resp?.result?.products?.product || []
}

export async function queryAPI(keywords, page=1, existingTitles=[]) {
  let rawProducts = await rawQuery(keywords, page)
  let clean = filterProducts(rawProducts, existingTitles)

  // Fallback: אם 0 תוצאות אחרי הסינון, חפש שוב עם מילה בודדת רחבה יותר
  if (clean.length === 0 && rawProducts.length > 0) {
    // נסה רק עם המילה הראשונה (הכי כללית) מהביטוי
    const broadKw = keywords.split(' ')[0]
    if (broadKw !== keywords) {
      const fallbackRaw = await rawQuery(broadKw, page)
      clean = filterProducts(fallbackRaw, existingTitles)
    }
  }

  return clean.map(p => ({
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
