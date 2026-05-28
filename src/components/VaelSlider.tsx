'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface SlideItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  youtubeId: string;
  role: string;
}

const slides: SlideItem[] = [
  {
    id: '1',
    title: 'HAWTHORN',
    category: 'directed by errol aditya',
    role: 'DIRECTOR / VISIONARY',
    imageUrl: 'https://picsum.photos/seed/slide1/1200/800',
    youtubeId: 'gJKxIAmhbvg',
  },
  {
    id: '2',
    title: 'VERMILION',
    category: 'visual narrative',
    role: 'CINEMATOGRAPHER',
    imageUrl: 'https://picsum.photos/seed/slide2/1200/800',
    youtubeId: 'QdEZtNyJb5g',
  },
  {
    id: '3',
    title: 'NOCTURNE',
    category: 'cinematography',
    role: 'DIRECTOR / VISIONARY',
    imageUrl: 'https://picsum.photos/seed/slide3/1200/800',
    youtubeId: 'O1p-JVaAQV0',
  },
  {
    id: '4',
    title: 'AUREATE',
    category: 'commissioned cinema',
    role: 'CREATIVE DIRECTOR',
    imageUrl: 'https://picsum.photos/seed/slide4/1200/800',
    youtubeId: 'xTrPSfbWa0w',
  },
];

export function VaelSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'center',
      skipSnaps: false,
      duration: 40
    }, 
    [Autoplay({ delay: 8000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<SlideItem | null>(null);

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

  const getYoutubeEmbed = (id: string, isSelected: boolean, isModal: boolean = false) => {
    const base = `https://www.youtube.com/embed/${id}`;
    const params = `?autoplay=${isSelected || isModal ? 1 : 0}&mute=${isModal ? 0 : 1}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
    return base + params;
  };

  return (
    <section className="relative w-full bg-background py-16 md:py-24 overflow-hidden select-none">
      <div className="embla overflow-visible" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => {
            const isActive = selectedIndex === index;
            
            return (
              <div 
                key={slide.id} 
                className="embla__slide flex-[0_0_90%] md:flex-[0_0_75%] min-w-0 px-3 md:px-10 relative"
                onClick={() => setSelectedVideo(slide)}
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1 : 0.94,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  className="relative aspect-[16/9] md:aspect-[21/10] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] bg-black group cursor-pointer border border-white/5"
                >
                  <div className="absolute inset-0 pointer-events-none transform scale-[1.3]">
                    <iframe
                      className="w-full h-full"
                      src={getYoutubeEmbed(slide.youtubeId, isActive)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <div className="absolute inset-0 cinematic-vignette opacity-50 z-10" />

                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-primary/20 hover:border-primary/40">
                      <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-12 md:mt-16">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-0.5 transition-all duration-1000",
              selectedIndex === i ? "w-24 bg-primary" : "w-12 bg-border hover:bg-muted-foreground/40"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[85vw] bg-black/90 backdrop-blur-2xl border-white/5 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-none aspect-video">
          <DialogTitle className="sr-only">
            {selectedVideo?.title} — {selectedVideo?.category}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Viewing {selectedVideo?.title} directed by Errol Aditya.
          </DialogDescription>
          
          <AnimatePresence>
            {selectedVideo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                className="relative w-full h-full flex items-center justify-center group/modal"
              >
                <iframe
                  className="w-full h-full"
                  src={getYoutubeEmbed(selectedVideo.youtubeId, true, true)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />

                <div className="absolute top-8 right-16 z-[60] pointer-events-none">
                  <span className="text-[10px] md:text-[12px] tracking-[0.6em] text-white/50 uppercase font-light">
                    {selectedVideo.role}
                  </span>
                </div>

                <DialogClose className="absolute top-8 right-6 z-[70] text-white/30 hover:text-white transition-all duration-300 hover:rotate-90">
                  <X className="w-8 h-8" strokeWidth={1} />
                  <span className="sr-only">Close Viewer</span>
                </DialogClose>

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/modal:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
}
