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
    <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 md:px-16 md:py-8 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-border/50">
      <Link href="/" className="font-headline text-2xl md:text-3xl tracking-[0.1em] hover:text-primary transition-all duration-700 flex-shrink-0 font-medium italic">
        ERROL <span className="text-primary not-italic font-light">ADITYA</span>
      </Link>
      
      <div className="hidden md:flex items-center justify-center gap-14 font-body text-[9px] tracking-[0.5em] uppercase flex-grow">
        <Link href="#about" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'about' ? 'active' : ''}`}>
          The Narrative
        </Link>
        <Link href="#work" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'work' ? 'active' : ''}`}>
          Filmography
        </Link>
        <Link href="#awards" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'awards' ? 'active' : ''}`}>
          Honors
        </Link>
        <Link href="#contact" className={`nav-link-strike hover:text-primary transition-colors ${activeSection === 'contact' ? 'active' : ''}`}>
          Inquiry
        </Link>
      </div>

      <div className="flex-shrink-0 flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-body text-[9px] tracking-[0.3em] uppercase h-auto py-3 px-8 transition-all duration-300 transform hover:-translate-y-0.5">
              Watch Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl bg-black border-none p-0 rounded-none overflow-hidden aspect-video shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <DialogTitle className="sr-only">2026 Directing Reel</DialogTitle>
            <DialogDescription className="sr-only">Cinematic showcase of Errol Aditya's directorial work.</DialogDescription>
            <div className="w-full h-full flex items-center justify-center">
              <VideoPlayer src={reelVideo} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}