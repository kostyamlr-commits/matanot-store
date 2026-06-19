import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
export default function Random() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  async function load() {
    setLoading(true)
    try {
      const page=Math.floor(Math.random()*15)+1
      const r=await fetch(`/api/products?page=${page}&limit=20`)
      const d=await r.json()
      const prods=d.products||[]
      if (prods.length>0) setProduct(prods[Math.floor(Math.random()*prods.length)])
    } catch {}
    setLoading(false)
  }
  useEffect(()=>{ load() },[])
  return (
    <>
      <Head><title>הפתיעו אותי — מתנות מטומטמות</title></Head>
      <Header/>
      <main style={{maxWidth:600,margin:'0 auto',padding:'60px 16px',textAlign:'center',direction:'rtl'}}>
        <h1 style={{color:'#fff',marginBottom:8}}>🎲 הפתיעו אותי!</h1>
        <p style={{color:'#666',marginBottom:40,fontSize:16}}>מוצר מטומטם אקראי בשבילך</p>
        {loading ? <div style={{padding:60}}><div style={{display:'inline-block',width:40,height:40,border:'3px solid #222',borderTop:'3px solid #ff2d78',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>
          : product ? <div style={{maxWidth:320,margin:'0 auto 32px'}}><ProductCard product={product}/></div>
          : <p style={{color:'#555'}}>לא נמצאו מוצרים</p>}
        <button onClick={load} style={{background:'#ff2d78',color:'#fff',border:'none',padding:'14px 36px',borderRadius:24,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'Heebo,sans-serif'}}>🎲 עוד אחד!</button>
      </main>
      <Footer/>
    </>
  )
}
