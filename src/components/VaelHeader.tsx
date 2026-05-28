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
  DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

const navLinks = [
  { href: '#about', label: 'The Narrative' },
  { href: '#work', label: 'Filmography' },
  { href: '#awards', label: 'Honors' },
  { href: '#contact', label: 'Inquiry' },
];

export function VaelHeader() {
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 md:px-16 md:py-6 flex items-center justify-between ${isScrolled ? 'bg-black/95 backdrop-blur-xl border-b border-border/40 py-4 shadow-sm' : 'bg-transparent'}`}>
      <Link href="/" className="font-headline text-xl md:text-2xl tracking-[0.1em] hover:text-primary transition-all duration-700 flex-shrink-0 font-medium italic">
        ERROL <span className="text-primary not-italic font-light">ADITYA</span>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-center gap-12 font-body text-[9px] tracking-[0.4em] uppercase flex-grow">
        {navLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href} 
            className={`nav-link-strike hover:text-primary transition-colors ${activeSection === link.href.substring(1) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex-shrink-0 flex items-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="hidden sm:flex rounded-none border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-body text-[8px] tracking-[0.3em] uppercase h-auto py-2.5 px-6 transition-all duration-300 transform hover:-translate-y-0.5">
              Watch Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl bg-black border-none p-0 rounded-none overflow-hidden aspect-video shadow-[0_0_100px_rgba(0,0,0,0.9)]">
            <DialogTitle className="sr-only">2026 Directing Reel</DialogTitle>
            <DialogDescription className="sr-only">Cinematic showcase of Errol Aditya's directorial work.</DialogDescription>
            <div className="w-full h-full flex items-center justify-center relative group">
              <VideoPlayer src={reelVideo} />
              <DialogClose className="absolute top-6 right-6 z-[101] text-white/40 hover:text-white transition-colors">
                <X className="w-8 h-8" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-none hover:bg-primary/5">
              <Menu className="w-6 h-6 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-none p-12 w-[85vw] flex flex-col justify-between">
            <div className="space-y-16">
              <div className="font-headline text-xl tracking-[0.1em] italic text-white">
                ERROL <span className="text-primary not-italic font-light">ADITYA</span>
              </div>
              <div className="flex flex-col gap-8 font-body text-[11px] tracking-[0.5em] uppercase text-white/70">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="hover:text-primary transition-colors border-b border-border/40 pb-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <Button variant="outline" className="w-full rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-body text-[9px] tracking-[0.3em] uppercase h-auto py-4">
                Watch Reel
              </Button>
              <div className="flex gap-6 text-[10px] tracking-widest text-muted-foreground uppercase justify-center">
                <Link href="#">IG</Link>
                <Link href="#">VM</Link>
                <Link href="#">IM</Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
