import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Fraunces } from 'next/font/google';
import TopStrip from '@/components/layout/TopStrip';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PWAManager from '@/components/PWAManager';
import { LanguageProvider, T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';

// BetterSolano design system (order matters), then San Jose additions.
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/duotone';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';
import '@/styles/style.css';
import '@/styles/responsive.css';
import '@/styles/accessibility.css';
import '@/styles/footer.css';
import '@/styles/legal.css';
import '@/styles/site.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a2f86',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.lgu.name}, ${SITE.lgu.province}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'Better San Jose',
    'San Jose City',
    'Nueva Ecija',
    'LGU San Jose',
    'city services',
    'BetterNuevaEcija',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: '/',
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.lgu.name}, ${SITE.lgu.province}`,
    description: SITE.tagline,
    images: [{ url: '/assets/images/banners/opengraph.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/assets/images/logo/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/images/logo/favicon.ico' },
    ],
    apple: '/assets/images/logo/icon-180.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: SITE.name },
  other: {
    'geo.region': 'PH-NUE',
    'geo.placename': `${SITE.lgu.name}, ${SITE.lgu.province}`,
    'msapplication-TileColor': '#0a2f86',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <a href="#main-content" className="skip-link">
            <T k="home-skip-to-main-content">Skip to main content</T>
          </a>
          <TopStrip />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <PWAManager />
        </LanguageProvider>
      </body>
    </html>
  );
}
