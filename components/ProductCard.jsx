import { useState, useEffect } from 'react'

export default function ProductCard({ product }) {
  const [saved, setSaved] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  useEffect(() => {
    try {
      const wl = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setSaved(wl.some(p => p.id === product.id))
    } catch {}
  }, [product.id])

  function toggleWishlist(e) {
    e.preventDefault(); e.stopPropagation()
    try {
      const wl = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const exists = wl.some(p => p.id === product.id)
      const updated = exists ? wl.filter(p => p.id !== product.id) : [...wl, product]
      localStorage.setItem('wishlist', JSON.stringify(updated))
      setSaved(!exists)
    } catch {}
  }

  async function shareWA(e) {
    e.preventDefault(); e.stopPropagation()
    try {
      const r = await fetch(`/api/shorten?url=${encodeURIComponent(product.affiliate_url)}`)
      const d = await r.json()
      const text = `😂 תראה את הדבר המטומטם הזה!\n*${product.title}*\n${d.short || product.affiliate_url}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent('😂 ' + product.title + ' ' + product.affiliate_url)}`, '_blank')
    }
  }

  return (
    <div style={{background:'#111',border:'1px solid #222',borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column',transition:'border-color 0.2s,transform 0.2s',position:'relative'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#ff2d78';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='#222';e.currentTarget.style.transform='none'}}
    >
      <button onClick={toggleWishlist} style={{position:'absolute',top:8,right:8,zIndex:3,background:'rgba(0,0,0,0.6)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {saved ? '❤️' : '🤍'}
      </button>
      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored" style={{display:'block',width:'100%',aspectRatio:'1/1',background:'#1a1a1a',overflow:'hidden'}}>
        {!imgErr && product.image
          ? <img src={product.image} alt={product.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}} onError={()=>setImgErr(true)} onMouseEnter={e=>e.target.style.transform='scale(1.05)'} onMouseLeave={e=>e.target.style.transform='scale(1)'} loading="lazy"/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>🎁</div>
        }
      </a>
      <div style={{padding:'14px 14px 16px',display:'flex',flexDirection:'column',gap:8,flexGrow:1}}>
        <p style={{margin:0,fontSize:15,fontWeight:700,color:'#fff',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {product.title}
        </p>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:13,color:i<=(Math.round(product.rating||0))?'#ffe600':'#333'}}>★</span>)}
          <span style={{fontSize:12,color:'#666'}}>{(product.orders||0).toLocaleString()} הזמנות</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:'auto'}}>
          <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#e62200',color:'#fff',fontSize:14,fontWeight:700,padding:'11px 0',borderRadius:8,transition:'background 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='#c41d00'}
            onMouseLeave={e=>e.currentTarget.style.background='#e62200'}
          >🛒 לרכישה באליאקספרס</a>
          <button onClick={shareWA} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#1a2e22',color:'#25d366',fontSize:13,fontWeight:600,padding:'9px 0',borderRadius:8,border:'1px solid #25d36633',cursor:'pointer',width:'100%',fontFamily:'Heebo,sans-serif'}}>
            📲 שלח לחבר
          </button>
        </div>
      </div>
    </div>
  )
}
