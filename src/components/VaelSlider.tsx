
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { getVideoType, getYoutubeThumbnail } from '@/lib/video-utils';
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';
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

  if (loading || slides.length === 0) return null;

  return (
    <section className="relative w-full bg-black flex flex-col justify-center overflow-hidden select-none py-2 md:py-6">
      <div className="relative max-w-[1800px] mx-auto w-full px-4 md:px-12">
        <div className="embla overflow-visible" ref={emblaRef}>
          <div className="embla__container flex items-center">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              const vType = getVideoType(slide.youtubeId);
              const thumbUrl = vType === 'youtube' ? getYoutubeThumbnail(slide.youtubeId, 'max') : null;
              
              return (
                <div 
                  key={slide.id} 
                  className="embla__slide flex-[0_0_90%] md:flex-[0_0_80%] min-w-0 px-2 md:px-6 relative"
                  onClick={() => isActive && setSelectedVideo(slide)}
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1 : 0.96,
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="relative aspect-video md:aspect-[21/9] overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-white/5 rounded-none"
                  >
                    <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                      {thumbUrl ? (
                        <Image 
                          src={thumbUrl}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={isActive}
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-white/10">
                          <Video className="w-16 h-16" />
                          <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Source Link Required</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10" />

                    {isActive && (
                      <div className="absolute inset-0 z-20 p-6 md:p-12 flex flex-col justify-end pointer-events-none">
                        <div className="space-y-1">
                          <h2 className="text-xl md:text-4xl font-headline text-white italic tracking-tighter uppercase leading-none">
                            {slide.upperText}
                          </h2>
                          <span className="text-[7px] md:text-[10px] tracking-[0.5em] text-primary uppercase font-bold block pt-1">
                            {slide.lowerText || slide.title}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Repositioned Minimalist Arrows - Closer to the video edge */}
        <button 
          onClick={scrollPrev}
          className="absolute left-[8%] md:left-[12%] top-1/2 -translate-y-1/2 z-40 p-2 transition-all group hover:scale-110 focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white/20 group-hover:text-primary transition-colors" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-[8%] md:right-[12%] top-1/2 -translate-y-1/2 z-40 p-2 transition-all group hover:scale-110 focus:outline-none"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white/20 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[400] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[500] max-w-[95vw] md:max-w-7xl bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Cinematic entry view</DialogDescription>
            {selectedVideo && (
              <UnifiedVideoPlayer url={selectedVideo.youtubeId} />
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}
