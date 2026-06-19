import crypto from 'crypto'

function getTimestamp() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const sh = new Date(utc + 8 * 3600000)
  const p = n => String(n).padStart(2,'0')
  return `${sh.getFullYear()}-${p(sh.getMonth()+1)}-${p(sh.getDate())} ${p(sh.getHours())}:${p(sh.getMinutes())}:${p(sh.getSeconds())}`
}

export default async function handler(req, res) {
  const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '515336'
  const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'KZgmteUFRQXrhcRXwdEqcIwGLDfkSoT3'
  const ts = getTimestamp()

  const params = {
    app_key: APP_KEY,
    method: 'aliexpress.affiliate.product.query',
    sign_method: 'md5',
    timestamp: ts,
    v: '2.0',
    keywords: 'funny gift',
    page_no: '1',
    page_size: '10',
    sort: 'LAST_VOLUME_DESC',
    tracking_id: process.env.ALIEXPRESS_TRACKING_ID || 'default',
    target_currency: 'ILS',
    target_language: 'EN',
  }

  const s = Object.keys(params).sort().map(k=>`${k}${params[k]}`).join('')
  params.sign = crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()

  const r = await fetch('https://api-sg.aliexpress.com/sync', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'},
    body: new URLSearchParams(params).toString(),
  })

  const text = await r.text()
  
  return res.status(200).json({
    timestamp_sent: ts,
    app_key_used: APP_KEY,
    has_secret: !!process.env.ALIEXPRESS_APP_SECRET,
    raw_response: text.slice(0, 1500),
  })
}
