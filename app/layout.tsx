import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Javari Logo Studio', description: 'AI logo and brand identity generator — create professional logos in seconds.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        <div style={{ background: 'rgba(0,0,0,0.85)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <a href="https://craudiovizai.com" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <span>🎨</span> <span style={{ color: '#ec4899' }}>Javari Logo Studio</span> <span style={{ color: '#374151', fontSize: 11 }}>· EIN 39-3646201</span>
          </a>
          <a href="https://craudiovizai.com/auth/signup" style={{ background: '#ec4899', color: '#fff', borderRadius: 7, padding: '6px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Start Free →</a>
        </div>
        {children}
      </body>
    </html>
  )
}
