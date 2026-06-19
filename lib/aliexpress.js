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

// ===== שלב 1: Blacklist =====
const BLACKLIST_WORDS = [
  'poster','canvas','nordic','organizer','storage','sticker','decal',
  'wholesale','lot of','bundle','curtain','tablecloth','rug','carpet',
  'wallpaper','frame only','case for','cable','charger cable','screen protector',
]

function hasBlacklistedWord(title) {
  const lower = title.toLowerCase()
  return BLACKLIST_WORDS.some(w => lower.includes(w))
}

// ===== שלב 2: Duplicate Detection - דמיון טקסטואלי (Jaccard על מילים) =====
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

// ===== שלב 4: Heuristic scoring - מילים חיוביות =====
const POSITIVE_WORDS = ['funny','gift','gag','novelty','unique','weird','cute','creative']

function heuristicScore(title) {
  const lower = title.toLowerCase()
  return POSITIVE_WORDS.reduce((score, w) => score + (lower.includes(w) ? 1 : 0), 0)
}

// ===== ויזואליה: ספירת תמונות נוספות =====
function countImages(p) {
  // small_images יכול להיות string מופרד בפסיקים, מערך, או אובייקט עם string[]
  const raw = p.product_small_image_urls?.string || p.product_small_image_urls || p.small_images
  if (!raw) return 1
  if (Array.isArray(raw)) return raw.length
  if (typeof raw === 'string') return raw.split(';').filter(Boolean).length
  return 1
}

// ===== הפונקציה הראשית - מקבלת מוצרים גולמיים, מחזירה רשימה נקייה =====
export function filterProducts(rawProducts, existingTitles = []) {
  const seenInBatch = []
  const clean = []

  // קודם מסננים ומדרגים heuristic, אז ממיינים כך שהכי "מעניינים" יישמרו קודם בזמן dedup
  const scored = rawProducts
    .map(p => ({ p, score: heuristicScore(p.product_title || '') }))
    .sort((a, b) => b.score - a.score)

  for (const { p } of scored) {
    const title = p.product_title || ''
    const price = parseFloat(p.target_sale_price || p.sale_price || 0)
    const rate = parseFloat(p.evaluate_rate) || 0
    const vol = parseInt(p.lastest_volume) || 0
    const imgCount = countImages(p)

    if (title.length < 20 || title.length > 130) continue
    if (hasBlacklistedWord(title)) continue
    if (/\d+\s*\/\s*\d+\s*\/\s*\d+|\d+\s*(pcs|pzs|units|pieces?)\b/i.test(title)) continue
    if (price > 0 && (price < 6 || price > 45)) continue
    if (rate < 80 || vol < 50) continue
    if (imgCount < 3) continue // מוצר "מושקע" - יותר מתמונת קטלוג בודדת
    if (isDuplicate(title, existingTitles)) continue
    if (isDuplicate(title, seenInBatch)) continue

    seenInBatch.push(title)
    clean.push(p)
  }

  return clean
}

export async function queryAPI(keywords, page=1, existingTitles=[]) {
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
    min_sale_price: '6',
    max_sale_price: '45',
    fields: 'product_id,product_title,product_main_image_url,product_small_image_urls,product_video_url,evaluate_rate,lastest_volume,promotion_link,product_detail_url,second_level_category_name,target_sale_price,sale_price',
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

  const rawProducts = resp?.result?.products?.product || []
  const clean = filterProducts(rawProducts, existingTitles)

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
