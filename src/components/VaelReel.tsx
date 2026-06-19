
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
  award?: string;
  order?: number;
}

interface VaelReelProps {
  activeCategory: string;
}

const VideoCard = ({ video, aspectRatio, onClick }: { video: VideoItem, aspectRatio: string, onClick: (v: VideoItem) => void }) => {
  return (
    <motion.div
      className={`relative overflow-hidden bg-zinc-900 border border-white/5 group cursor-pointer ${aspectRatio} rounded-none shadow-2xl`}
      onClick={() => onClick(video)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 z-0">
        <Image 
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-700 z-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-15 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6 flex flex-col justify-end transition-all duration-700 pointer-events-none">
        <span className="text-[7px] md:text-[8px] tracking-[0.4em] text-white/50 uppercase font-bold block mb-1">{video.upperText}</span>
        <h3 className="text-sm md:text-xl font-headline text-white italic tracking-tighter uppercase leading-none truncate">{video.lowerText || video.title}</h3>
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

  // Strict 5-row structured grid logic
  const horizontals = filteredVideos.filter(v => v.type === 'reel-horizontal');
  const features = filteredVideos.filter(v => v.type === 'reel-feature');
  const mediums = filteredVideos.filter(v => v.type === 'reel-medium');
  const verticals = filteredVideos.filter(v => v.type === 'reel-vertical');

  if (loading) return null;

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-border/10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-16 space-y-4 md:space-y-12">
        
        {/* Row 1: 2 Horizontal - Fixed grid-cols-2 for mobile consistency */}
        <div className="grid grid-cols-2 gap-4 md:gap-12">
          {horizontals.slice(0, 2).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        {/* Row 2: 2 Horizontal */}
        <div className="grid grid-cols-2 gap-4 md:gap-12">
          {horizontals.slice(2, 4).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        {/* Row 3: 1 Large Featured */}
        <div className="w-full">
          {features.slice(0, 1).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video md:aspect-[21/9]" onClick={setSelectedVideo} />
          ))}
        </div>

        {/* Row 4: 2 Medium */}
        <div className="grid grid-cols-2 gap-4 md:gap-12">
          {mediums.slice(0, 2).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        {/* Row 5: 4 Vertical - Dense mobile grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
          {verticals.slice(0, 4).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[250] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[300] max-w-[95vw] md:max-w-7xl bg-black border border-white/10 p-0 overflow-hidden rounded-none shadow-2xl aspect-video focus:outline-none">
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
