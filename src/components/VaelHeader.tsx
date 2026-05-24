import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function VaelHeader() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 md:px-16 md:py-8 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
      <Link href="/" className="font-headline text-2xl tracking-[0.15em] hover:text-primary transition-colors uppercase">
        erroladitya.com
      </Link>
      
      <div className="hidden md:flex items-center gap-12 font-body text-[10px] tracking-[0.25em] uppercase">
        <Link href="#about" className="hover:text-primary transition-colors">About</Link>
        <Link href="#work" className="hover:text-primary transition-colors">Work</Link>
        <Link href="#lab" className="hover:text-primary transition-colors">Director Lab</Link>
        <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
      </div>

      <Button variant="outline" className="rounded-none border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase h-auto py-2 px-6" asChild>
        <Link href="#reel">Watch Reel</Link>
      </Button>
    </nav>
  );
}
