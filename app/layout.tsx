import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'CRAV Logo Studio',
  description: 'Professional logo creation and brand identity tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* Javari AI Assistant - Embedded across all CR AudioViz AI apps */}
        <Script 
          src="https://javariai.com/embed.js" 
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
