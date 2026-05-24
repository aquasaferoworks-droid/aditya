import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function VaelContact() {
  return (
    <section id="contact" className="py-32 md:py-48 px-8 md:px-16 bg-background border-t border-border/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">Get in Touch</span>
            <h2 className="text-5xl md:text-8xl font-headline leading-[0.9] italic">
              Let&apos;s make <br /> <span className="text-primary not-italic">something</span> <br /> beautiful.
            </h2>
            <p className="max-w-md text-muted-foreground font-body leading-relaxed">
              Whether you have a story that needs a vision, or a vision that needs a story — the conversation begins here.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary">Studio Email</span>
              <a href="mailto:studio@erroladitya.com" className="text-2xl font-headline hover:text-primary transition-colors italic">studio@erroladitya.com</a>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary">Representation</span>
              <p className="text-2xl font-headline italic">WME — Creative Artists</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary">Locations</span>
              <p className="text-lg md:text-2xl font-headline italic">Mumbai / London / New York</p>
            </div>
          </div>
        </div>

        <div className="bg-card/30 p-8 md:p-12 border border-border/10 space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 border-b border-border/40 focus-within:border-primary transition-colors">
                <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">Your Name</span>
                <Input className="border-none bg-transparent h-12 rounded-none px-0 focus-visible:ring-0 text-foreground" placeholder="Full name" />
              </div>
              <div className="space-y-2 border-b border-border/40 focus-within:border-primary transition-colors">
                <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">Email Address</span>
                <Input className="border-none bg-transparent h-12 rounded-none px-0 focus-visible:ring-0 text-foreground" placeholder="hello@domain.com" />
              </div>
            </div>
            <div className="space-y-2 border-b border-border/40 focus-within:border-primary transition-colors">
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">Inquiry Type</span>
              <Input className="border-none bg-transparent h-12 rounded-none px-0 focus-visible:ring-0 text-foreground" placeholder="Narrative, Commercial, Music Video..." />
            </div>
            <div className="space-y-2 border-b border-border/40 focus-within:border-primary transition-colors">
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">Project Vision</span>
              <Textarea className="border-none bg-transparent rounded-none px-0 focus-visible:ring-0 min-h-[120px] text-foreground resize-none" placeholder="Tell us about the project context..." />
            </div>
          </div>
          <Button className="w-full md:w-auto rounded-none bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground px-12 py-6 h-auto text-[11px] tracking-[0.2em] uppercase font-bold transition-all transform hover:-translate-y-1">
            Send Inquiry
          </Button>
        </div>
      </div>
    </section>
  );
}
