'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Film } from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';

interface VideoData {
  id: string;
  title: string;
  category: string | string[];
  youtubeId: string;
  upperText?: string;
  lowerText?: string;
  type: string;
  award?: string;
  order?: number;
}

export function VaelSlider() {
  const firestore = useFirestore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const heroQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(heroQuery);
  
  const slides = (allVideos as VideoData[] || [])
    .filter(v => v.type === 'slider')
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

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

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
    <section className="relative w-full bg-black pt-32 pb-12 md:pt-40 md:pb-24 flex flex-col justify-center overflow-hidden select-none">
      <div className="container mx-auto px-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-bold">Featured Projects</span>
        </div>
      </div>

      <div className="relative group">
        <div className="embla overflow-visible" ref={emblaRef}>
          <div className="embla__container flex items-center">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              
              return (
                <div 
                  key={slide.id} 
                  className="embla__slide flex-[0_0_80%] md:flex-[0_0_85%] min-w-0 px-2 md:px-4 relative"
                  onClick={() => isActive && setSelectedVideo(slide)}
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.05 : 0.85,
                      opacity: isActive ? 1 : 0.25,
                    }}
                    transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    className="relative aspect-video overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-white/5 rounded-none"
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
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-30 flex items-end justify-between">
                       <div className="space-y-1">
                          <span className="text-[9px] md:text-[10px] tracking-[0.4em] text-primary uppercase font-bold block mb-1">{slide.upperText}</span>
                          <h3 className="text-2xl md:text-5xl font-headline text-white italic tracking-tighter uppercase leading-none">{slide.lowerText || slide.title}</h3>
                       </div>
                       <div className="text-right space-y-2 hidden lg:block opacity-60">
                          {slide.award && (
                            <div className="flex items-center justify-end gap-2 text-primary">
                              <Award className="w-3.5 h-3.5" />
                              <span className="text-[9px] tracking-[0.2em] uppercase font-bold">{slide.award}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-2 text-white">
                            <Film className="w-3 h-3" />
                            <span className="text-[8px] tracking-[0.3em] uppercase">
                              {Array.isArray(slide.category) ? slide.category.join(', ') : slide.category}
                            </span>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center px-[5%] pointer-events-none md:px-[10%] mb-4">
          <button 
            onClick={scrollPrev}
            className="pointer-events-auto flex items-center gap-2 group/btn"
          >
            <span className="text-[10px] tracking-[0.5em] uppercase text-white/40 group-hover/btn:text-primary transition-colors font-bold">PREV</span>
          </button>
          <button 
            onClick={scrollNext}
            className="pointer-events-auto flex items-center gap-2 group/btn"
          >
            <span className="text-[10px] tracking-[0.5em] uppercase text-white/40 group-hover/btn:text-primary transition-colors font-bold">NEXT</span>
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
                <DialogClose className="absolute top-6 right-6 z-[201]">
                  <div className="w-10 h-10 rounded-none bg-black/40 border border-white/10 flex items-center justify-center">
                    <X className="w-5 h-5 text-white" />
                  </div>
                </DialogClose>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}