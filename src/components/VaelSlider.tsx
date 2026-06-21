
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
    <section className="relative w-full bg-black py-4 md:py-12 flex flex-col justify-center overflow-hidden select-none">
      <div className="relative">
        {/* Mobile-only "NEW IN" Header */}
        <div className="md:hidden text-center mb-6">
          <h2 className="text-3xl font-headline font-bold text-white tracking-[0.2em] uppercase leading-none">NEW IN</h2>
        </div>

        <div className="embla overflow-visible" ref={emblaRef}>
          <div className="embla__container flex items-center">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              
              return (
                <div 
                  key={slide.id} 
                  className="embla__slide flex-[0_0_82%] md:flex-[0_0_75%] min-w-0 px-2 md:px-5 relative"
                  onClick={() => isActive && setSelectedVideo(slide)}
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1 : 0.92,
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="relative aspect-[4/5] md:aspect-[21/9] overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-white/5 rounded-none"
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

                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10" />

                    {isActive && (
                      <div className="absolute inset-0 z-20 p-8 md:p-14 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-start">
                          <span className="text-[10px] tracking-[0.5em] text-white/50 uppercase font-bold hidden md:block">
                            {slide.upperText}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <h2 className="text-3xl md:text-5xl font-headline text-white italic tracking-tighter uppercase leading-none">
                              {slide.lowerText || slide.title}
                            </h2>
                            <p className="text-[10px] tracking-[0.3em] text-primary/80 uppercase font-body">
                              Series / {Array.isArray(slide.category) ? slide.category[0] : slide.category}
                            </p>
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

        {/* Sleek Arrow Controls - Desktop Only */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden md:flex justify-between px-[6%] pointer-events-none">
          <button 
            onClick={scrollPrev}
            className="pointer-events-auto h-16 w-16 flex items-center justify-center bg-black/40 hover:bg-primary transition-all group/btn border border-white/10"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover/btn:text-black transition-colors" />
          </button>
          <button 
            onClick={scrollNext}
            className="pointer-events-auto h-16 w-16 flex items-center justify-center bg-black/40 hover:bg-primary transition-all group/btn border border-white/10"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover/btn:text-black transition-colors" />
          </button>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-7xl bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Cinematic archive entry directed by Errol Aditya</DialogDescription>
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
