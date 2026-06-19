import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'

function Skeleton() {
  return (
    <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:12,overflow:'hidden'}}>
      <div style={{width:'100%',aspectRatio:'1/1',background:'linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
      <div style={{padding:'14px',display:'flex',flexDirection:'column',gap:8}}>
        <div style={{height:16,borderRadius:6,background:'linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:14,width:'60%',borderRadius:6,background:'linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
        <div style={{height:40,borderRadius:8,marginTop:8,background:'#1a0a0a',animation:'shimmer 1.5s infinite'}}/>
      </div>
    </div>
  )
}

const LABELS = {
  forhim:'👨 לו', forher:'👩 לה', kids:'👧 לילדים', pet:'🐾 לחיות',
  prank:'😈 פראנקים', gadget:'🔧 גאדג׳טים', home:'🏠 בית',
  party:'🎉 מסיבה', cheap:'💰 עד ₪50', new:'🆕 חדש', funny:'😂 מצחיקים',
}

export default function ProductGrid({ initialProducts=[], total=0 }) {
  const [products, setProducts] = useState(initialProducts)
  const [hasMore, setHasMore] = useState(total > initialProducts.length)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('🌟 כל המוצרים')
  const seen = useRef(new Set(initialProducts.map(p=>p.id)))
  const busy = useRef(false)
  const sentinel = useRef(null)
  const page = useRef(1)
  const params = useRef({cat:'',q:''})

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const cat = p.get('cat')||'', q = p.get('q')||''
    params.current = {cat,q}
    setTitle(q ? `תוצאות: "${q}"` : (LABELS[cat]||'🌟 כל המוצרים'))
    if (cat||q) { seen.current=new Set(); setProducts([]); setHasMore(true); page.current=1; load(1,cat,q) }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !busy.current) load(page.current+1, params.current.cat, params.current.q)
    }, {rootMargin:'400px'})
    if (sentinel.current) obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [hasMore])

  async function load(p, cat, q) {
    if (busy.current) return
    busy.current = true; setLoading(true)
    try {
      let url = `/api/products?page=${p}&limit=6`
      if (q) url += `&q=${encodeURIComponent(q)}`
      else if (cat) url += `&cat=${cat}`
      const r = await fetch(url)
      const d = await r.json()
      const fresh = (d.products||[]).filter(p => { if(seen.current.has(p.id)) return false; seen.current.add(p.id); return true })
      setProducts(prev => p===1 ? fresh : [...prev,...fresh])
      setHasMore(d.hasMore && fresh.length>0)
      page.current = p
    } catch(e) { console.error(e) }
    busy.current=false; setLoading(false)
  }

  return (
    <section id="products" style={{padding:'32px 16px',maxWidth:1280,margin:'0 auto'}}>
      <h2 style={{fontSize:22,fontWeight:900,color:'#fff',margin:'0 0 6px',textAlign:'right'}}>{title}</h2>
      <p style={{color:'#555',fontSize:14,margin:'0 0 24px',textAlign:'right'}}>דירוג גבוה • אלפי הזמנות • מתעדכן אוטומטית</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:16}}>
        {products.map(p=><ProductCard key={p.id} product={p}/>)}
        {loading && products.length===0 && [1,2,3,4,5,6].map(i=><Skeleton key={i}/>)}
      </div>
      {products.length===0 && !loading && (
        <div style={{textAlign:'center',padding:'80px 20px',color:'#555'}}>
          <div style={{fontSize:56,marginBottom:16}}>🔍</div>
          <p style={{fontSize:18}}>לא נמצאו מוצרים</p>
          <a href="/" style={{color:'#ff2d78',fontWeight:700,fontSize:16}}>← כל המוצרים</a>
        </div>
      )}
      {loading && products.length>0 && (
        <div style={{textAlign:'center',padding:'28px 0'}}>
          <div style={{display:'inline-block',width:30,height:30,border:'3px solid #222',borderTop:'3px solid #ff2d78',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        </div>
      )}
      {!hasMore && !loading && products.length>0 && <p style={{textAlign:'center',color:'#444',padding:'28px 0',fontSize:14}}>🎁 ראית הכל!</p>}
      <div ref={sentinel} style={{height:1}}/>
    </section>
  )
}
