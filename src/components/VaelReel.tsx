
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { getVideoType, getYoutubeThumbnail, extractYoutubeId } from '@/lib/video-utils';
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
  thumbnailUrl?: string;
  type: string;
  upperText?: string;
  lowerText?: string;
  upperTextSize?: number;
  lowerTextSize?: number;
  order?: number;
}

interface VaelReelProps {
  activeCategory: string;
}

const VideoCard = ({ video, aspectRatio, onClick }: { video: VideoItem, aspectRatio: string, onClick: (v: VideoItem) => void }) => {
  const ytId = extractYoutubeId(video.youtubeId);
  const thumbUrl = video.thumbnailUrl || (ytId ? getYoutubeThumbnail(ytId, 'hq') : null);

  return (
    <motion.div
      className={`relative overflow-hidden bg-black border border-white/5 group cursor-pointer ${aspectRatio} rounded-lg`}
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
            alt={video.upperText || "Video Entry"}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-100"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/5">
            <Video className="w-8 h-8" />
            <span className="text-[8px] tracking-widest font-medium">Media Required</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-15 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-8 flex flex-col justify-end transition-all duration-700 pointer-events-none translate-y-2 group-hover:translate-y-0">
        <h3 
          className="font-headline text-white font-medium italic tracking-tight leading-none truncate mb-1"
          style={{ fontSize: video.upperTextSize ? `${video.upperTextSize}px` : '24px' }}
        >
          {video.upperText}
        </h3>
        <span 
          className="text-primary font-medium block tracking-tight italic"
          style={{ fontSize: video.lowerTextSize ? `${video.lowerTextSize}px` : '13px' }}
        >
          {video.lowerText}
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
    if (activeCategory === 'All') return true;
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
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-8 md:space-y-12">
        
        <div className="flex items-center gap-6 mb-4">
          <span className="text-[12px] tracking-tight text-primary font-medium italic whitespace-nowrap">{activeCategory} Archive</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {horizontals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {horizontals.map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {features.length > 0 && (
          <div className="w-full">
            {features.map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video md:aspect-[21/9]" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {mediums.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {mediums.map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
            ))}
          </div>
        )}

        {verticals.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {verticals.map((v) => (
              <VideoCard key={v.id} video={v} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogPortal>
          <DialogOverlay className="z-[400] bg-black/95 backdrop-blur-sm" />
          <DialogContent className="z-[500] max-w-5xl w-[95vw] bg-black border border-white/10 p-0 overflow-hidden shadow-2xl rounded-lg aspect-video focus:outline-none">
            <DialogTitle className="sr-only">{selectedVideo?.upperText}</DialogTitle>
            <DialogDescription className="sr-only">Viewing project: {selectedVideo?.upperText}</DialogDescription>
            {selectedVideo && (
              <UnifiedVideoPlayer url={selectedVideo.youtubeId} />
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </section>
  );
}
