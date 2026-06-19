export default function Hero() {
  return (
    <section style={{ position:'relative', padding:'56px 16px 48px', borderBottom:'1px solid #1c1c20', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,#ff3b6b22,transparent 70%)' }}/>
      <div style={{ position:'absolute', bottom:-80, right:-40, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,#ffd23f1a,transparent 70%)' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', textAlign:'right', position:'relative' }}>
        <div style={{ display:'inline-block', background:'#ffd23f', color:'#1a1300', fontSize:13, fontWeight:800, padding:'5px 14px', borderRadius:'8px 8px 8px 2px', transform:'rotate(-2deg)', marginBottom:18 }}>
          🎁 מתעדכן כל יום עם פריטים חדשים
        </div>
        <h1 style={{ color:'#f4f4f5', marginBottom:14 }}>
          המתנות הכי <span style={{ color:'#ff3b6b' }}>מיותרות</span><br/>באינטרנט
        </h1>
        <p style={{ margin:'0 0 30px', fontSize:18, color:'#9a9aa2', maxWidth:480, fontWeight:500 }}>
          מוצרים מצחיקים והזויים — ישירות מאליאקספרס, בלי הגזמות
        </p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <a href="#products" style={{ background:'#ff3b6b', color:'#1a0008', fontSize:16, fontWeight:800, padding:'13px 30px', borderRadius:14, display:'inline-block' }}>
            גלה מוצרים ←
          </a>
          <a href="/random" style={{ background:'transparent', color:'#f4f4f5', fontSize:16, fontWeight:700, padding:'13px 28px', borderRadius:14, display:'inline-block', border:'1.5px solid #2a2a30' }}>
            🎲 הפתיעו אותי
          </a>
          <a href="/gift-guides" style={{ background:'transparent', color:'#ffd23f', fontSize:16, fontWeight:700, padding:'13px 28px', borderRadius:14, display:'inline-block', border:'1.5px solid #ffd23f33' }}>
            📋 מדריכי מתנות
          </a>
        </div>
      </div>
    </section>
  )
}
