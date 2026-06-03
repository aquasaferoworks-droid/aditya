
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

interface VideoItem {
  id: string;
  title: string;
  category: string;
  youtubeId: string;
  type: string;
}

interface VideoCardProps {
  video: VideoItem;
  aspectRatio: string;
  className?: string;
  onClick: (video: VideoItem) => void;
}

const VideoCard = ({ video, aspectRatio, className = "", onClick }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPreviewUrl = (id: string) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
  };

  return (
    <motion.div
      className={`relative overflow-hidden bg-black border border-white/5 group cursor-pointer ${aspectRatio} ${className} rounded-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(video)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <iframe
          className={`w-full h-full scale-[1.3] transition-transform duration-1000 ease-out ${isHovered ? 'scale-[1.4]' : ''}`}
          src={getPreviewUrl(video.youtubeId)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10" />
      <div className="absolute inset-0 cinematic-vignette opacity-50 z-10" />
      
      <div className="absolute bottom-6 left-6 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
        <span className="text-[8px] tracking-[0.4em] text-primary uppercase font-bold block mb-1">{video.category}</span>
        <h3 className="text-lg md:text-xl font-headline text-white italic tracking-tighter">{video.title}</h3>
      </div>
    </motion.div>
  );
};

export function VaelReel() {
  const firestore = useFirestore();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const reelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'videos'), 
      where('type', '>=', 'reel-'),
      orderBy('type'),
      orderBy('order', 'asc')
    );
  }, [firestore]);

  const { data: videos, loading } = useCollection(reelQuery);

  const getFullUrl = (id: string) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
  };

  if (loading || !videos || videos.length === 0) return null;

  // Filter videos by their structural slots
  const horizontals = videos.filter(v => v.type === 'reel-horizontal');
  const feature = videos.find(v => v.type === 'reel-feature');
  const mediums = videos.filter(v => v.type === 'reel-medium');
  const verticals = videos.filter(v => v.type === 'reel-vertical');

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-border/10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-16 space-y-4 md:space-y-8">
        
        {/* Row 1 & 2 -> horizontal video cards */}
        {horizontals.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {horizontals.map(video => (
              <VideoCard key={video.id} video={video as VideoItem} aspectRatio="aspect-video" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {/* Featured Wide */}
        {feature && (
          <div className="w-full">
            <VideoCard video={feature as VideoItem} aspectRatio="aspect-[21/9]" onClick={setSelectedVideo} />
          </div>
        )}

        {/* Medium Cards */}
        {mediums.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {mediums.map(video => (
              <VideoCard key={video.id} video={video as VideoItem} aspectRatio="aspect-[16/10]" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {/* Vertical Reel Section (Locked to 3) */}
        {verticals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {verticals.slice(0, 3).map(video => (
              <VideoCard key={video.id} video={video as VideoItem} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />
            ))}
          </div>
        )}
        
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[190] bg-black/90 backdrop-blur-xl" />
          <DialogContent className="z-[200] max-w-[95vw] md:max-w-6xl bg-black border border-white/10 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] rounded-none aspect-video focus:outline-none">
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
                    src={getFullUrl(selectedVideo.youtubeId)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  <div className="absolute top-6 left-8 z-[210] pointer-events-none drop-shadow-lg">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] tracking-[0.4em] text-primary uppercase font-bold">{selectedVideo.category}</span>
                      <span className="text-2xl md:text-3xl tracking-tight text-white italic font-headline font-bold">{selectedVideo.title}</span>
                    </div>
                  </div>

                  <DialogClose className="absolute top-6 right-6 z-[220] transition-all duration-300 group/close">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-none bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover/close:border-primary/50 group-hover/close:scale-110 transition-all">
                      <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover/close:text-primary transition-colors" strokeWidth={1.5} />
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
