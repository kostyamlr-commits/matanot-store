export default async function handler(req, res) {
  const {url}=req.query
  if (!url) return res.status(400).json({error:'Missing url'})
  try {
    const r=await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    const short=await r.text()
    return res.status(200).json({short:short.trim()})
  } catch { return res.status(200).json({short:url}) }
}
