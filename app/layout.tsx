import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './globals.css';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: { default: 'FRAME/SHIFT — Hybrid production studio', template: '%s — FRAME/SHIFT' },
  description: 'Human craft meets new possibilities. Film, photography and generative AI, brought together by a hybrid production studio.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header />{children}</body></html>;
}
