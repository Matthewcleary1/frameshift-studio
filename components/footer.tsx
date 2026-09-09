import Link from 'next/link';
import { Arrow } from './icons';

export function Footer({ compact = false }: { compact?: boolean }) {
  return <footer className="site-footer">
    {!compact && <div className="footer-top"><p className="eyebrow">YOUR NEXT PROJECT STARTS HERE</p><Link href="/start" className="footer-invitation">LET’S MAKE<br />SOMETHING <span>MATTER.</span><Arrow diagonal /></Link></div>}
    <div className="footer-bottom"><Link href="/" className="wordmark">FRAME<span>/</span>SHIFT</Link><span>Human craft. Expanded possibilities.</span><div><Link href="/privacy">Privacy</Link><span>© {new Date().getFullYear()} FRAME/SHIFT</span></div></div>
  </footer>;
}
