import Head from 'next/head'
import Header from '../components/Header'
import Hero from '../components/Hero'
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
        <Hero/>
        <ProductGrid initialProducts={initialProducts} total={total}/>
      </main>
      <Footer/>
    </>
  )
}

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
      revalidate: 60,
    }
  } catch (e) {
    console.error('getStaticProps error:', e.message)
    return { props: { initialProducts: [], total: 0 }, revalidate: 30 }
  }
}
