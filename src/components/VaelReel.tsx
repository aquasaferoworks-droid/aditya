'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { getVideoType, getYoutubeThumbnail } from '@/lib/video-utils';
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';
import { Video } from 'lucide-react';
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
  const vType = getVideoType(video.youtubeId);
  const thumbUrl = vType === 'youtube' ? getYoutubeThumbnail(video.youtubeId, 'hq') : null;

  return (
    <motion.div
      className={`relative overflow-hidden bg-black border border-white/5 group cursor-pointer ${aspectRatio} rounded-none`}
      onClick={() => onClick(video)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {thumbUrl ? (
          <Image 
            src={thumbUrl}
            alt={video.title || "Video Entry"}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50 group-hover:opacity-100"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/5">
            <Video className="w-8 h-8" />
            <span className="text-[8px] uppercase tracking-widest font-bold">Direct Source</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-15 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-8 flex flex-col justify-end transition-all duration-700 pointer-events-none translate-y-2 group-hover:translate-y-0">
        <h3 className="text-sm md:text-2xl font-headline text-white italic tracking-tighter uppercase leading-none truncate mb-1">
          {video.upperText}
        </h3>
        <span className="text-[7px] md:text-[9px] tracking-[0.5em] text-primary uppercase font-bold block">
          {video.lowerText || video.title}
        </span>
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

  const filteredVideos = (allVideos as VideoItem[] || []).filter(v => {
    if (activeCategory === 'all') return true;
    const categories = Array.isArray(v.category) ? v.category : [v.category];
    return categories.some(c => c?.toLowerCase() === activeCategory.toLowerCase());
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  const horizontals = filteredVideos.filter(v => v.type === 'reel-horizontal');
  const features = filteredVideos.filter(v => v.type === 'reel-feature');
  const mediums = filteredVideos.filter(v => v.type === 'reel-medium');
  const verticals = filteredVideos.filter(v => v.type === 'reel-vertical');

  if (loading) return null;
  if (filteredVideos.length === 0) return null;

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-4 md:space-y-12">
        
        <div className="flex items-center gap-6 mb-8">
          <span className="text-[10px] tracking-[0.8em] uppercase text-primary font-bold whitespace-nowrap">{activeCategory}</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {horizontals.slice(0, 2).length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-12">
            {horizontals.slice(0, 2).map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {horizontals.slice(2, 4).length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-12">
            {horizontals.slice(2, 4).map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {features.slice(0, 1).length > 0 && (
          <div className="w-full">
            {features.slice(0, 1).map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video md:aspect-[21/9]" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {mediums.slice(0, 2).length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:gap-12">
            {mediums.slice(0, 2).map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {verticals.slice(0, 4).length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
            {verticals.slice(0, 4).map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 mt-24">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] tracking-[0.8em] uppercase text-primary/40 font-bold whitespace-nowrap">{activeCategory}</span>
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[400] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[500] max-w-[95vw] md:max-w-7xl bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-none aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">Viewing project: {selectedVideo?.title}</DialogDescription>
            {selectedVideo && (
              <UnifiedVideoPlayer url={selectedVideo.youtubeId} />
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}
