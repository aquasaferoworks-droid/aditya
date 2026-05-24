import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function VaelAbout() {
  const portrait = PlaceHolderImages.find(img => img.id === 'portrait');
  const onset = PlaceHolderImages.find(img => img.id === 'on-set');

  return (
    <section id="about" className="py-32 md:py-48 px-8 md:px-16 bg-gradient-to-b from-background via-card to-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="relative aspect-[4/5] md:aspect-square">
          <div className="absolute top-0 left-0 w-[75%] h-[70%] z-10 overflow-hidden shadow-2xl">
            {portrait && (
              <Image 
                src={portrait.imageUrl} 
                alt={portrait.description}
                fill
                className="object-cover"
                data-ai-hint={portrait.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
          </div>
          <div className="absolute bottom-0 right-0 w-[60%] h-[50%] z-20 overflow-hidden shadow-2xl border border-background">
             {onset && (
              <Image 
                src={onset.imageUrl} 
                alt={onset.description}
                fill
                className="object-cover"
                data-ai-hint={onset.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/10 to-transparent pointer-events-none" />
          </div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-primary/20 -z-10" />
          <div className="absolute top-10 right-[-10px] writing-vertical-rl text-[10px] tracking-[0.5em] text-primary/40 uppercase">
            Est. 2010
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">The Narrative</span>
            <h2 className="text-4xl md:text-6xl font-headline leading-tight italic">
              Where <span className="text-primary not-italic">silence</span> <br /> speaks loudest.
            </h2>
            <p className="text-muted-foreground leading-relaxed font-body text-base md:text-lg">
              With over a decade behind the lens, Errol Aditya has carved a singular language in world cinema — intimate yet epic, quiet yet thunderous. From global festivals to commercial excellence, the work speaks before any word is said.
            </p>
            <p className="text-muted-foreground leading-relaxed font-body text-sm md:text-base">
              Rooted in the belief that every frame holds a heartbeat, Errol collaborates with ambitious brands, studios, and storytellers to create images that endure beyond the screen.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border">
            {[
              { val: '24', label: 'Films Directed' },
              { val: '12', label: 'Festival Awards' },
              { val: '80+', label: 'Global Clients' },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-5xl font-headline text-primary">{stat.val}</div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
