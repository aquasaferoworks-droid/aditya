'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import VideoPlayer from '@/components/VideoPlayer';

export function VaelHeader() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'work', 'awards', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top >= 0 && rect.top <= 300;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const reelVideo = "https://aquasaferoworks.sirv.com/1103193_1080p_Endurance_1280x720.mp4";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 md:px-16 md:py-8 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
      <Link href="/" className="font-headline text-2xl md:text-3xl tracking-[0.25em] hover:text-primary transition-all duration-500 uppercase flex-shrink-0 font-bold italic">
        ERROL ADITYA
      </Link>
      
      <div className="hidden md:flex items-center justify-center gap-12 font-body text-[10px] tracking-[0.4em] uppercase flex-grow">
        <Link href="#about" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'about' ? 'active text-primary font-bold' : ''}`}>
          About
        </Link>
        <Link href="#work" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'work' ? 'active text-primary font-bold' : ''}`}>
          Work
        </Link>
        <Link href="#awards" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'awards' ? 'active text-primary font-bold' : ''}`}>
          Recognition
        </Link>
        <Link href="#contact" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'contact' ? 'active text-primary font-bold' : ''}`}>
          Contact
        </Link>
      </div>

      <div className="flex-shrink-0 flex justify-end min-w-[150px]">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-none border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase h-auto py-2.5 px-6 transition-all duration-300 transform hover:-translate-y-0.5">
              Watch Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl bg-black border-white/10 p-0 rounded-none overflow-hidden aspect-video">
            <DialogTitle className="sr-only">2026 Directing Reel</DialogTitle>
            <DialogDescription className="sr-only">Watch Errol Aditya's cinematic directing reel.</DialogDescription>
            <div className="w-full h-full flex items-center justify-center">
              <VideoPlayer src={reelVideo} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
