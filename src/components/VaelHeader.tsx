
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const categories = [
  'all',
  'Ads',
  'Promo',
  'Celebrity',
  'Humor',
  'Cricketers',
  'VFX',
  'Home & Living',
  'Food',
  'Car',
  'Lifestyle',
  'Drama',
  'Sports',
  'High Concept',
  'Story',
  'Fashion',
  'Anthem'
];

export function VaelHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = searchParams.get('category') || 'all';
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[300] bg-black">
      {/* Primary Brand Bar - Extra Tight */}
      <nav className={cn(
        "px-6 md:px-16 flex items-center justify-between transition-all duration-300",
        isScrolled ? "h-10" : "h-12"
      )}>
        {/* Placeholder for balance */}
        <div className="flex-1 hidden md:block" />

        {/* Centered Logo */}
        <div className="flex-none text-center">
          <Link href="/" className="font-headline text-base md:text-lg tracking-tighter hover:text-primary transition-all duration-700 italic font-bold uppercase block">
            ERROL <span className="text-primary not-italic font-light">ADITYA</span>
          </Link>
        </div>

        {/* Contact CTA */}
        <div className="flex-1 flex justify-end">
          <Button 
            className="rounded-none bg-primary text-black hover:bg-white hover:text-black px-5 h-7 text-[8px] tracking-[0.2em] uppercase transition-all font-bold"
            asChild
          >
            <Link href="#contact">CONTACT US</Link>
          </Button>
        </div>
      </nav>

      {/* Secondary Scrollable Category Bar - sits flush upside */}
      <div className="relative group bg-black border-b border-white/5 h-8 flex items-center">
        {/* Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none nav-fade-left opacity-100 group-hover:opacity-40 transition-opacity" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none nav-fade-right opacity-100 group-hover:opacity-40 transition-opacity" />

        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          className="max-w-screen-xl mx-auto w-full px-12 h-full flex items-center overflow-x-auto no-scrollbar gap-10 md:gap-14 scroll-smooth"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "relative text-[7px] md:text-[8px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 font-body py-1 opacity-60 hover:opacity-100 flex-shrink-0",
                activeCategory === cat ? "text-primary opacity-100 font-bold" : "text-white"
              )}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div layoutId="activeCategoryHeader" className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
