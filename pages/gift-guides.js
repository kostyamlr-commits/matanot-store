import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
const GUIDES = [
  {emoji:'👨',title:'לו',desc:'גאדג׳טים מצחיקים לגברים',cat:'forhim',color:'#ff2d78'},
  {emoji:'👩',title:'לה',desc:'מתנות מצחיקות לנשים',cat:'forher',color:'#ffe600'},
  {emoji:'👧',title:'לילדים',desc:'צעצועים הזויים לילדים',cat:'kids',color:'#ff2d78'},
  {emoji:'🐾',title:'לחיות מחמד',desc:'צעצועים לכלבים וחתולים',cat:'pet',color:'#ffe600'},
  {emoji:'🎂',title:'יום הולדת',desc:'מתנות שיזכרו לנצח',cat:'party',color:'#ff2d78'},
  {emoji:'😈',title:'פראנקים',desc:'תעלולים מצחיקים לחברים',cat:'prank',color:'#ffe600'},
  {emoji:'🔧',title:'גאדג׳טים',desc:'הטכנולוגיה הכי מוזרה',cat:'gadget',color:'#ff2d78'},
  {emoji:'🏠',title:'לבית',desc:'קישוטים הזויים לכל בית',cat:'home',color:'#ffe600'},
  {emoji:'💰',title:'עד ₪50',desc:'מתנות זולות ומצחיקות',cat:'cheap',color:'#ff2d78'},
  {emoji:'🎉',title:'מסיבה',desc:'כל מה שצריך למסיבה',cat:'party',color:'#ffe600'},
]
export default function GiftGuides() {
  return (
    <>
      <Head><title>מדריכי מתנות — מתנות מטומטמות</title></Head>
      <Header/>
      <main style={{maxWidth:1280,margin:'0 auto',padding:'40px 16px',direction:'rtl'}}>
        <h1 style={{color:'#fff',marginBottom:8}}>🎁 מדריכי מתנות</h1>
        <p style={{color:'#666',marginBottom:40,fontSize:16}}>מצא את המתנה המושלמת לכל אירוע</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
          {GUIDES.map((g,i)=>(
            <a key={i} href={`/?cat=${g.cat}`} style={{background:'#111',border:`1px solid ${g.color}33`,borderRadius:12,padding:'24px 20px',display:'block',transition:'transform 0.2s,box-shadow 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 6px 20px ${g.color}22`}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
            >
              <div style={{fontSize:42,marginBottom:10}}>{g.emoji}</div>
              <h2 style={{color:g.color,fontSize:18,fontWeight:800,margin:'0 0 6px'}}>{g.title}</h2>
              <p style={{color:'#777',fontSize:13,margin:0}}>{g.desc}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer/>
    </>
  )
}
