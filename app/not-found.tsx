import Link from 'next/link';
import { Footer } from '@/components/footer';
export default function NotFound() { return <><main id="main" className="status-page section-pad"><p className="eyebrow">404 / OUT OF FRAME</p><h1>LET’S GET<br />YOU BACK.</h1><p>That page isn’t here. There’s plenty more to explore.</p><Link href="/" className="button primary">Back to the studio</Link></main><Footer compact /></>; }
