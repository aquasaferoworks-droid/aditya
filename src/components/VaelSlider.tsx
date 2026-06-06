'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
}

export function VaelSlider() {
  const firestore = useFirestore();
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
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const heroQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'videos'), 
      where('type', '==', 'slider'),
      orderBy('order', 'asc')
    );
  }, [firestore]);

  const { data: slides, loading } = useCollection(heroQuery);

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

  if (!loading && (!slides || slides.length === 0)) return null;

  return (
    <section className="relative w-full bg-black pt-32 pb-24 md:pt-48 md:pb-40 min-h-[100vh] flex flex-col justify-center overflow-hidden select-none">
      <div className="embla overflow-visible" ref={emblaRef}>
        <div className="embla__container flex items-center">
          {slides?.map((slide, index) => {
            const isActive = selectedIndex === index;
            
            return (
              <div 
                key={slide.id} 
                className="embla__slide flex-[0_0_85%] md:flex-[0_0_65%] min-w-0 px-2 md:px-6 relative"
                onClick={() => setSelectedVideo(slide as VideoData)}
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.05 : 0.85,
                    opacity: isActive ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                  className="relative aspect-video md:aspect-[21/9] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-black group cursor-pointer border border-white/5 rounded-none"
                >
                  <div className="absolute inset-0 pointer-events-none transform scale-[1.3]">
                    <iframe
                      className="w-full h-full"
                      src={getYoutubeEmbed(slide.youtubeId, isActive)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <div className="absolute inset-0 cinematic-vignette opacity-70 z-10" />
                  
                  <div className="absolute bottom-8 left-8 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                     <span className="text-[10px] tracking-[0.4em] text-primary uppercase font-bold block mb-1">{slide.role}</span>
                     <h3 className="text-2xl md:text-4xl font-headline text-white italic tracking-tighter">{slide.title}</h3>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-16 md:mt-24">
        {slides?.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-0.5 transition-all duration-1000 rounded-none",
              selectedIndex === i ? "w-24 bg-primary" : "w-12 bg-white/10 hover:bg-white/30"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-2xl" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-6xl bg-black border border-white/10 p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] rounded-none aspect-video focus:outline-none">
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
                  transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                  className="relative w-full h-full flex items-center justify-center group/modal"
                >
                  <iframe
                    className="w-full h-full"
                    src={getYoutubeEmbed(selectedVideo.youtubeId, true, true)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  <div className="absolute top-8 left-10 z-[70] pointer-events-none drop-shadow-lg">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] tracking-[0.4em] text-primary uppercase font-bold">{selectedVideo.role}</span>
                      <span className="text-2xl md:text-3xl tracking-tight text-white italic font-headline font-bold">{selectedVideo.title}</span>
                    </div>
                  </div>

                  <DialogClose className="absolute top-8 right-8 z-[201] transition-all duration-300 group/close">
                    <div className="w-12 h-12 rounded-none bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover/close:border-primary/50 group-hover/close:scale-110 transition-all">
                      <X className="w-6 h-6 text-white group-hover/close:text-primary transition-colors" strokeWidth={1.5} />
                    </div>
                    <span className="sr-only">Close Player</span>
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