"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-white rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
};

const VideoPlayer = ({ src }: { src: string }) => {
  const [mounted, setMounted] = useState(false);
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isYouTube) {
    let videoId = '';
    if (src.includes('v=')) {
      videoId = src.split('v=')[1]?.split('&')[0];
    } else {
      videoId = src.split('/').pop()?.split('?')[0] || '';
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&autoplay=1&mute=1&loop=1&playlist=${videoId}`;

    return (
      <div className="relative w-full aspect-video overflow-hidden clean-video-wrapper bg-black">
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="scale-[1.05]"
        />
        <div className="absolute inset-0 z-10 pointer-events-none" />
      </div>
    );
  }

  // Native Video Player fallback logic preserved
  return (
    <div className="relative w-full aspect-video bg-black">
      <video src={src} className="w-full h-full object-cover" controls />
    </div>
  );
};

export default VideoPlayer;