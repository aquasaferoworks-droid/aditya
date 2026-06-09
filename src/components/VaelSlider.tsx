
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Award, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  category: string;
  youtubeId: string;
  role: string;
  type: string;
  meta?: string;
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
    [Autoplay({ delay: 8000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

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

  const getYoutubeEmbed = (id: string, isActive: boolean, isModal: boolean = false) => {
    const base = `https://www.youtube.com/embed/${id}`;
    const params = `?autoplay=${isActive || isModal ? 1 : 0}&mute=${isModal ? 0 : 1}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
    return base + params;
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary animate-pulse">Synchronizing Archive</p>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative w-full bg-black pt-24 pb-12 md:pt-32 md:pb-24 min-h-[80vh] flex flex-col justify-center overflow-hidden select-none">
      <div className="container mx-auto px-6 mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-bold">Featured Projects</span>
        </div>
      </div>

      <div className="embla overflow-visible" ref={emblaRef}>
        <div className="embla__container flex items-center">
          {slides.map((slide, index) => {
            const isActive = selectedIndex === index;
            
            return (
              <div 
                key={slide.id} 
                className="embla__slide flex-[0_0_90%] md:flex-[0_0_75%] lg:flex-[0_0_65%] min-w-0 px-2 md:px-6 relative"
                onClick={() => setSelectedVideo(slide as VideoData)}
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.02 : 0.9,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                  className="relative aspect-video md:aspect-[21/9] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] bg-black group cursor-pointer border border-white/5 rounded-none"
                >
                  <div className="absolute inset-0 pointer-events-none transform scale-[1.1]">
                    <iframe
                      className="w-full h-full"
                      src={getYoutubeEmbed(slide.youtubeId, isActive)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
                  <div className="absolute inset-0 cinematic-vignette opacity-80 z-10" />
                  
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                    </div>
                  </div>

                  {/* Enhanced Metadata Overlay - Split Sides */}
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-30 flex items-end justify-between translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                     <div className="space-y-1">
                        <span className="text-[9px] md:text-[10px] tracking-[0.4em] text-primary uppercase font-bold block mb-1">{slide.role || 'Director'}</span>
                        <h3 className="text-xl md:text-5xl font-headline text-white italic tracking-tighter uppercase leading-none">{slide.title}</h3>
                     </div>
                     <div className="text-right space-y-2 hidden md:block">
                        {slide.award && (
                          <div className="flex items-center justify-end gap-2 text-primary">
                            <Award className="w-3.5 h-3.5" />
                            <span className="text-[9px] tracking-[0.2em] uppercase font-bold">{slide.award}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-2 text-white/40">
                          <Film className="w-3 h-3" />
                          <span className="text-[8px] tracking-[0.3em] uppercase">{slide.category} • {slide.meta || 'Cinematic'}</span>
                        </div>
                     </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-2xl" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-6xl bg-black border border-white/10 p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">
              {selectedVideo?.title} — {selectedVideo?.role}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Viewing {selectedVideo?.title} directed by Errol Aditya.
            </DialogDescription>
            
            <AnimatePresence mode="wait">
              {selectedVideo && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <iframe
                    className="w-full h-full"
                    src={getYoutubeEmbed(selectedVideo.youtubeId, true, true)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  <DialogClose className="absolute top-6 right-6 md:top-8 md:right-8 z-[201] transition-all duration-300">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-none bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:border-primary/50 hover:scale-110 transition-all">
                      <X className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
                    </div>
                  </DialogClose>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}
