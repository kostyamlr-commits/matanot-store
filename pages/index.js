import Head from 'next/head'
import Header from '../components/Header'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'

export default function Home({ initialProducts, total }) {
  return (
    <>
      <Head>
        <title>מתנות מטומטמות — המתנות הכי מיותרות באינטרנט</title>
        <meta name="description" content="מתנות מצחיקות והזויות ישירות מאליאקספרס!"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <Header/>
      <main>
        <section style={{background:'linear-gradient(135deg,#0a0a0a 0%,#150a10 100%)',padding:'48px 16px 40px',borderBottom:'1px solid #1a1a1a'}}>
          <div style={{maxWidth:1280,margin:'0 auto',textAlign:'right'}}>
            <h1 style={{margin:'0 0 12px',color:'#fff'}}>המתנות הכי <span style={{color:'#ff2d78'}}>מיותרות</span> באינטרנט</h1>
            <p style={{margin:'0 0 28px',fontSize:18,color:'#888',maxWidth:500}}>מוצרים מצחיקים והזויים — ישירות מאליאקספרס</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="#products" style={{background:'#ff2d78',color:'#fff',fontSize:16,fontWeight:700,padding:'12px 28px',borderRadius:24,display:'inline-block'}}>גלה מוצרים →</a>
              <a href="/random" style={{background:'transparent',color:'#fff',fontSize:16,fontWeight:700,padding:'12px 28px',borderRadius:24,display:'inline-block',border:'1px solid #333'}}>🎲 הפתיעו אותי</a>
              <a href="/gift-guides" style={{background:'transparent',color:'#ffe600',fontSize:16,fontWeight:700,padding:'12px 28px',borderRadius:24,display:'inline-block',border:'1px solid #ffe60033'}}>🎁 מדריכי מתנות</a>
            </div>
          </div>
        </section>
        <ProductGrid initialProducts={initialProducts} total={total}/>
      </main>
      <Footer/>
    </>
  )
}

// קוראים ישירות מ-Supabase בזמן build/revalidate - בלי תלות ב-URL חיצוני
export async function getStaticProps() {
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .order('orders', { ascending: false })
      .range(0, 5)

    if (error) throw error

    return {
      props: { initialProducts: data || [], total: count || 0 },
      revalidate: 60, // מתעדכן כל דקה - מהיר יותר לבדיקה
    }
  } catch (e) {
    console.error('getStaticProps error:', e.message)
    return { props: { initialProducts: [], total: 0 }, revalidate: 30 }
  }
}
