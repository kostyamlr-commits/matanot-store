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
    <header style={{background:'#0c0c0e',borderBottom:'1px solid #1c1c20',position:'sticky',top:0,zIndex:100}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 16px',height:58,display:'flex',alignItems:'center',gap:12}}>
        <a href="/" style={{flexShrink:0}}>
          <span style={{fontSize:21,fontWeight:900,color:'#f4f4f5'}}>
            🎁 מתנות <span style={{color:'#ff3b6b'}}>מטומטמות</span>
          </span>
        </a>
        <form onSubmit={handleSearch} style={{flex:1,maxWidth:400,display:'flex',gap:8,marginRight:'auto'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="חפש מתנה..."
            style={{flex:1,height:38,padding:'0 14px',borderRadius:12,border:'1.5px solid #1c1c20',background:'#16161a',color:'#f4f4f5',fontSize:14,outline:'none',fontFamily:'Heebo,sans-serif',direction:'rtl'}}/>
          <button type="submit" style={{height:38,padding:'0 18px',background:'#ff3b6b',border:'none',borderRadius:12,color:'#1a0008',fontWeight:800,cursor:'pointer',fontSize:14}}>חפש</button>
        </form>
        <div style={{display:'flex',gap:6}}>
          <a href="/wishlist" style={{fontSize:20,padding:6}} title="רשימת משאלות">❤️</a>
          <a href="/random" style={{fontSize:20,padding:6}} title="הפתיעו אותי">🎲</a>
          <a href="/gift-guides" style={{fontSize:20,padding:6}} title="מדריכי מתנות">📋</a>
        </div>
      </div>
      <nav style={{borderTop:'1px solid #16161a',overflowX:'auto'}}>
        <div style={{display:'flex',padding:'0 12px',height:42,alignItems:'center',gap:4,width:'max-content',minWidth:'100%'}}>
          <a href="/" style={{color:'#1a0008',fontSize:13,fontWeight:800,padding:'5px 14px',borderRadius:10,background:'#ff3b6b',whiteSpace:'nowrap',flexShrink:0}}>🌟 הכל</a>
          {NAV.map(item=>(
            <a key={item.cat} href={`/?cat=${item.cat}`}
              style={{color:'#9a9aa2',fontSize:13,fontWeight:700,padding:'5px 14px',borderRadius:10,whiteSpace:'nowrap',flexShrink:0,border:'1.5px solid transparent',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#f4f4f5';e.currentTarget.style.borderColor='#ff3b6b'}}
              onMouseLeave={e=>{e.currentTarget.style.color='#9a9aa2';e.currentTarget.style.borderColor='transparent'}}
            >{item.label}</a>
          ))}
        </div>
      </nav>
    </header>
  )
}
