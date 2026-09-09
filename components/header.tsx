'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Arrow } from './icons';

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  return <header className="site-header">
    <Link href="/" className="wordmark" aria-label="Frame Shift home" onClick={() => setOpen(false)}>FRAME<span>/</span>SHIFT<sup>STUDIO</sup></Link>
    <button className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? 'Close −' : 'Menu +'}</button>
    <nav id="main-nav" className={open ? 'nav is-open' : 'nav'} aria-label="Main navigation">
      <Link href="/#work" onClick={() => setOpen(false)}>Work</Link>
      <Link href="/#approach" onClick={() => setOpen(false)}>Our approach</Link>
      <Link href="/#studio" onClick={() => setOpen(false)}>The studio</Link>
      <Link href="/start" className="nav-cta" aria-current={pathname === '/start' ? 'page' : undefined} onClick={() => setOpen(false)}>Start a project <Arrow diagonal /></Link>
    </nav>
  </header>;
}
