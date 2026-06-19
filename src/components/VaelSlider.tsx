
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
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
        {/* Mobile-only "NEW IN" Header */}
        <div className="md:hidden text-center mb-4">
          <h2 className="text-4xl font-headline font-bold text-white tracking-[0.2em] uppercase leading-none">NEW IN</h2>
        </div>

        <div className="embla overflow-visible" ref={emblaRef}>
          <div className="embla__container flex items-center">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              
              return (
                <div 
                  key={slide.id} 
                  className="embla__slide flex-[0_0_85%] md:flex-[0_0_75%] min-w-0 px-2 md:px-4 relative"
                  onClick={() => isActive && setSelectedVideo(slide)}
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1 : 0.9,
                      opacity: isActive ? 1 : 0.4,
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

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                    {/* Active Slide Metadata - Desktop Style */}
                    {isActive && (
                      <div className="absolute inset-0 z-20 p-6 md:p-12 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-start">
                          <span className="text-[10px] tracking-[0.5em] text-white/60 uppercase font-bold hidden md:block">
                            {slide.upperText}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-headline text-white italic tracking-tighter uppercase leading-none">
                              {slide.lowerText || slide.title}
                            </h2>
                            <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase font-body mt-2">
                              {Array.isArray(slide.category) ? slide.category[0] : slide.category}
                            </p>
                          </div>
                          <div className="hidden md:flex gap-12">
                            <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase font-bold">PREV</span>
                            <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase font-bold">NEXT</span>
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

        {/* Global Nav Buttons - Desktop Only */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden md:flex justify-between px-[5%] md:px-[8%] pointer-events-none">
          <button 
            onClick={scrollPrev}
            className="pointer-events-auto h-24 w-24 flex items-center justify-start group/btn"
          >
            <div className="w-4 h-px bg-white/20 group-hover/btn:bg-primary transition-colors" />
          </button>
          <button 
            onClick={scrollNext}
            className="pointer-events-auto h-24 w-24 flex items-center justify-end group/btn"
          >
            <div className="w-4 h-px bg-white/20 group-hover/btn:bg-primary transition-colors" />
          </button>
        </div>

        {/* Mobile Social Icons - Matching Reference */}
        <div className="md:hidden flex items-center justify-center gap-6 py-8 opacity-40">
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.15.26-2.914.557-.79.307-1.459.717-2.126 1.384-.667.667-1.077 1.336-1.384 2.126-.297.764-.5 1.637-.557 2.914-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.26 2.15.557 2.914.307.79.717 1.459 1.384 2.126.667.667 1.336 1.077 2.126 1.384.764.297 1.637.5 2.914.557 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.15-.26 2.914-.557.79-.307 1.459-.717 2.126-1.384.667-.667 1.077-1.336 1.384-2.126.297-.764.5-1.637.557-2.914.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.26-2.15-.557-2.914-.307-.79-.717-1.459-1.384-2.126-.667-.667-1.336-1.077-2.126-1.384-.764-.297-1.637-.5-2.914-.557-1.28-.058-1.688-.072-4.947-.072z"/></svg>
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
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
