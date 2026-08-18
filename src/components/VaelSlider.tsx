'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { ChevronLeft, ChevronRight, Video, X } from 'lucide-react';
import { getVideoType, getYoutubeThumbnail, extractYoutubeId } from '@/lib/video-utils';
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog';

interface VideoData {
  id: string;
  title: string;
  category: string | string[];
  youtubeId: string;
  thumbnailUrl?: string;
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
      if (activeCategory === 'All') return true;
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
    <section className="relative w-full bg-black flex flex-col justify-center overflow-hidden select-none py-4 md:py-10">
      <div className="relative max-w-[1800px] mx-auto w-full px-4 md:px-12">
        <div className="embla overflow-visible" ref={emblaRef}>
          <div className="embla__container flex items-center">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              const ytId = extractYoutubeId(slide.youtubeId);
              const thumbUrl = slide.thumbnailUrl || (ytId ? getYoutubeThumbnail(ytId, 'max') : null);
              
              return (
                <div 
                  key={slide.id} 
                  className="embla__slide flex-[0_0_92%] md:flex-[0_0_80%] min-w-0 px-2 md:px-4 relative"
                  onClick={() => isActive && setSelectedVideo(slide)}
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1 : 0.96,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="relative aspect-video md:aspect-[21/9] overflow-hidden bg-zinc-900 shadow-2xl group cursor-pointer border border-white/5 rounded-lg"
                  >
                    <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                      {thumbUrl ? (
                        <Image 
                          src={thumbUrl}
                          alt={slide.title}
                          fill
                          className="object-cover transition-opacity duration-700"
                          priority={isActive}
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-white/10">
                          <Video className="w-16 h-16" />
                          <span className="text-[10px] tracking-widest font-medium">Media Required</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                    {isActive && (
                      <div className="absolute inset-0 z-20 p-8 md:p-14 flex flex-col justify-end pointer-events-none">
                        <div className="space-y-1">
                          {/* Asian Paint Style - Title Case (First capital then small) */}
                          <h2 className="text-2xl md:text-5xl font-headline text-white font-medium tracking-tight leading-none">
                            {slide.upperText}
                          </h2>
                          <span className="text-[11px] md:text-[13px] text-primary font-medium block pt-1 tracking-tight">
                            {slide.lowerText}
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

        {/* Minimalist Nav Arrows - Direct on video frame as requested */}
        <button 
          onClick={scrollPrev}
          className="absolute left-[6%] md:left-[11%] top-1/2 -translate-y-1/2 z-40 p-2 transition-all hover:scale-125 group focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white/40 group-hover:text-primary transition-colors" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-[6%] md:right-[11%] top-1/2 -translate-y-1/2 z-40 p-2 transition-all hover:scale-125 group focus:outline-none"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white/40 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[400] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[500] max-w-5xl w-[95vw] bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-lg aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Cinematic project view</DialogDescription>
            {selectedVideo && (
              <div className="relative w-full h-full">
                <UnifiedVideoPlayer url={selectedVideo.youtubeId} />
                <DialogClose className="absolute top-6 right-6 z-[201]">
                  <div className="w-10 h-10 bg-black/60 border border-white/10 flex items-center justify-center rounded-lg hover:bg-black transition-colors">
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
