export default function Footer() {
  return (
    <footer style={{background:'#0c0c0e',borderTop:'1px solid #1c1c20',padding:'40px 16px'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:20,marginBottom:20}}>
          <span style={{fontSize:18,fontWeight:900}}>🎁 מתנות <span style={{color:'#ff3b6b'}}>מטומטמות</span></span>
          <div style={{display:'flex',gap:10}}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{width:38,height:38,borderRadius:10,border:'1.5px solid #1c1c20',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877f2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{width:38,height:38,borderRadius:10,border:'1.5px solid #1c1c20',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{width:38,height:38,borderRadius:10,border:'1.5px solid #1c1c20',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>
            </a>
          </div>
        </div>
        <p style={{margin:0,color:'#5a5a62',fontSize:12}}>⚠️ אתר זה משתתף בתוכנית השותפים של AliExpress. אנו עשויים לקבל עמלה על רכישות דרך הקישורים באתר.</p>
        <p style={{margin:'8px 0 0',color:'#3a3a40',fontSize:11}}>© 2026 מתנות מטומטמות</p>
      </div>
    </footer>
  )
}
