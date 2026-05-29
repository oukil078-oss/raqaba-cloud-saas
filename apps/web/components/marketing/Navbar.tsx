import Link from 'next/link';
import { CloudCog } from 'lucide-react';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-raqaba-600 text-white shadow-glow">
        <CloudCog size={24} />
      </span>
      <span className={light ? 'text-white' : 'text-ink'}>
        <b className="block text-xl leading-5">رقابة</b>
        <span className="text-xs text-raqaba-300">Cloud POS</span>
      </span>
    </Link>
  );
}

export function MarketingNavbar() {
  const links = [
    ['/features', 'المزايا'],
    ['/industries', 'القطاعات'],
    ['/pricing', 'الأسعار'],
    ['/about', 'عن رقابة'],
    ['/contact', 'تواصل'],
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Logo light />
        <nav className="hidden items-center gap-7 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-bold text-blue-50 backdrop-blur-xl md:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-white hover:bg-white/10 md:block"
          >
            دخول
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-raqaba-800 shadow-xl"
          >
            ابدأ الآن
          </Link>
        </div>
      </div>
    </header>
  );
}
