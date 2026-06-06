
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';

export function VaelFilms() {
  const firestore = useFirestore();
  const [hoveredFilm, setHoveredFilm] = useState<string | null>(null);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'videos'), 
      where('type', '==', 'film-gallery'),
      orderBy('order', 'asc')
    );
  }, [firestore]);

  const { data: films, loading } = useCollection(galleryQuery);

  const getCleanYoutubeEmbed = (id: string, isHovered: boolean) => {
    return `https://www.youtube.com/embed/${id}?autoplay=${isHovered ? 1 : 0}&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
  };

  if (loading || !films || films.length === 0) return null;

  return (
    <section id="work" className="py-32 bg-background px-8 md:px-16">
      <div className="max-w-7xl mx-auto mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <span className="text-[10px] tracking-[0.6em] uppercase text-primary/60 block font-medium">Filmography</span>
          <h2 className="text-6xl md:text-9xl font-headline leading-[0.85] italic tracking-tighter text-white">
            Selected <br /> <span className="text-primary not-italic">Works</span>
          </h2>
        </div>
        <p className="max-w-xs text-muted-foreground text-[11px] tracking-widest leading-relaxed uppercase font-body md:text-right">
          A visual archive of narrative, documentary, and commissioned cinema. Every frame a decision, every silence a story.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 border border-border/20">
        {films.map((film) => {
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
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-700" />
              </div>

              {isHovered && (
                <div className="absolute inset-0 z-30 pointer-events-none scale-[1.2]">
                  <iframe
                    className="w-full h-full"
                    src={getCleanYoutubeEmbed(film.youtubeId, true)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                  <div className="absolute inset-0 z-40 bg-transparent" />
                </div>
              )}
              
              {film.award && (
                <div className="absolute top-8 left-8 border border-white/20 px-4 py-1.5 text-[8px] tracking-[0.3em] text-white uppercase z-50 opacity-100 transition-opacity">
                  {film.award}
                </div>
              )}

              <div className="absolute bottom-0 left-0 p-10 w-full z-50 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                <span className="text-[8px] tracking-[0.5em] text-primary uppercase mb-3 block font-medium">{film.category}</span>
                <h3 className="text-3xl md:text-5xl font-headline text-white mb-3 italic tracking-tighter">{film.title}</h3>
                <p className="text-[9px] tracking-[0.3em] text-white/50 uppercase font-light">{film.meta}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
}
