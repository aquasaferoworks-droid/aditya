
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Play } from 'lucide-react';
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
  role: string;
  meta?: string;
  award?: string;
  order?: number;
}

const VideoCard = ({ video, aspectRatio, onClick }: { video: VideoItem, aspectRatio: string, onClick: (v: VideoItem) => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden bg-zinc-900 border border-white/5 group cursor-pointer ${aspectRatio} rounded-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(video)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 z-0">
        <Image 
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-700 z-10" />
      <div className="absolute inset-0 cinematic-vignette opacity-60 z-10" />

      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
        </div>
      </div>
      
      {/* Split Metadata Overlay */}
      <div className="absolute inset-0 z-30 p-6 flex flex-col justify-between translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
        <div className="flex justify-between items-start">
           <span className="text-[8px] tracking-[0.4em] text-primary uppercase font-bold bg-black/40 px-2 py-1 border border-primary/20">
             {Array.isArray(video.category) ? video.category[0] : video.category}
           </span>
           {video.award && <Award className="w-4 h-4 text-primary drop-shadow-lg" />}
        </div>
        
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1">
            <span className="text-[7px] tracking-[0.5em] text-white/50 uppercase font-bold block mb-1">{video.role}</span>
            <h3 className="text-lg md:text-2xl font-headline text-white italic tracking-tighter uppercase leading-none">{video.title}</h3>
          </div>
          {video.meta && (
            <span className="text-[7px] tracking-[0.3em] text-white/40 uppercase whitespace-nowrap mb-1">
              {video.meta}
            </span>
          )}
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
  const feature = videos.find(v => v.type === 'reel-feature');
  const mediums = videos.filter(v => v.type === 'reel-medium');
  const verticals = videos.filter(v => v.type === 'reel-vertical');

  if (loading || videos.length === 0) return null;

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-border/10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-16 space-y-4 md:space-y-8">
        {horizontals.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {horizontals.map(video => <VideoCard key={video.id} video={video} aspectRatio="aspect-video" onClick={setSelectedVideo} />)}
          </div>
        )}
        {feature && <VideoCard video={feature} aspectRatio="aspect-[21/9]" onClick={setSelectedVideo} />}
        {mediums.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {mediums.map(video => <VideoCard key={video.id} video={video} aspectRatio="aspect-[16/10]" onClick={setSelectedVideo} />)}
          </div>
        )}
        {verticals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {verticals.slice(0, 3).map(video => <VideoCard key={video.id} video={video} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />)}
          </div>
        )}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[190] bg-black/90 backdrop-blur-xl" />
          <DialogContent className="z-[200] max-w-[95vw] md:max-w-6xl bg-black border border-white/10 p-0 overflow-hidden rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Viewing project details</DialogDescription>
            {selectedVideo && (
              <div className="relative w-full h-full">
                <iframe className="w-full h-full" src={getFullUrl(selectedVideo.youtubeId)} frameBorder="0" allowFullScreen />
                <DialogClose className="absolute top-6 right-6 z-[220]">
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
