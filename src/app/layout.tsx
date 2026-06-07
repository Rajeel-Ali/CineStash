
import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinestash.app';

export const metadata: Metadata = {
  title: {
    default: 'CineStash - Your Personal Movie & Show Tracker',
    template: `%s | CineStash`,
  },
  description: 'Your personal movie and show tracker, supercharged with AI. Keep a library of everything you\'ve watched, what you want to watch, and get personalized suggestions for what to watch next.',
  applicationName: 'CineStash',
  appleWebApp: {
    capable: true,
    title: 'CineStash',
    statusBarStyle: 'default',
  },
  manifest: '/manifest.json',
  keywords: ['movie tracker', 'show tracker', 'what to watch', 'cinephile', 'tv series', 'movies', 'film library', 'ai recommendations'],
  metadataBase: new URL(SITE_URL),
  creator: 'ProProfile',
  authors: [{ name: 'ProProfile', url: 'https://proprofile.app/' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'CineStash - Your Personal Movie & Show Tracker',
    description: 'Your personal movie and show tracker, supercharged with AI. Keep a library of everything you\'ve watched, what you want to watch, and get personalized suggestions for what to watch next.',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'CineStash Logo',
      },
    ],
    siteName: 'CineStash',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CineStashApp', // Replace with your actual Twitter handle
    title: 'CineStash - Your Personal Movie & Show Tracker',
    description: 'Your personal movie and show tracker, supercharged with AI. Keep a library of everything you\'ve watched, what you want to watch, and get personalized suggestions for what to watch next.',
    images: ['/icon-512x512.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
    other: [
        {
            url: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
        },
        {
            url: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
        },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-401BTJLEXV"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-401BTJLEXV');
          `}
        </Script>
      </body>
    </html>
  );
}
