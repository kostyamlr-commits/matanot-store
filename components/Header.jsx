import { useState } from 'react'

const NAV = [
  { label: 'WTF?!', cat: 'wtf' },
  { label: 'Gadget Mania', cat: 'gadget' },
  { label: 'Funny/Gag', cat: 'funny' },
  { label: 'Home Oddities', cat: 'home' },
]

export default function Header() {
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) window.location.href = `/?q=${encodeURIComponent(q.trim())}`
  }

  return (
    <header style={{background:'#0a0a0a',borderBottom:'1px solid #1c1c20',position:'sticky',top:0,zIndex:100}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 16px',height:58,display:'flex',alignItems:'center',gap:12}}>
        <a href="/" style={{flexShrink:0}}>
          <span style={{fontSize:21,fontWeight:900,color:'#f4f4f5'}}>
            🎁 מתנות <span style={{color:'#ff3b6b'}}>מטומטמות</span>
          </span>
        </a>
        <form onSubmit={handleSearch} style={{flex:1,maxWidth:400,display:'flex',gap:8,marginRight:'auto'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="חפש מתנה..."
            style={{flex:1,height:38,padding:'0 14px',borderRadius:12,border:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',backdropFilter:'blur(8px)',color:'#f4f4f5',fontSize:14,outline:'none',fontFamily:'Heebo,sans-serif',direction:'rtl'}}/>
          <button type="submit" style={{height:38,padding:'0 18px',background:'#ff3b6b',border:'none',borderRadius:12,color:'#fff',fontWeight:800,cursor:'pointer',fontSize:14}}>חפש</button>
        </form>
        <div style={{display:'flex',gap:6}}>
          <a href="/wishlist" style={{fontSize:20,padding:6}} title="רשימת משאלות">❤️</a>
          <a href="/random" style={{fontSize:20,padding:6}} title="הפתיעו אותי">🎲</a>
          <a href="/gift-guides" style={{fontSize:20,padding:6}} title="מדריכי מתנות">📋</a>
        </div>
      </div>
      <nav style={{borderTop:'1px solid #16161a',overflowX:'auto'}}>
        <div style={{display:'flex',padding:'0 12px',height:46,alignItems:'center',gap:6,width:'max-content',minWidth:'100%'}}>
          <a href="/" style={{color:'#fff',fontSize:14,fontWeight:800,padding:'7px 16px',borderRadius:12,background:'#ff3b6b',whiteSpace:'nowrap',flexShrink:0}}>🌟 הכל</a>
          {NAV.map(item=>(
            <a key={item.cat} href={`/?cat=${item.cat}`}
              style={{color:'#9a9aa2',fontSize:14,fontWeight:700,padding:'7px 16px',borderRadius:12,whiteSpace:'nowrap',flexShrink:0,
                background:'rgba(255,255,255,0.03)',backdropFilter:'blur(8px)',
                border:'1.5px solid rgba(255,255,255,0.08)',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#f4f4f5';e.currentTarget.style.borderColor='rgba(255,59,107,0.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.color='#9a9aa2';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}
            >{item.label}</a>
          ))}
        </div>
      </nav>
    </header>
  )
}
