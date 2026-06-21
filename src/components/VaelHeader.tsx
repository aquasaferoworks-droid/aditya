
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        "transition-all duration-500 px-6 py-4 md:px-16 flex items-center justify-between",
        isScrolled ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
      )}>
        {/* Left Placeholder for Symmetrical Balance */}
        <div className="flex-1 hidden md:block" />

        {/* Center: Logo */}
        <div className="flex-none text-center">
          <Link href="/" className="font-headline text-2xl md:text-3xl tracking-tighter hover:text-primary transition-all duration-700 italic font-bold uppercase">
            ERROL <span className="text-primary not-italic font-light">ADITYA</span>
          </Link>
        </div>

        {/* Right: Contact Button */}
        <div className="flex-1 flex justify-end">
          <Button 
            variant="outline" 
            className="rounded-none border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary px-6 h-9 text-[10px] tracking-[0.2em] uppercase transition-all font-bold"
            asChild
          >
            <Link href="#contact">Contact Us</Link>
          </Button>
        </div>
      </nav>

      {/* Category Navigation Bar - Compact & Modern */}
      <div className={cn(
        "bg-black/90 backdrop-blur-md border-b border-white/5 transition-all duration-500 overflow-hidden",
        isScrolled ? "h-11" : "h-0 md:h-11"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-full flex items-center overflow-x-auto no-scrollbar gap-5 md:gap-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "relative text-[9px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 font-body py-1 opacity-60 hover:opacity-100",
                activeCategory === cat ? "text-primary opacity-100 font-bold" : "text-white"
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
