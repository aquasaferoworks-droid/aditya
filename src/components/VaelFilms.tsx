
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { Play, FilterX, Award, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const rawFilms = (allVideos || [])
    .filter((v: any) => v.type === 'film-gallery')
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const films = activeCategory === 'all' 
    ? rawFilms 
    : rawFilms.filter((v: any) => {
        const categoryData = v.category;
        if (Array.isArray(categoryData)) {
          return categoryData.some(c => c.toLowerCase() === activeCategory.toLowerCase());
        }
        return categoryData?.toLowerCase() === activeCategory.toLowerCase();
      });

  const getFullUrl = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

  if (loading) return null;

  return (
    <section id="work" className="py-24 md:py-32 bg-background px-8 md:px-16 border-t border-border/10">
      <div className="max-w-7xl mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <span className="text-[10px] tracking-[0.6em] uppercase text-primary/60 block font-medium">Filmography</span>
          <h2 className="text-5xl md:text-9xl font-headline leading-[0.85] italic tracking-tighter text-white">
            Archive <br /> <span className="text-primary not-italic">Works</span>
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <p className="max-w-xs text-muted-foreground text-[10px] md:text-[11px] tracking-widest leading-relaxed uppercase font-body md:text-right">
            A visual archive of narrative cinema. 
            {activeCategory !== 'all' && <span className="text-primary block mt-2">Filtering: {activeCategory}</span>}
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
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10 border border-border/10"
            >
              {films.map((film: any) => (
                <div 
                  key={film.id} 
                  onClick={() => setSelectedFilm(film)}
                  className="group relative overflow-hidden bg-black aspect-video cursor-pointer"
                >
                  <Image 
                    src={`https://img.youtube.com/vi/${film.youtubeId}/maxresdefault.jpg`} 
                    alt={film.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-700" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
                    </div>
                  </div>

                  {/* Split Metadata Overlay */}
                  <div className="absolute bottom-0 left-0 p-8 w-full z-50 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out flex items-end justify-between gap-8">
                    <div className="flex-1">
                      <span className="text-[9px] tracking-[0.4em] text-primary uppercase mb-2 block font-bold">{film.role}</span>
                      <h3 className="text-2xl md:text-3xl font-headline text-white mb-2 italic tracking-tighter leading-none uppercase">{film.title}</h3>
                      {film.award && (
                        <div className="flex items-center gap-2 text-primary">
                          <Award className="w-3 h-3" />
                          <span className="text-[7px] tracking-[0.2em] uppercase font-bold">{film.award}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right hidden sm:block">
                      <span className="text-[8px] tracking-[0.5em] text-white/50 uppercase block mb-1 font-medium">
                        {Array.isArray(film.category) ? film.category.join(', ') : film.category}
                      </span>
                      {film.meta && (
                        <div className="flex items-center justify-end gap-1.5 text-white/30">
                          <Camera className="w-2.5 h-2.5" />
                          <span className="text-[7px] tracking-[0.2em] uppercase">{film.meta}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center justify-center text-center opacity-30 border border-dashed border-white/10"
            >
              <FilterX className="w-12 h-12 mb-4" />
              <p className="italic font-headline text-2xl uppercase tracking-widest">No entries found for "{activeCategory}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedFilm} onOpenChange={(open) => !open && setSelectedFilm(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-2xl" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-6xl bg-black border border-white/10 p-0 overflow-hidden rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedFilm?.title}</DialogTitle>
            <DialogDescription className="sr-only">Cinematic view of {selectedFilm?.title}</DialogDescription>
            {selectedFilm && (
              <div className="relative w-full h-full">
                <iframe className="w-full h-full" src={getFullUrl(selectedFilm.youtubeId)} frameBorder="0" allowFullScreen />
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
