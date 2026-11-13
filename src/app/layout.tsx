import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Fraunces, Inter } from 'next/font/google';
import TopStrip from '@/components/layout/TopStrip';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PWAManager from '@/components/PWAManager';
import ScrollReveal from '@/components/ScrollReveal';
import { LanguageProvider, T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';

// Design system (order matters): tokens, shared styles, then site-wide additions and dark theme.
import '@/styles/icons.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/header.css';
import '@/styles/footer.css';
import '@/styles/print.css';
import '@/styles/a11y.css';
import '@/styles/site.css';
import '@/styles/motion.css';
import '@/styles/theme.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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

// Runs before first paint. A Filipino visitor would otherwise see the English static HTML until React
// hydrates, so hide the page (base.css) until LanguageProvider has switched. Same lookup as the
// provider; the timeout is a safety net so a failed hydration can never leave the page hidden.
const LANG_GATE = `try{var s=localStorage.getItem('selectedLang'),b=navigator.language.split('-')[0].toLowerCase(),l=s==='en'||s==='fil'?s:(b==='fil'||b==='tl'?'fil':'en');if(l!=='en'){var d=document.documentElement;d.setAttribute('data-lang-pending',l);setTimeout(function(){d.removeAttribute('data-lang-pending')},3000)}}catch(e){}`;

// Runs before first paint. The static HTML always contains the neutral morning scene, so hide the
// hero scene (home.css) until HeroScene has applied San Jose's real time and weather. Same safety
// net as LANG_GATE: a failed hydration can never leave the scene hidden.
const HERO_GATE = `try{var d=document.documentElement;d.setAttribute('data-hero-pending','');setTimeout(function(){d.removeAttribute('data-hero-pending')},3000)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_GATE }} />
        <script dangerouslySetInnerHTML={{ __html: HERO_GATE }} />
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
          <ScrollReveal />
        </LanguageProvider>
      </body>
    </html>
  );
}
