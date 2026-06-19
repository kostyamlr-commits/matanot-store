import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

const GUIDES = [
  {emoji:'🤯',title:'WTF?!',desc:'מוצרים הזויים שגורמים להרים גבה',cat:'wtf',color:'#ff3b6b'},
  {emoji:'🔧',title:'Gadget Mania',desc:'גאדג׳טים חסרי תועלת אך מבריקים',cat:'gadget',color:'#ffd23f'},
  {emoji:'😂',title:'Funny/Gag',desc:'מתנות למתיחות ובדיחות',cat:'funny',color:'#ff3b6b'},
  {emoji:'🏠',title:'Home Oddities',desc:'עיצוב בית בסטייל מטורף',cat:'home',color:'#ffd23f'},
]

export default function GiftGuides() {
  return (
    <>
      <Head><title>מדריכי מתנות — מתנות מטומטמות</title></Head>
      <Header/>
      <main style={{maxWidth:1280,margin:'0 auto',padding:'40px 16px',direction:'rtl'}}>
        <h1 style={{color:'#fff',marginBottom:8}}>🎁 מדריכי מתנות</h1>
        <p style={{color:'#9a9aa2',marginBottom:40,fontSize:16}}>מצא את המתנה ההזויה המושלמת</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))',gap:20}}>
          {GUIDES.map((g,i)=>(
            <a key={i} href={`/?cat=${g.cat}`} style={{
              background:'rgba(255,255,255,0.03)',backdropFilter:'blur(16px)',
              border:`1px solid rgba(255,255,255,0.1)`,borderRadius:'1.5rem',
              padding:'28px 22px',display:'block',transition:'all 0.3s ease',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-8px)';e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';e.currentTarget.style.boxShadow='0 10px 30px rgba(0,0,0,0.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.boxShadow='none'}}
            >
              <div style={{fontSize:44,marginBottom:12}}>{g.emoji}</div>
              <h2 style={{color:g.color,fontSize:19,fontWeight:800,margin:'0 0 6px'}}>{g.title}</h2>
              <p style={{color:'#9a9aa2',fontSize:13,margin:0}}>{g.desc}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer/>
    </>
  )
}
