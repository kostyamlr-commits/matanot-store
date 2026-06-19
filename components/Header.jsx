import { useState } from 'react'

const NAV = [
  { label: '🆕 חדש', cat: 'new' },
  { label: '👨 לו', cat: 'forhim' },
  { label: '👩 לה', cat: 'forher' },
  { label: '👧 לילדים', cat: 'kids' },
  { label: '🐾 לחיות', cat: 'pet' },
  { label: '😈 פראנקים', cat: 'prank' },
  { label: '🔧 גאדג׳טים', cat: 'gadget' },
  { label: '🏠 בית', cat: 'home' },
  { label: '🎉 מסיבה', cat: 'party' },
  { label: '💰 עד ₪50', cat: 'cheap' },
  { label: '😂 מצחיקים', cat: 'funny' },
]

export default function Header() {
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) window.location.href = `/?q=${encodeURIComponent(q.trim())}`
  }

  return (
    <header style={{background:'#050505',borderBottom:'1px solid #1a1a1a',position:'sticky',top:0,zIndex:100}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:12}}>
        <a href="/" style={{flexShrink:0}}>
          <span style={{fontSize:20,fontWeight:900,color:'#fff'}}>
            🎁 מתנות <span style={{color:'#ff2d78'}}>מטומטמות</span>
          </span>
        </a>
        <form onSubmit={handleSearch} style={{flex:1,maxWidth:400,display:'flex',gap:8,marginRight:'auto'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="חפש מתנה..."
            style={{flex:1,height:36,padding:'0 14px',borderRadius:18,border:'1px solid #2a2a2a',background:'#111',color:'#fff',fontSize:14,outline:'none',fontFamily:'Heebo,sans-serif',direction:'rtl'}}/>
          <button type="submit" style={{height:36,padding:'0 16px',background:'#ff2d78',border:'none',borderRadius:18,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:14}}>חפש</button>
        </form>
        <div style={{display:'flex',gap:8}}>
          <a href="/wishlist" style={{fontSize:20}} title="רשימת משאלות">❤️</a>
          <a href="/random" style={{fontSize:20}} title="הפתיעו אותי">🎲</a>
          <a href="/gift-guides" style={{fontSize:20}} title="מדריכי מתנות">📋</a>
        </div>
      </div>
      <nav style={{borderTop:'1px solid #111',overflowX:'auto'}}>
        <div style={{display:'flex',padding:'0 12px',height:40,alignItems:'center',gap:2,width:'max-content',minWidth:'100%'}}>
          <a href="/" style={{color:'#fff',fontSize:13,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'#ff2d78',whiteSpace:'nowrap',flexShrink:0}}>🌟 הכל</a>
          {NAV.map(item=>(
            <a key={item.cat} href={`/?cat=${item.cat}`}
              style={{color:'#aaa',fontSize:13,fontWeight:600,padding:'4px 12px',borderRadius:20,whiteSpace:'nowrap',flexShrink:0,border:'1px solid transparent',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#ff2d78'}}
              onMouseLeave={e=>{e.currentTarget.style.color='#aaa';e.currentTarget.style.borderColor='transparent'}}
            >{item.label}</a>
          ))}
        </div>
      </nav>
    </header>
  )
}
