// app/layout.tsx — root layout and site metadata
//
// 2026-08-12: the conformance check flagged javarilogo.com as the only live
// product domain with no OpenGraph tags, so every share of it rendered as a
// bare link. Also renamed from "Javari Logo Studio" to "Javari Logo": the
// platform's /apps/logo-studio was retired into this app the same day, and two
// names for one product is how the confusion started.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import type { Metadata } from 'next';
import type { ReactNode, ReactElement } from 'react';

const TITLE = 'Javari Logo';
const DESCRIPTION =
  'Logos and the brand around them — names, taglines, colour palettes, font ' +
  'pairing, guidelines and the mark itself, in one place.';
const SITE_URL = 'https://javarilogo.com';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s — ${TITLE}` },
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${TITLE} — CR AudioViz AI`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'CR AudioViz AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} — CR AudioViz AI`,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        <header
          style={{
            background: 'rgba(0,0,0,0.85)', height: 60, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', position: 'fixed', top: 0, left: 0, right: 0,
            zIndex: 100,
          }}
        >
          <a
            href="https://craudiovizai.com"
            style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
          >
            <span aria-hidden="true">🎨</span>{' '}
            <span style={{ color: '#ec4899' }}>Javari Logo</span>{' '}
            <span style={{ color: '#9CA3AF', fontSize: 11 }}>· EIN 39-3646201</span>
          </a>
          <a
            href="https://craudiovizai.com/auth/signup"
            style={{
              background: '#ec4899', color: '#fff', borderRadius: 7,
              padding: '6px 16px', fontSize: 12, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Start free
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
