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
      setIsScrolled(window.scrollY > 10);
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
    <div className="fixed top-0 left-0 right-0 z-[300] transition-all duration-300">
      <nav className={cn(
        "transition-all duration-300 px-6 md:px-16 flex items-center justify-between",
        isScrolled ? 'bg-black border-b border-white/5 py-3' : 'bg-black/40 backdrop-blur-sm py-5'
      )}>
        {/* Left Side: Spacer for symmetry */}
        <div className="flex-1 hidden md:block" />

        {/* Center: Centered Logo */}
        <div className="flex-none text-center">
          <Link href="/" className="font-headline text-xl md:text-2xl tracking-tighter hover:text-primary transition-all duration-700 italic font-bold uppercase block">
            ERROL <span className="text-primary not-italic font-light">ADITYA</span>
          </Link>
        </div>

        {/* Right Side: Contact Us Button */}
        <div className="flex-1 flex justify-end">
          <Button 
            variant="outline" 
            className="rounded-none border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary px-5 h-8 text-[9px] tracking-[0.2em] uppercase transition-all font-bold"
            asChild
          >
            <Link href="#contact">CONTACT US</Link>
          </Button>
        </div>
      </nav>

      {/* Sleek Category Bar */}
      <div className={cn(
        "bg-black border-b border-white/5 transition-all duration-300 overflow-hidden",
        isScrolled ? "h-9" : "h-9 md:h-10"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-full flex items-center overflow-x-auto no-scrollbar gap-4 md:gap-5 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "relative text-[8px] tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 font-body py-1 opacity-60 hover:opacity-100",
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
