
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { getYoutubeThumbnail, extractYoutubeId } from '@/lib/video-utils';
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
            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-100"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/5">
            <Video className="w-8 h-8" />
            <span className="text-[8px] tracking-widest font-medium">Media Required</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-15 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-8 flex flex-col justify-end transition-all duration-700 pointer-events-none">
        <h3 
          className="font-headline text-white font-bold tracking-tight leading-none truncate mb-1"
          style={{ fontSize: video.upperTextSize ? `${video.upperTextSize}px` : '30px' }}
        >
          {video.upperText}
        </h3>
        <span 
          className="text-primary font-medium block tracking-tight"
          style={{ fontSize: video.lowerTextSize ? `${video.lowerTextSize}px` : '20px' }}
        >
          {video.lowerText}
        </span>
      </div>
    </motion.div>
  );
};

const ROW_SEQUENCE = [
  { id: 'row-1-2-horizontal', layout: 'horizontal', label: 'Row 1 & 2' },
  { id: 'row-3-feature', layout: 'feature', label: 'Row 3' },
  { id: 'row-4-medium', layout: 'horizontal', label: 'Row 4' },
  { id: 'row-5-vertical', layout: 'vertical', label: 'Row 5' },
  { id: 'row-6-feature', layout: 'feature', label: 'Row 6' },
  { id: 'row-7-8-horizontal', layout: 'horizontal', label: 'Row 7 & 8' },
  { id: 'row-9-feature', layout: 'feature', label: 'Row 9' },
  { id: 'row-10-11-horizontal', layout: 'horizontal', label: 'Row 10 & 11' },
  { id: 'row-12-feature', layout: 'feature', label: 'Row 12' },
  { id: 'row-13-vertical', layout: 'vertical', label: 'Row 13' },
  { id: 'row-14-21-horizontal', layout: 'horizontal', label: 'Row 14-21' },
  { id: 'row-22-feature', layout: 'feature', label: 'Row 22' },
  { id: 'row-23-horizontal', layout: 'horizontal', label: 'Row 23' },
  { id: 'row-24-feature', layout: 'feature', label: 'Row 24' },
  { id: 'row-25-26-horizontal', layout: 'horizontal', label: 'Row 25 & 26' },
  { id: 'row-27-feature', layout: 'feature', label: 'Row 27' },
  { id: 'row-28-29-horizontal', layout: 'horizontal', label: 'Row 28 & 29' },
  { id: 'row-30-feature', layout: 'feature', label: 'Row 30' },
];

export function VaelReel({ activeCategory }: VaelReelProps) {
  const firestore = useFirestore();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const reelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: allVideos, loading } = useCollection(reelQuery);

  if (loading || !allVideos) return null;

  const filteredVideos = (allVideos as VideoItem[]).filter(v => {
    if (activeCategory.toLowerCase() === 'all') return true;
    const categories = Array.isArray(v.category) ? v.category : [v.category];
    return categories.some(c => c?.toLowerCase() === activeCategory.toLowerCase());
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-24">
        
        {ROW_SEQUENCE.map((row) => {
          const rowVideos = filteredVideos.filter(v => v.type === row.id);
          if (rowVideos.length === 0) return null;

          return (
            <div key={row.id} className="space-y-12">
              <div className="flex items-center gap-6">
                <span className="text-[13px] tracking-tight text-primary font-medium whitespace-nowrap">{row.label}</span>
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] tracking-widest text-white/20 uppercase font-medium">{activeCategory}</span>
              </div>

              {row.layout === 'horizontal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  {rowVideos.map((v) => (
                    <VideoCard key={v.id} video={v} aspectRatio="aspect-video" onClick={setSelectedVideo} />
                  ))}
                </div>
              )}

              {row.layout === 'feature' && (
                <div className="w-full">
                  {rowVideos.map((v) => (
                    <VideoCard key={v.id} video={v} aspectRatio="aspect-video md:aspect-[21/9]" onClick={setSelectedVideo} />
                  ))}
                </div>
              )}

              {row.layout === 'vertical' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                  {rowVideos.map((v) => (
                    <VideoCard key={v.id} video={v} aspectRatio="aspect-[9/16]" onClick={setSelectedVideo} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
