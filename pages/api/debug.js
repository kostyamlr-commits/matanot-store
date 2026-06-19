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
    keywords: 'resin desk ornament',
    page_no: '1',
    page_size: '5',
    sort: 'LAST_VOLUME_DESC',
    tracking_id: 'default',
    target_currency: 'ILS',
    target_language: 'EN',
    min_sale_price: '6',
    max_sale_price: '45',
    fields: 'product_id,product_title,product_main_image_url,product_small_image_urls,product_video_url,evaluate_rate,lastest_volume,promotion_link,product_detail_url,second_level_category_name,target_sale_price,sale_price',
  }

  const s = Object.keys(params).sort().map(k=>`${k}${params[k]}`).join('')
  params.sign = crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()

  const r = await fetch('https://api-sg.aliexpress.com/sync', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'},
    body: new URLSearchParams(params).toString(),
  })

  const data = JSON.parse(await r.text())
  const resp = data?.aliexpress_affiliate_product_query_response?.resp_result
  const products = resp?.result?.products?.product || []

  return res.status(200).json({
    resp_code: resp?.resp_code,
    resp_msg: resp?.resp_msg,
    count: products.length,
    sample_raw: products.slice(0,2),
  })
}
