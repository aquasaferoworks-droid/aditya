'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const categories = [
  'All',
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
  const activeCategory = searchParams.get('category') || 'All';
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
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    if (cat !== 'All') {
      const workSection = document.getElementById('work');
      if (workSection) {
        workSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[300] bg-black border-b border-white/5">
      {/* Primary Brand Bar */}
      <nav className={cn(
        "px-6 md:px-16 flex items-center justify-between transition-all duration-300",
        isScrolled ? "h-14" : "h-20"
      )}>
        {/* Left Spacer for Desktop Balance */}
        <div className="flex-1 hidden md:block" />

        {/* Center Logo */}
        <div className="flex-none text-center">
          <Link href="/" className="font-headline text-xl md:text-2xl tracking-tight hover:opacity-80 transition-opacity font-bold block">
            <span className="text-primary italic">Errol</span> <span className="text-white">Aditya</span>
          </Link>
        </div>

        {/* Right Contact Button */}
        <div className="flex-1 flex justify-end">
          <Button 
            className="rounded-lg bg-primary text-black hover:bg-white hover:text-black px-8 h-10 text-[11px] tracking-[0.1em] uppercase transition-all font-bold"
            asChild
          >
            <Link href="#contact">Contact Us</Link>
          </Button>
        </div>
      </nav>

      {/* Secondary Scrollable Category Bar - Tightened & Clear */}
      <div className="relative group bg-black h-12 flex items-center border-t border-white/5 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none nav-fade-left" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none nav-fade-right" />

        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          className="w-full px-8 md:px-16 h-full flex items-center overflow-x-auto no-scrollbar gap-8 md:gap-10 scroll-smooth"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "relative text-[13px] tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 font-body py-1 italic font-medium",
                activeCategory === cat ? "text-primary" : "text-white/60 hover:text-white"
              )}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeCategoryHeader" 
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
