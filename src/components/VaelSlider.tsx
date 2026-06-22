'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';

interface VideoData {
  id: string;
  title: string;
  category: string | string[];
  youtubeId: string;
  type: string;
  upperText?: string;
  lowerText?: string;
  order?: number;
}

interface VaelSliderProps {
  activeCategory: string;
}

export function VaelSlider({ activeCategory }: VaelSliderProps) {
  const firestore = useFirestore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const heroQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(heroQuery);
  
  const slides = (allVideos as VideoData[] || [])
    .filter(v => {
      const isSlider = v.type === 'slider';
      if (!isSlider) return false;
      if (activeCategory === 'all') return true;
      const categories = Array.isArray(v.category) ? v.category : [v.category];
      return categories.some(c => c?.toLowerCase() === activeCategory.toLowerCase());
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: slides.length > 1, 
      align: 'center',
      skipSnaps: false,
      duration: 40
    }, 
    [Autoplay({ delay: 6000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi && emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi && emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const getYoutubeThumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const getFullUrl = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0`;

  if (loading || slides.length === 0) return null;

  return (
    <section className="relative w-full bg-black py-4 md:py-8 flex flex-col justify-center overflow-hidden select-none">
      <div className="relative">
        <div className="embla overflow-visible" ref={emblaRef}>
          <div className="embla__container flex items-center">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              
              return (
                <div 
                  key={slide.id} 
                  className="embla__slide flex-[0_0_80%] md:flex-[0_0_75%] min-w-0 px-2 md:px-5 relative"
                  onClick={() => isActive && setSelectedVideo(slide)}
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1 : 0.92,
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="relative aspect-[21/9] overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-white/5 rounded-none"
                  >
                    <div className="absolute inset-0 z-0">
                      <Image 
                        src={getYoutubeThumb(slide.youtubeId)}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={isActive}
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10" />

                    {isActive && (
                      <div className="absolute inset-0 z-20 p-6 md:p-12 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] tracking-[0.5em] text-white/50 uppercase font-bold">
                            {slide.upperText}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <h2 className="text-xl md:text-4xl font-headline text-white italic tracking-tighter uppercase leading-none">
                              {slide.lowerText || slide.title}
                            </h2>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sleek Minimalist Arrow Controls - Grouped Closely */}
        <div className="absolute bottom-6 md:bottom-12 right-[15%] z-50 flex items-center gap-4 pointer-events-none">
          <button 
            onClick={scrollPrev}
            className="pointer-events-auto flex items-center justify-center transition-all group/btn"
          >
            <ChevronLeft className="w-5 h-5 text-white/30 group-hover/btn:text-primary transition-colors" />
          </button>
          <button 
            onClick={scrollNext}
            className="pointer-events-auto flex items-center justify-center transition-all group/btn"
          >
            <ChevronRight className="w-5 h-5 text-white/30 group-hover/btn:text-primary transition-colors" />
          </button>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-7xl bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Cinematic entry by Errol Aditya</DialogDescription>
            {selectedVideo && (
              <div className="relative w-full h-full">
                <iframe className="w-full h-full" src={getFullUrl(selectedVideo.youtubeId)} frameBorder="0" allowFullScreen />
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}
