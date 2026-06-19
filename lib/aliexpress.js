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
  const s = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()
}

// מילות חיפוש ספציפיות וויזואליות - לא גנריות (לא "funny toy" אלא תיאור קונקרטי)
export const CATEGORIES = {
  forhim:  ['beard grooming kit gift','bbq grill accessories set','mens novelty wallet rfid'],
  forher:  ['cat ear hair clip cute','flower jewelry box organizer','makeup bag cute cartoon'],
  kids:    ['dinosaur night light kids','unicorn slime kit toy','glow dark stars ceiling'],
  pet:     ['dog halloween costume funny','cat tunnel toy interactive','pet sunglasses photo prop'],
  prank:   ['electric shock pen prank','fake spider scary prank','whoopee cushion fart toy'],
  gadget:  ['mini projector keychain','magnetic levitating gadget','led finger light gadget'],
  home:    ['dinosaur kitchen spoon holder','animal shape ceramic mug','cloud night light silicone'],
  party:   ['inflatable photo booth props','led party glasses light','confetti balloon arch kit'],
  cheap:   ['mini desk fidget toy','kawaii eraser stationery set','keychain cute animal shape'],
  new:     ['capybara plush toy 2026','pop fidget trending toy','mini portable fan neck'],
  funny:   ['middle finger statue gift','realistic fake poop prank','googly eyes sticker pack'],
}

const DICT = {
  'funny':'מצחיק','weird':'מוזר','gift':'מתנה','prank':'פראנק','joke':'בדיחה',
  'novelty':'חידוש','gadget':'גאדג׳ט','toy':'צעצוע','hilarious':'מגניב',
  'party':'מסיבה','birthday':'יום הולדת','water':'מים','cat':'חתול',
  'dog':'כלב','cute':'חמוד','cool':'מגניב','kids':'ילדים','cheap':'זול',
  'trending':'טרנדי','men':'גברים','women':'נשים','him':'לו','her':'לה',
  'beard':'זקן','grooming':'טיפוח','kit':'ערכה','bbq':'ברביקיו','grill':'גריל',
  'wallet':'ארנק','flower':'פרח','jewelry':'תכשיטים','box':'קופסה',
  'makeup':'איפור','bag':'תיק','cartoon':'מצויר','dinosaur':'דינוזאור',
  'night':'לילה','light':'אור','unicorn':'חד קרן','slime':'בוץ','glow':'זוהר',
  'dark':'חושך','stars':'כוכבים','halloween':'האלווין','costume':'תחפושת',
  'tunnel':'מנהרה','interactive':'אינטראקטיבי','sunglasses':'משקפי שמש',
  'photo':'תמונה','shock':'שוק','pen':'עט','spider':'עכביש','scary':'מפחיד',
  'fart':'פלוץ','mini':'מיני','projector':'מקרן','keychain':'מחזיק מפתחות',
  'magnetic':'מגנטי','led':'לד','finger':'אצבע','spoon':'כף','holder':'מחזיק',
  'ceramic':'קרמיקה','mug':'ספל','cloud':'ענן','silicone':'סיליקון',
  'inflatable':'מתנפח','glasses':'משקפיים','confetti':'קונפטי','balloon':'בלון',
  'arch':'קשת','desk':'שולחן','fidget':'פידג׳ט','eraser':'מחק',
  'stationery':'כלי כתיבה','set':'סט','animal':'חיה','shape':'צורה',
  'capybara':'קפיברה','plush':'קטיפה','pop':'פופ','portable':'נייד','fan':'מאוורר',
  'neck':'צוואר','statue':'פסל','realistic':'ריאליסטי','poop':'קקי','sticker':'מדבקה',
  'pack':'חבילה',
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
  return (resp?.result?.products?.product || [])
    .filter(p => {
      const rate = parseFloat(p.evaluate_rate)||0
      const vol = parseInt(p.lastest_volume)||0
      const t = (p.product_title||'').toLowerCase()
      // חסום ספאם: כמויות בכותרת (10/50/100pcs), סטיקרים, ולקסי גנריים
      const isSpam = /\d+\/\d+\/\d+\s*pcs|sticker|decal\b/.test(t)
      return rate >= 85 && vol >= 100 && !isSpam
    })
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
