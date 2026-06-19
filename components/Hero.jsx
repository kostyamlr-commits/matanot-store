export default function Hero() {
  return (
    <section style={{ position:'relative', padding:'56px 16px 48px', borderBottom:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', background:'#0a0a0a' }}>
      <div style={{ position:'absolute', top:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,#ff3b6b22,transparent 70%)' }}/>
      <div style={{ position:'absolute', bottom:-80, right:-40, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,#ffd23f1a,transparent 70%)' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', textAlign:'right', position:'relative' }}>
        <h1 style={{ color:'#f4f4f5', marginBottom:14 }}>
          מתנות <span style={{ color:'#ff3b6b' }}>מטומטמות</span><br/>המתנות הכי מיותרות באינטרנט
        </h1>
        <p style={{ margin:'0 0 30px', fontSize:18, color:'#9a9aa2', maxWidth:560, fontWeight:500 }}>
          כי למה לקנות משהו שימושי כשאפשר לקנות משהו שגורם לחברים שלך לתהות מה עבר לך בראש?
        </p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <a href="#products" style={{ background:'#ff3b6b', color:'#fff', fontSize:16, fontWeight:800, padding:'13px 30px', borderRadius:14, display:'inline-block' }}>
            גלה מוצרים ←
          </a>
          <a href="/random" style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(8px)', color:'#f4f4f5', fontSize:16, fontWeight:700, padding:'13px 28px', borderRadius:14, display:'inline-block', border:'1.5px solid rgba(255,255,255,0.1)' }}>
            🎲 הפתיעו אותי
          </a>
          <a href="/gift-guides" style={{ background:'rgba(255,210,63,0.05)', backdropFilter:'blur(8px)', color:'#ffd23f', fontSize:16, fontWeight:700, padding:'13px 28px', borderRadius:14, display:'inline-block', border:'1.5px solid rgba(255,210,63,0.2)' }}>
            📋 מדריכי מתנות
          </a>
        </div>
      </div>
    </section>
  )
}
