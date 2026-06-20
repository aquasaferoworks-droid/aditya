'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const categories = [
  'all',
  'celebrity',
  'ads',
  'promo',
  'humor',
  'cricketers',
  'vfx',
  'home&living',
  'car',
  'food'
];

export function VaelHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = searchParams.get('category') || 'all';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    if (cat !== 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500">
      <nav className={cn(
        "transition-all duration-500 px-6 py-4 md:px-16 md:py-6 flex items-center justify-center",
        isScrolled ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent'
      )}>
        {/* Center: Logo */}
        <div className="flex-none text-center">
          <Link href="/" className="font-headline text-xl md:text-3xl tracking-tighter hover:text-primary transition-all duration-700 italic font-bold uppercase">
            ERROL <span className="text-primary not-italic font-light">ADITYA</span>
          </Link>
        </div>
      </nav>

      <div className={cn(
        "bg-black/80 backdrop-blur-md border-b border-white/5 transition-all duration-500 overflow-hidden",
        isScrolled ? "h-12" : "h-0 md:h-12"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-full flex items-center overflow-x-auto no-scrollbar gap-8 md:gap-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "relative text-[9px] md:text-[11px] tracking-[0.25em] uppercase whitespace-nowrap transition-all duration-300 font-body py-1",
                activeCategory === cat ? "text-primary font-bold" : "text-muted-foreground hover:text-white"
              )}
            >
              {cat.replace('&', ' & ')}
              {activeCategory === cat && (
                <motion.div layoutId="activeCategory" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
