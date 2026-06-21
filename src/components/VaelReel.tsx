
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';

interface VideoItem {
  id: string;
  title: string;
  category: string | string[];
  youtubeId: string;
  type: string;
  upperText?: string;
  lowerText?: string;
  order?: number;
}

interface VaelReelProps {
  activeCategory: string;
}

const VideoCard = ({ video, aspectRatio, onClick }: { video: VideoItem, aspectRatio: string, onClick: (v: VideoItem) => void }) => {
  return (
    <motion.div
      className={`relative overflow-hidden bg-black border border-white/5 group cursor-pointer ${aspectRatio} rounded-none`}
      onClick={() => onClick(video)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 z-0">
        <Image 
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50 group-hover:opacity-100"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-15 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-8 flex flex-col justify-end transition-all duration-700 pointer-events-none translate-y-2 group-hover:translate-y-0">
        <span className="text-[7px] md:text-[9px] tracking-[0.5em] text-primary uppercase font-bold block mb-2">{video.upperText}</span>
        <h3 className="text-sm md:text-2xl font-headline text-white italic tracking-tighter uppercase leading-none truncate">{video.lowerText || video.title}</h3>
      </div>
    </motion.div>
  );
};

export function VaelReel({ activeCategory }: VaelReelProps) {
  const firestore = useFirestore();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const reelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(reelQuery);

  const getFullUrl = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&showinfo=0&modestbranding=1`;

  const filteredVideos = (allVideos as VideoItem[] || []).filter(v => {
    if (activeCategory === 'all') return true;
    const categories = Array.isArray(v.category) ? v.category : [v.category];
    return categories.some(c => c?.toLowerCase() === activeCategory.toLowerCase());
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  const horizontals = filteredVideos.filter(v => v.type === 'reel-horizontal');
  const features = filteredVideos.filter(v => v.type === 'reel-feature');
  const mediums = filteredVideos.filter(v => v.type === 'reel-medium');
  const verticals = filteredVideos.filter(v => v.type === 'reel-vertical');

  const usedH = horizontals.slice(0, 4);
  const usedF = features.slice(0, 1);
  const usedM = mediums.slice(0, 2);
  const usedV = verticals.slice(0, 4);

  const usedIds = new Set([
    ...usedH.map(v => v.id),
    ...usedF.map(v => v.id),
    ...usedM.map(v => v.id),
    ...usedV.map(v => v.id)
  ]);

  const moreVideos = filteredVideos.filter(v => !usedIds.has(v.id) && v.type !== 'slider');

  if (loading) return null;

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-4 md:space-y-12">
        
        {/* Genre Marker - Top */}
        <div className="flex items-center gap-6 mb-8">
          <span className="text-[10px] tracking-[0.8em] uppercase text-primary font-bold whitespace-nowrap">{activeCategory} / Series Start</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-12">
          {usedH.slice(0, 2).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-12">
          {usedH.slice(2, 4).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="w-full">
          {usedF.map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video md:aspect-[21/9]" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-12">
          {usedM.map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
          {usedV.map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />
          ))}
        </div>

        {/* Supplementary Section: More Projects */}
        {moreVideos.length > 0 && (
          <div className="pt-24 md:pt-48 space-y-12">
            <div className="flex items-center gap-8">
              <h2 className="text-[10px] tracking-[0.8em] uppercase text-primary/60 font-bold whitespace-nowrap">Supplementary / {activeCategory}</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-12">
              {moreVideos.map((v) => (
                <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
              ))}
            </div>
          </div>
        )}

        {/* Genre Marker - Bottom */}
        <div className="flex items-center gap-6 mt-24">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] tracking-[0.8em] uppercase text-primary/40 font-bold whitespace-nowrap">Series End / {activeCategory}</span>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-7xl bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Viewing project: {selectedVideo?.title}</DialogDescription>
            {selectedVideo && (
              <div className="relative w-full h-full">
                <iframe className="w-full h-full" src={getFullUrl(selectedVideo.youtubeId)} frameBorder="0" allowFullScreen />
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}
