import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function VaelHero() {
  return (
    <section id="hero" className="relative h-screen min-h-[700px] flex items-end overflow-hidden pb-20 px-8 md:px-16 bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_30%,rgba(193,108,39,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute inset-0 cinematic-vignette" />
      </div>

      <div className="absolute top-0 left-8 md:left-16 w-px h-[60%] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute right-12 top-1/2 -translate-y-1/2 writing-vertical-rl text-[10px] tracking-[0.4em] text-muted-foreground uppercase opacity-60">
        Director — DP — Storyteller
      </div>

      <div className="relative z-10 max-w-5xl animate-fade-in-up">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-body">Award-Winning Director</span>
        </div>

        <h1 className="font-headline text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] tracking-tighter mb-8 italic text-foreground">
          Between <br /> 
          the <span className="text-primary not-italic">light</span> & shadow
        </h1>

        <p className="max-w-md text-muted-foreground leading-relaxed text-sm md:text-base mb-10 font-body">
          Crafting cinematic worlds where emotion becomes visual poetry. 
          Architecture of light meets the visceral pulse of human narrative.
        </p>

        <div className="flex flex-wrap gap-6">
          <Button className="rounded-none bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground px-8 py-6 h-auto text-[11px] tracking-[0.2em] uppercase font-medium group" asChild>
            <Link href="#work">
              View Work
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="outline" className="rounded-none border-border text-muted-foreground hover:text-foreground hover:border-foreground px-8 py-6 h-auto text-[11px] tracking-[0.2em] uppercase" asChild>
            <Link href="#about">The Narrative</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 flex flex-col items-center gap-4 animate-scroll-pulse">
        <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground writing-vertical-rl">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
