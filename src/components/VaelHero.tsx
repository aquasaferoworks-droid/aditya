import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function VaelHero() {
  return (
    <section id="hero" className="relative h-screen min-h-[700px] flex items-end overflow-hidden pb-20 px-8 md:px-16 bg-black">
      {/* Cinematic Video Background - Restored to normal scale */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          poster="https://picsum.photos/seed/vael-hero/1920/1080"
        >
          <source 
            src="https://player.vimeo.com/external/494252666.hd.mp4?s=2f5577346418342774d009fa5d60893325c8991b&profile_id=175" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        <div className="absolute inset-0 grain-overlay opacity-10" />
        <div className="absolute inset-0 cinematic-vignette opacity-50" />
      </div>

      <div className="absolute top-0 left-8 md:left-16 w-px h-[60%] bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
      
      <div className="relative z-10 max-w-5xl animate-fade-in-up">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-body font-bold">2026 Directing Reel</span>
        </div>

        <h1 className="font-headline text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] tracking-tighter mb-8 italic text-white mix-blend-difference">
          Architecture <br /> 
          of <span className="text-primary not-italic">Emotion</span>
        </h1>

        <p className="max-w-md text-white/90 leading-relaxed text-sm md:text-base mb-10 font-body backdrop-blur-sm bg-black/10 p-4 border-l border-primary/30">
          Between light and shadow. A singular language in world cinema — intimate yet epic, quiet yet thunderous.
        </p>

        <div className="flex flex-wrap gap-6">
          <Button className="rounded-none bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground px-8 py-6 h-auto text-[11px] tracking-[0.2em] uppercase font-bold group" asChild>
            <Link href="#reel">
              <Play className="mr-2 w-4 h-4 fill-current" />
              Play Reel
            </Link>
          </Button>
          <Button variant="outline" className="rounded-none border-white/40 text-white hover:bg-white hover:text-black px-8 py-6 h-auto text-[11px] tracking-[0.2em] uppercase transition-all" asChild>
            <Link href="#work">Explore Work</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 flex flex-col items-center gap-4 animate-scroll-pulse">
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/60 writing-vertical-rl">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
