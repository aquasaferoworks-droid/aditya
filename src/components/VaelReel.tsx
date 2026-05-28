
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface VideoCardProps {
  id: string;
  aspectRatio: string;
  className?: string;
}

const VideoCard = ({ id, aspectRatio, className = "" }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Chrome-less YouTube embed with autoplay, mute, and loop
  const getEmbedUrl = (id: string) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
  };

  return (
    <motion.div
      className={`relative overflow-hidden bg-black border border-white/5 group cursor-crosshair ${aspectRatio} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 z-0">
        <iframe
          className={`w-full h-full scale-[1.3] transition-transform duration-1000 ease-out ${isHovered ? 'scale-[1.4]' : ''}`}
          src={getEmbedUrl(id)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
      <div className="absolute inset-0 cinematic-vignette opacity-40 z-10" />
      
      {/* Animated Border on Hover - Cinematic Yellow */}
      <div className="absolute inset-0 border border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
    </motion.div>
  );
};

export function VaelReel() {
  return (
    <section id="reel" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-8 md:px-16 space-y-12">
        
        {/* Kinetic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
             <span className="text-[10px] tracking-[0.6em] uppercase text-primary font-bold block">
              Kinetic Archive — 2024
            </span>
            <h2 className="text-4xl md:text-7xl font-headline italic leading-[0.9]">
              Visual <span className="text-primary not-italic">Cadence</span>
            </h2>
          </div>
          <div className="w-24 h-px bg-primary/40 hidden md:block mb-4" />
        </div>

        {/* Row 1: 2 Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VideoCard id="gJKxIAmhbvg" aspectRatio="aspect-video" />
          <VideoCard id="QdEZtNyJb5g" aspectRatio="aspect-video" />
        </div>

        {/* Row 2: 2 Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VideoCard id="O1p-JVaAQV0" aspectRatio="aspect-video" />
          <VideoCard id="xTrPSfbWa0w" aspectRatio="aspect-video" />
        </div>

        {/* Row 3: 1 Large Featured Section */}
        <div className="w-full">
          <VideoCard id="4UATuJFYKfg" aspectRatio="aspect-[21/9] md:aspect-[21/9] aspect-video" />
        </div>

        {/* Row 4: 2 Medium Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VideoCard id="sroIT5FQMqs" aspectRatio="aspect-[16/10]" />
          <VideoCard id="BYhQMzGxHmg" aspectRatio="aspect-[16/10]" />
        </div>

        {/* Row 5: 4 Vertical Reel-Style Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <VideoCard id="eFhx307ykrk" aspectRatio="aspect-[9/16]" />
          <VideoCard id="lya8BHX-8SY" aspectRatio="aspect-[9/16]" />
          <VideoCard id="4UATuJFYKfg" aspectRatio="aspect-[9/16]" />
          <VideoCard id="gJKxIAmhbvg" aspectRatio="aspect-[9/16]" />
        </div>
        
      </div>
    </section>
  );
}
