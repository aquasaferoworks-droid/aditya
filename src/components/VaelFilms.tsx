
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { FilterX, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractYoutubeId, getYoutubeThumbnail } from '@/lib/video-utils';
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

interface VaelFilmsProps {
  activeCategory: string;
}

export function VaelFilms({ activeCategory }: VaelFilmsProps) {
  const firestore = useFirestore();
  const [selectedFilm, setSelectedFilm] = useState<any>(null);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(galleryQuery);
  
  const rawFilms = (allVideos || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const films = rawFilms.filter((v: any) => {
    if (v.type !== 'reel-grid') return false;
    
    if (activeCategory.toLowerCase() === 'all') return true;
    
    const categories = v.category;
    if (Array.isArray(categories)) {
      return categories.some(c => c.toLowerCase() === activeCategory.toLowerCase());
    }
    return categories?.toLowerCase() === activeCategory.toLowerCase();
  });

  if (loading || films.length === 0) return null;

  return (
    <section id="work" className="py-24 md:py-32 bg-background px-6 md:px-16 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-[12px] tracking-tight text-primary font-medium italic whitespace-nowrap">Project Grid</span>
          <div className="h-[1px] w-24 bg-primary/20" />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {films.map((film: any) => {
              const ytId = extractYoutubeId(film.youtubeId);
              const thumbUrl = film.thumbnailUrl || (ytId ? getYoutubeThumbnail(ytId, 'max') : null);

              return (
                <div 
                  key={film.id} 
                  onClick={() => setSelectedFilm(film)}
                  className="group relative overflow-hidden bg-black aspect-video cursor-pointer border border-white/5 rounded-lg"
                >
                  {thumbUrl ? (
                    <Image 
                      src={thumbUrl} 
                      alt={film.upperText || "Cinematic Work"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 group-hover:opacity-100"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/5 bg-white/[0.02]">
                      <Video className="w-12 h-12" />
                      <span className="text-[10px] tracking-widest font-medium italic">Media Missing</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent z-10" />
                  
                  <div className="absolute inset-x-0 bottom-0 z-30 p-8 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                    <h3 
                      className="font-headline text-white italic tracking-tight leading-none truncate mb-1"
                      style={{ fontSize: film.upperTextSize ? `${film.upperTextSize}px` : '20px' }}
                    >
                      {film.upperText}
                    </h3>
                    <span 
                      className="text-primary italic font-medium truncate tracking-tight"
                      style={{ fontSize: film.lowerTextSize ? `${film.lowerTextSize}px` : '11px' }}
                    >
                      {film.lowerText}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedFilm} onOpenChange={(open) => !open && setSelectedFilm(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[300] max-w-5xl w-[95vw] bg-black border border-white/10 p-0 overflow-hidden rounded-lg aspect-video focus:outline-none shadow-2xl">
            <DialogTitle className="sr-only">{selectedFilm?.upperText}</DialogTitle>
            <DialogDescription className="sr-only">Viewing cinematic content</DialogDescription>
            {selectedFilm && (
              <div className="relative w-full h-full">
                <UnifiedVideoPlayer url={selectedFilm.youtubeId} />
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
