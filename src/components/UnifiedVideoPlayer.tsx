'use client';

import React, { useState, useEffect } from 'react';
import { getVideoType, getYoutubeEmbedUrl, extractYoutubeId } from '@/lib/video-utils';
import VideoPlayer from './VideoPlayer';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedVideoPlayerProps {
  url: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-video" or "aspect-[21/9]"
}

export function UnifiedVideoPlayer({ url, className, aspectRatio = "aspect-video" }: UnifiedVideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const type = getVideoType(url);
  
  useEffect(() => {
    setLoading(true);
    setError(false);
    console.log(`Initializing Unified Player for: ${url} (Type: ${type})`);
  }, [url, type]);

  if (!url) return null;

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    console.error("Iframe failed to load or experienced an error");
    setError(true);
    setLoading(false);
  };

  return (
    <div className={cn("relative w-full h-full bg-black overflow-hidden group", aspectRatio, className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="sr-only">Loading cinematic content...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div className="space-y-2">
            <h3 className="text-lg font-headline italic uppercase tracking-tighter">Playback Restricted</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-xs mx-auto">
              This video cannot be played inside the website due to source restrictions.
            </p>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-[10px] text-primary uppercase font-bold tracking-[0.2em] border border-primary/20 px-6 py-3 hover:bg-primary hover:text-black transition-all"
          >
            Watch on Source <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {type === 'youtube' ? (
        <iframe
          src={getYoutubeEmbedUrl(url)}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      ) : type === 'direct' ? (
        <div className="w-full h-full" onLoadCapture={handleIframeLoad}>
          <VideoPlayer src={url} />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Unsupported Video Source</p>
          <p className="text-[10px] text-white/40 mt-2 truncate max-w-xs">{url}</p>
        </div>
      )}
    </div>
  );
}
