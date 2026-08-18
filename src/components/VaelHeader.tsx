'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const categories = [
  'All', 'Ads', 'Promo', 'Celebrity', 'Humor', 'Cricketers', 'VFX',
  'Home & Living', 'Food', 'Car', 'Lifestyle', 'Drama',
  'Sports', 'High Concept', 'Story', 'Fashion', 'Anthem'
];

export function VaelHeader() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = searchParams.get('category') || 'All';
  const scrollRef = useRef<HTMLDivElement>(null);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'contact');
  }, [firestore]);

  const { data: settings } = useDoc(settingsRef);
  const logoSize = settings?.logoSize || 24;

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[300] bg-black border-b border-white/5">
      {/* Brand Bar */}
      <nav className="px-6 md:px-16 flex items-center justify-between h-14 md:h-16 transition-all duration-300">
        <div className="flex-1 hidden md:block" />

        <div className="flex-none text-center">
          <Link 
            href="/" 
            className="font-headline tracking-tight hover:opacity-90 transition-opacity block font-medium"
            style={{ fontSize: `${logoSize}px` }}
          >
            <span className="text-primary">Errol</span> <span className="text-white">Aditya</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-end">
          <Button 
            className="rounded-lg bg-primary text-black hover:bg-white hover:text-black px-6 h-9 md:h-10 text-[13px] tracking-tight transition-all font-medium"
            asChild
          >
            <Link href="#contact">Contact Us</Link>
          </Button>
        </div>
      </nav>

      {/* Category Bar */}
      <div className="relative group bg-black h-11 md:h-12 flex items-center border-t border-white/5 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none nav-fade-left" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none nav-fade-right" />

        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          className="w-full px-8 md:px-16 h-full flex items-center overflow-x-auto no-scrollbar gap-6 md:gap-8 scroll-smooth"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "relative text-[13px] tracking-tight whitespace-nowrap transition-all duration-300 font-body py-1 font-medium",
                activeCategory.toLowerCase() === cat.toLowerCase() ? "text-primary opacity-100" : "text-white/60 hover:text-white"
              )}
            >
              {cat}
              {activeCategory.toLowerCase() === cat.toLowerCase() && (
                <motion.div 
                  layoutId="activeCategoryHeader" 
                  className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-primary" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
