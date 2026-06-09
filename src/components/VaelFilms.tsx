
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { Play, FilterX, Award, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VaelFilms() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [hoveredFilm, setHoveredFilm] = useState<string | null>(null);

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
    : rawFilms.filter((v: any) => v.category?.toLowerCase() === activeCategory.toLowerCase());

  const getCleanYoutubeEmbed = (id: string, isHovered: boolean) => {
    return `https://www.youtube.com/embed/${id}?autoplay=${isHovered ? 1 : 0}&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
  };

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
            A visual archive of narrative, documentary, and commissioned cinema. 
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
              {films.map((film: any) => {
                const isHovered = hoveredFilm === film.id;

                return (
                  <div 
                    key={film.id} 
                    onMouseEnter={() => setHoveredFilm(film.id)}
                    onMouseLeave={() => setHoveredFilm(null)}
                    className="group relative overflow-hidden bg-black aspect-video cursor-pointer transition-all duration-700"
                  >
                    <div className={`absolute inset-0 z-20 transition-opacity duration-1000 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                      <Image 
                        src={`https://img.youtube.com/vi/${film.youtubeId}/maxresdefault.jpg`} 
                        alt={film.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-black/70 group-hover:bg-black/30 transition-colors duration-700" />
                    </div>

                    {isHovered && (
                      <div className="absolute inset-0 z-30 pointer-events-none scale-[1.25]">
                        <iframe
                          className="w-full h-full"
                          src={getCleanYoutubeEmbed(film.youtubeId, true)}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                        <div className="absolute inset-0 z-40 bg-transparent" />
                      </div>
                    )}
                    
                    {/* Enhanced Split Metadata Overlay */}
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
                        <span className="text-[8px] tracking-[0.5em] text-white/50 uppercase block mb-1 font-medium">{film.category}</span>
                        {film.meta && (
                          <div className="flex items-center justify-end gap-1.5 text-white/30">
                            <Camera className="w-2.5 h-2.5" />
                            <span className="text-[7px] tracking-[0.2em] uppercase">{film.meta}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30 border border-dashed border-white/10"
            >
              <FilterX className="w-12 h-12 mb-4" />
              <p className="italic font-headline text-2xl uppercase tracking-widest">No entries found for "{activeCategory}"</p>
              <p className="text-[10px] tracking-[0.2em] uppercase">Try selecting another genre above</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
