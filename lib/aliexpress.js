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

// Keywords ממוקדים - "Creative-Only Mode" לפי בקשת קוסטיה
export const CATEGORIES = {
  wtf:    ['Creative bizarre statue','Novelty weird sculpture','Creative unusual desk art','Novelty strange face ornament','Creative quirky handmade decor'],
  gadget: ['Creative funny gadget','Novelty useless cool gadget','Creative novelty office toy','Novelty weird tech desk gadget','Creative interactive desk toy'],
  funny:  ['Creative hilarious gag gift','Novelty prank funny toy','Creative weird face mug','Novelty absurd costume accessory','Creative joke funny gift'],
  home:   ['Creative unusual lamp','Novelty funky home accessory','Creative weird shape kitchen gadget','Novelty quirky wall art','Creative funny mug'],
}

const CAT_LABELS = { wtf: 'WTF?!', gadget: 'Gadget Mania', funny: 'Funny/Gag', home: 'Home Oddities' }

const DICT = {
  'creative':'יצירתי','novelty':'חידוש','weird':'מוזר','funny':'מצחיק','bizarre':'ביזארי',
  'quirky':'מצחיק','strange':'מוזר','unique':'ייחודי','statue':'פסל','sculpture':'פסלון',
  'desk':'שולחן','art':'אומנות','ornament':'קישוט','handmade':'בעבודת יד','decor':'קישוט',
  'gadget':'גאדג׳ט','useless':'חסר תועלת','cool':'מגניב','office':'משרד','toy':'צעצוע',
  'tech':'טכנולוגיה','interactive':'אינטראקטיבי','hilarious':'מצחיק','gag':'גאג','gift':'מתנה',
  'prank':'פראנק','face':'פנים','mug':'ספל','absurd':'אבסורדי','costume':'תחפושת',
  'accessory':'אביזר','joke':'בדיחה','lamp':'מנורה','funky':'פאנקי','home':'בית',
  'shape':'צורה','kitchen':'מטבח','wall':'קיר',
}

function cleanTitle(title) {
  return title.replace(/\*\*/g, '').replace(/\(\d+\s*characters?\)/gi, '').trim()
}

function translate(title) {
  title = cleanTitle(title)
  const words = title.toLowerCase().replace(/[^\w\s]/g,' ').split(/\s+/)
  const out = []; const used = new Set()
  for (const w of words) {
    if (DICT[w] && !used.has(DICT[w])) { out.push(DICT[w]); used.add(DICT[w]) }
    if (out.length >= 4) break
  }
  return out.length >= 2 ? out.join(' ') : words.slice(0,5).join(' ')
}

// Blacklist מורחב - כולל apparel, craft kits, electronics שימושיים
const BLACKLIST_WORDS = [
  'sticker','poster','canvas','organizer','storage','hook','nordic',
  'minimalist','modern','scandinavian','boho','furniture','kitchenware',
  'tool','replacement','parts','set of','miniature','micro','decal',
  'curtain','tablecloth','rug','carpet','wallpaper','case for','screen protector',
  'anime','jojo','bizarre adventure','cosplay',
  'usb charger','charging station','wall adapter','vanity mirror',
  'phone holder','phone clip','phone mount','speed cube','rubik','gear cube',
  // === הוספות לפי בקשת קוסטיה: פסילה לפי "מדד שימושיות" ===
  'tote bag','shoulder bag','camisole','tank top','t-shirt','tshirt','t shirt',
  'sweater','hoodie','sock','socks','sandal','sneaker','dress','skirt','jeans',
  'diamond painting','cross stitch','embroidery kit','diy kit','mosaic kit',
  'charger','adapter','cable','holder','organizer','case','cleaning',
  // אקססוריז אופנה - לא קישוט/גאג אמיתי גם אם "creative/weird/bizarre" מופיע
  'hair clip','hairpin','hairclip','headband','earring','brooch','lapel pin',
  'enamel pin','ring','necklace','bracelet','jewelry','jewellery',
]

function hasBlacklistedWord(title) {
  const lower = title.toLowerCase()
  return BLACKLIST_WORDS.some(w => lower.includes(w))
}

function isBulkListing(title) {
  const lower = title.toLowerCase()
  if (/\d+\s*(pcs|pzs|units|pieces?)\b/.test(lower)) return true
  if (/\bwholesale\b/.test(lower)) return true
  if (/\bset\b/.test(lower)) return true
  if (/\d+\s*\/\s*\d+\s*\/\s*\d+/.test(lower)) return true
  if (/(\d)\1{4,}/.test(title)) return true // ספרה חוזרת 5+ פעמים = כותרת שבורה/ספאם
  return false
}

// Novelty Score: הכותרת חייבת להכיל לפחות אחת מהמילים האלו
const NOVELTY_WORDS = ['creative','novelty','funny','weird','quirky','strange','bizarre','unique']
function passesNoveltyCheck(title) {
  const lower = title.toLowerCase()
  return NOVELTY_WORDS.some(w => lower.includes(w))
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

function heuristicScore(title) {
  const lower = title.toLowerCase()
  return NOVELTY_WORDS.reduce((score, w) => score + (lower.includes(w) ? 1 : 0), 0)
}

export function filterProducts(rawProducts, existingTitles = []) {
  const seenInBatch = []
  const clean = []
  const scored = rawProducts
    .map(p => ({ p, score: heuristicScore(p.product_title || '') }))
    .sort((a, b) => b.score - a.score)

  let acceptedCount = 0
  const MAX_PER_QUERY = 5

  for (const { p } of scored) {
    const title = cleanTitle(p.product_title || '')
    if (!title) continue
    const vol = parseInt(p.lastest_volume) || 0

    if (vol <= 0) continue
    if (title.length < 15 || title.length > 150) continue
    if (hasBlacklistedWord(title)) continue
    if (isBulkListing(title)) continue
    if (!passesNoveltyCheck(title)) continue // Novelty Score check
    if (isDuplicate(title, existingTitles)) continue
    if (isDuplicate(title, seenInBatch)) continue
    if (acceptedCount >= MAX_PER_QUERY) continue

    seenInBatch.push(title)
    clean.push(p)
    acceptedCount++
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

  if (clean.length === 0 && rawProducts.length > 0) {
    const broadKw = keywords.split(' ').slice(0,2).join(' ')
    if (broadKw !== keywords) {
      const fallbackRaw = await rawQuery(broadKw, page)
      clean = filterProducts(fallbackRaw, existingTitles)
    }
  }

  return clean.map(p => ({
    id: String(p.product_id),
    title: translate(p.product_title),
    title_en: cleanTitle(p.product_title),
    rating: Math.round((parseFloat(p.evaluate_rate)||0)/20*10)/10,
    orders: parseInt(p.lastest_volume)||0,
    image: p.product_main_image_url,
    video_url: p.product_video_url || null,
    affiliate_url: p.promotion_link || p.product_detail_url,
    category: p.second_level_category_name || '',
  }))
}
