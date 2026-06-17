'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Award } from 'lucide-react';
import Image from 'next/image';
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

interface VideoItem {
  id: string;
  title: string;
  category: string | string[];
  youtubeId: string;
  type: string;
  upperText?: string;
  lowerText?: string;
  meta?: string;
  award?: string;
  order?: number;
}

const VideoCard = ({ video, aspectRatio, className, onClick }: { video: VideoItem, aspectRatio: string, className?: string, onClick: (v: VideoItem) => void }) => {
  return (
    <motion.div
      className={`relative overflow-hidden bg-zinc-900 border border-white/5 group cursor-pointer ${aspectRatio} rounded-none shadow-2xl ${className}`}
      onClick={() => onClick(video)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="absolute inset-0 z-0">
        <Image 
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-15" />

      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-8 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-all duration-700 pointer-events-none">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[8px] md:text-[9px] tracking-[0.4em] text-primary uppercase font-bold block mb-1">
              {Array.isArray(video.category) ? video.category[0] : video.category}
            </span>
            <span className="text-[7px] md:text-[8px] tracking-[0.5em] text-white/50 uppercase font-bold block truncate">{video.upperText}</span>
            <h3 className="text-xl md:text-2xl font-headline text-white italic tracking-tighter uppercase leading-none truncate">{video.lowerText || video.title}</h3>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            {video.award && (
              <div className="flex items-center gap-2 text-primary">
                <Award className="w-4 h-4" />
                <span className="text-[8px] tracking-[0.2em] uppercase font-bold hidden md:inline">{video.award}</span>
              </div>
            )}
            {video.meta && (
              <span className="text-[7px] tracking-[0.3em] text-white/40 uppercase whitespace-nowrap">
                {video.meta}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function VaelReel() {
  const firestore = useFirestore();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const reelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(reelQuery);

  const getFullUrl = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&showinfo=0&modestbranding=1`;

  const videos = (allVideos as VideoItem[] || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const horizontals = videos.filter(v => v.type === 'reel-horizontal');
  const features = videos.filter(v => v.type === 'reel-feature');
  const mediums = videos.filter(v => v.type === 'reel-medium');
  const verticals = videos.filter(v => v.type === 'reel-vertical');

  if (loading || videos.length === 0) return null;

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-border/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-12 md:space-y-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {horizontals.slice(0, 2).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {horizontals.slice(2, 4).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="w-full">
          {features.length > 0 && (
            <VideoCard 
              video={features[0]} 
              aspectRatio="aspect-video lg:aspect-[21/9]" 
              className="w-full" 
              onClick={setSelectedVideo} 
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {mediums.slice(0, 2).map((v) => (
            <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
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
                <DialogClose className="absolute top-8 right-8 z-[220]">
                  <div className="w-12 h-12 bg-black/40 border border-white/10 flex items-center justify-center rounded-none backdrop-blur-md">
                    <X className="w-6 h-6 text-white" />
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