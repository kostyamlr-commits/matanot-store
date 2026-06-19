import { useState, useEffect } from 'react'

export default function ProductCard({ product }) {
  const [saved, setSaved] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    try {
      const wl = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setSaved(wl.some(p => p.id === product.id))
    } catch {}
  }, [product.id])

  function toggleWishlist(e) {
    e.preventDefault(); e.stopPropagation()
    try {
      const wl = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const exists = wl.some(p => p.id === product.id)
      const updated = exists ? wl.filter(p => p.id !== product.id) : [...wl, product]
      localStorage.setItem('wishlist', JSON.stringify(updated))
      setSaved(!exists)
    } catch {}
  }

  async function shareWA(e) {
    e.preventDefault(); e.stopPropagation()
    try {
      const r = await fetch(`/api/shorten?url=${encodeURIComponent(product.affiliate_url)}`)
      const d = await r.json()
      const text = `😂 תראה את הדבר המטומטם הזה!\n*${product.title}*\n${d.short || product.affiliate_url}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent('😂 ' + product.title + ' ' + product.affiliate_url)}`, '_blank')
    }
  }

  const stars = Math.round(product.rating || 4)
  const orders = product.orders || 0

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: hover ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: hover ? 'translateY(-8px)' : 'none',
        boxShadow: hover ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <button onClick={toggleWishlist} aria-label="שמור למועדפים"
        style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          background: 'rgba(12,12,14,0.6)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 34, height: 34,
          cursor: 'pointer', fontSize: 16, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
        {saved ? '❤️' : '🤍'}
      </button>

      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
        style={{ display: 'block', width: '100%', aspectRatio: '1/1', background: '#0c0c0e', overflow: 'hidden' }}>
        {!imgErr && product.image
          ? <img src={product.image} alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hover ? 'scale(1.06)' : 'scale(1)' }}
              onError={() => setImgErr(true)} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🎁</div>
        }
      </a>

      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: '#f4f4f5', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 42 }}>
          {product.title}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 1 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 13, color: i <= stars ? '#ffd23f' : '#3a3a40' }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 11.5, color: '#9a9aa2', fontWeight: 600 }}>
            {orders >= 1000 ? `${Math.round(orders/1000*10)/10}K` : orders} הזמנות
          </span>
        </div>

        <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'rgba(255,59,107,0.9)', backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: 14, fontWeight: 800,
            padding: '12px 0', borderRadius: 12, transition: 'all 0.2s',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,89,128,0.95)'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,107,0.9)'; e.currentTarget.style.transform = 'none' }}
        >
          לרכישה ←
        </a>
        <button onClick={shareWA}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'rgba(37,211,102,0.08)', color: '#25d366', fontSize: 12.5, fontWeight: 700,
            padding: '8px 0', borderRadius: 10, border: '1px solid rgba(37,211,102,0.25)', cursor: 'pointer',
            width: '100%', fontFamily: 'Heebo,sans-serif',
          }}>
          שתף עם חבר 📲
        </button>
      </div>
    </article>
  )
}
