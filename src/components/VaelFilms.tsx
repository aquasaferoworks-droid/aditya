'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { FilterX, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVideoType, getYoutubeThumbnail } from '@/lib/video-utils';
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';

export function VaelFilms() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [selectedFilm, setSelectedFilm] = useState<any>(null);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(galleryQuery);
  
  const rawFilms = (allVideos || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const films = activeCategory === 'all' 
    ? rawFilms 
    : rawFilms.filter((v: any) => {
        const categories = v.category;
        if (Array.isArray(categories)) {
          return categories.some(c => c.toLowerCase() === activeCategory.toLowerCase());
        }
        return categories?.toLowerCase() === activeCategory.toLowerCase();
      });

  if (loading) return null;

  return (
    <section id="work" className="py-24 md:py-32 bg-background px-8 md:px-16 border-t border-border/10">
      <div className="max-w-7xl mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <span className="text-[10px] tracking-[0.6em] uppercase text-primary/60 block font-medium">Work Showcase</span>
          <h2 className="text-5xl md:text-9xl font-headline leading-[0.85] italic tracking-tighter text-white uppercase">
            {activeCategory}
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <p className="max-w-xs text-muted-foreground text-[10px] md:text-[11px] tracking-widest leading-relaxed uppercase font-body md:text-right">
            Displaying {films.length} curated projects.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto min-h-[400px]">
        <AnimatePresence mode="wait">
          {films.length > 0 ? (
            <motion.div 
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {films.map((film: any) => {
                const vType = getVideoType(film.youtubeId);
                const thumbUrl = vType === 'youtube' ? getYoutubeThumbnail(film.youtubeId, 'max') : null;

                return (
                  <div 
                    key={film.id} 
                    onClick={() => setSelectedFilm(film)}
                    className="group relative overflow-hidden bg-black aspect-video cursor-pointer border border-white/5 rounded-none"
                  >
                    {thumbUrl ? (
                      <Image 
                        src={thumbUrl} 
                        alt={film.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/5 bg-white/[0.02]">
                        <Video className="w-12 h-12" />
                        <span className="text-[8px] tracking-[0.4em] uppercase font-bold">Direct Source</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
                    
                    <div className="absolute inset-x-0 bottom-0 z-30 p-6 md:p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <h3 className="text-xl font-headline text-white italic tracking-tighter uppercase leading-none truncate mb-1">
                        {film.upperText}
                      </h3>
                      <div className="flex justify-between items-end gap-4">
                        <span className="text-[8px] tracking-[0.4em] text-primary uppercase font-bold truncate">
                          {film.lowerText || film.title}
                        </span>
                         <span className="text-[7px] tracking-[0.2em] text-white/30 uppercase font-bold whitespace-nowrap">
                           {Array.isArray(film.category) ? film.category[0] : film.category}
                         </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center justify-center text-center opacity-30 border border-dashed border-white/10"
            >
              <FilterX className="w-12 h-12 mb-4" />
              <p className="italic font-headline text-2xl uppercase tracking-widest">No entries for {activeCategory}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedFilm} onOpenChange={(open) => !open && setSelectedFilm(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-6xl bg-black border border-white/10 p-0 overflow-hidden rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedFilm?.title}</DialogTitle>
            <DialogDescription className="sr-only">Viewing: {selectedFilm?.title}</DialogDescription>
            {selectedFilm && (
              <div className="relative w-full h-full">
                <UnifiedVideoPlayer url={selectedFilm.youtubeId} />
                <DialogClose className="absolute top-6 right-6 z-[201]">
                  <div className="w-10 h-10 bg-black/40 border border-white/10 flex items-center justify-center">
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
