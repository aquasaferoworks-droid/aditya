import Link from 'next/link';

export function VaelFooter() {
  return (
    <footer className="py-12 md:py-16 px-8 md:px-16 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-8 bg-background">
      <div className="font-headline text-xl tracking-[0.15em] uppercase">ERROL ADITYA</div>
      
      <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase text-center md:text-left">
        © 2026 erroladitya.com. Architecting Light & Narrative.
      </p>

      <div className="flex gap-8 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        <Link href="#" className="hover:text-primary transition-colors">Instagram</Link>
        <Link href="#" className="hover:text-primary transition-colors">Vimeo</Link>
        <Link href="#" className="hover:text-primary transition-colors">IMDb</Link>
      </div>
    </footer>
  );
}
