import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
export default function Wishlist() {
  const [items, setItems] = useState([])
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('wishlist')||'[]')) } catch {} }, [])
  function remove(id) {
    const updated=items.filter(p=>p.id!==id)
    setItems(updated); localStorage.setItem('wishlist',JSON.stringify(updated))
  }
  return (
    <>
      <Head><title>רשימת משאלות — מתנות מטומטמות</title></Head>
      <Header/>
      <main style={{maxWidth:1280,margin:'0 auto',padding:'40px 16px',direction:'rtl'}}>
        <h1 style={{color:'#fff',marginBottom:8}}>❤️ רשימת המשאלות שלי</h1>
        <p style={{color:'#666',marginBottom:32,fontSize:16}}>{items.length} פריטים שמורים</p>
        {items.length===0 ? (
          <div style={{textAlign:'center',padding:'80px 20px',color:'#555'}}>
            <div style={{fontSize:64,marginBottom:16}}>💔</div>
            <p style={{fontSize:18}}>הרשימה ריקה</p>
            <a href="/" style={{display:'inline-block',marginTop:20,background:'#ff2d78',color:'#fff',padding:'12px 28px',borderRadius:24,fontWeight:700}}>גלה מוצרים →</a>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {items.map(p=>(
              <div key={p.id} style={{position:'relative'}}>
                <ProductCard product={p}/>
                <button onClick={()=>remove(p.id)} style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.7)',border:'none',borderRadius:'50%',width:32,height:32,color:'#ff2d78',cursor:'pointer',fontSize:18,zIndex:10,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer/>
    </>
  )
}
