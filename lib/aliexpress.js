import crypto from 'crypto'

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '515336'
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'KZgmteUFRQXrhcRXwdEqcIwGLDfkSoT3'
const TRACKING_ID = 'default' // hardcoded - Vercel env var override fixed bug
const API_URL = 'https://api-sg.aliexpress.com/sync'

function getTimestamp() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const sh = new Date(utc + 8 * 3600000)
  const p = n => String(n).padStart(2,'0')
  return `${sh.getFullYear()}-${p(sh.getMonth()+1)}-${p(sh.getDate())} ${p(sh.getHours())}:${p(sh.getMinutes())}:${p(sh.getSeconds())}`
}

function sign(params) {
  const s = Object.keys(params).sort().map(k=>`${k}${params[k]}`).join('')
  return crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()
}

export const CATEGORIES = {
  forhim:  ['funny gift men','cool gadget him','novelty men gift'],
  forher:  ['funny gift women','cute novelty her','novelty women gift'],
  kids:    ['funny kids toy','novelty toy kids','weird children toy'],
  pet:     ['funny dog toy','funny cat toy','novelty pet toy'],
  prank:   ['prank joke toy','gag prank gift','funny trick toy'],
  gadget:  ['funny gadget','weird electric gadget','cool tech gadget'],
  home:    ['funny home decor','weird desk gift','novelty kitchen gadget'],
  party:   ['funny birthday gift','party novelty toy','birthday joke gift'],
  cheap:   ['funny cheap toy','cheap novelty gift','budget funny toy'],
  new:     ['trending funny gift','novelty popular toy','weird trending'],
  funny:   ['funny novelty gift','hilarious gag gift','weird funny toy'],
}

const DICT = {
  'funny':'מצחיק','weird':'מוזר','gift':'מתנה','prank':'פראנק','joke':'בדיחה',
  'novelty':'חידוש','gadget':'גאדג׳ט','toy':'צעצוע','hilarious':'מגניב',
  'party':'מסיבה','birthday':'יום הולדת','water':'מים','cat':'חתול',
  'dog':'כלב','cute':'חמוד','cool':'מגניב','kids':'ילדים','cheap':'זול',
  'trending':'טרנדי','men':'גברים','women':'נשים','him':'לו','her':'לה',
  'electric':'חשמלי','magic':'קסם','trick':'תעלול','home':'בית',
}

function translate(title) {
  const words = title.toLowerCase().replace(/[^\w\s]/g,' ').split(/\s+/)
  const out=[]; const used=new Set()
  for (const w of words) {
    if (DICT[w] && !used.has(DICT[w])) { out.push(DICT[w]); used.add(DICT[w]) }
    if (out.length>=4) break
  }
  return out.length>=2 ? out.join(' ') : words.slice(0,5).join(' ')
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
  return (resp?.result?.products?.product || []).map(p => ({
    id: String(p.product_id),
    title: translate(p.product_title),
    title_en: p.product_title,
    rating: Math.round((parseFloat(p.evaluate_rate)||0)/20*10)/10,
    orders: parseInt(p.lastest_volume)||0,
    image: p.product_main_image_url,
    video_url: p.product_video_url||null,
    affiliate_url: p.promotion_link||p.product_detail_url,
    category: p.second_level_category_name||'',
  }))
}
