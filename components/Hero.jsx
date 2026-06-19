export default function Hero() {
  return (
    <section style={{
      background: '#0f0f0f',
      padding: '80px 20px 60px',
      textAlign: 'right',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid #1a1a1a',
    }}>
      {/* אור רקע */}
      <div style={{
        position: 'absolute', top: -150, left: -100,
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 40,
      }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,45,120,0.12)',
            border: '1px solid rgba(255,45,120,0.3)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 24,
          }}>
            <span style={{ color: '#ff2d78', fontSize: 14, fontWeight: 600 }}>
              🔥 מתעדכן 3 פעמים ביום ישירות מאליאקספרס
            </span>
          </div>

          <h1 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900, lineHeight: 1.1, color: '#fff',
          }}>
            המתנות הכי{' '}
            <span style={{ color: '#ff2d78' }}>מיותרות</span>
            <br />באינטרנט
          </h1>

          <p style={{ margin: '0 0 36px', fontSize: 18, color: '#888', lineHeight: 1.7 }}>
            כאן תמצאו את המתנות המוזרות והמצחיקות ביותר —
            מוכנות להזמנה ישירה מאליאקספרס במחירים מצחיקים!
          </p>

          <a href="#products" style={{
            display: 'inline-block',
            background: '#ff2d78', color: '#fff',
            fontSize: 17, fontWeight: 700,
            padding: '16px 36px', borderRadius: 14,
            textDecoration: 'none',
          }}>
            בואו לראות משהו מטומטם →
          </a>
        </div>

        <div style={{
          fontSize: 110,
          userSelect: 'none',
          animation: 'float 3s ease-in-out infinite',
        }}>🌵</div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  )
}
