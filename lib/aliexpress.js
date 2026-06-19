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

// 4 קטגוריות בלבד - מגזין מתנות הזויות
export const CATEGORIES = {
  wtf:    ['weird statue figurine','strange oddity sculpture','surreal resin decor'],
  gadget: ['magnetic floating gadget','novelty desk gadget weird','quirky led gadget'],
  funny:  ['funny gag gift prank','novelty joke toy adult','hilarious desk prank'],
  home:   ['surreal home decor art','weird sculpture ornament','funky resin figurine'],
}

const CAT_LABELS = {
  wtf: 'WTF?!', gadget: 'Gadget Mania', funny: 'Funny/Gag', home: 'Home Oddities',
}

const DICT = {
  'funny':'מצחיק','weird':'מוזר','gift':'מתנה','prank':'פראנק','resin':'שרף',
  'desk':'שולחן','ornament':'קישוט','unique':'ייחודי','gadget':'גאדג׳ט',
  'statue':'פסל','figurine':'פסלון','bizarre':'ביזארי','strange':'מוזר',
  'oddity':'תופעה מוזרה','decor':'קישוט','creative':'יצירתי','office':'משרד',
  'magnetic':'מגנטי','floating':'מרחף','desktop':'שולחן עבודה','fountain':'מזרקה',
  'trick':'תעלול','toy':'צעצוע','gag':'גאג','art':'אומנות',
}

function cleanTitle(title) {
  // הסר markdown asterisks ו-meta אורך-תווים שדולפים מתיאורים שנוצרו ע"י AI
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

const BLACKLIST_WORDS = [
  'sticker','poster','canvas','organizer','storage','hook','nordic',
  'minimalist','modern','scandinavian','boho','furniture','kitchenware',
  'tool','replacement','parts','set of','miniature','micro','decal',
]

function hasBlacklistedWord(title) {
  const lower = title.toLowerCase()
  return BLACKLIST_WORDS.some(w => lower.includes(w))
}

function isBulkListing(title) {
  const lower = title.toLowerCase()
  if (/\d+\s*(pcs|pzs|units|pieces?)\b/.test(lower)) return true
  if (/\bwholesale\b/.test(lower)) return true
  if (/\d+\s*\/\s*\d+\s*\/\s*\d+/.test(lower)) return true
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

const POSITIVE_WORDS = ['funny','gift','gag','novelty','unique','weird','creative']
function heuristicScore(title) {
  const lower = title.toLowerCase()
  return POSITIVE_WORDS.reduce((score, w) => score + (lower.includes(w) ? 1 : 0), 0)
}

const MIN_PRICE_ILS = 15

export function filterProducts(rawProducts, existingTitles = []) {
  const seenInBatch = []
  const clean = []
  const scored = rawProducts
    .map(p => ({ p, score: heuristicScore(p.product_title || '') }))
    .sort((a, b) => b.score - a.score)

  let acceptedCount = 0
  const MAX_PER_QUERY = 5

  for (const { p } of scored) {
    const title = p.product_title || ''
    if (!title) continue
    const rate = parseFloat(p.evaluate_rate) || 0
    const vol = parseInt(p.lastest_volume) || 0
    const price = parseFloat(p.target_sale_price || p.sale_price || 0)

    if (vol <= 0) continue
    if (rate > 0 && rate < 75) continue
    if (price > 0 && price < MIN_PRICE_ILS) continue
    if (title.length < 15 || title.length > 150) continue
    if (hasBlacklistedWord(title)) continue
    if (isBulkListing(title)) continue
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
    const broadKw = keywords.split(' ')[0]
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
