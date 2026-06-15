
import Image from 'next/image';

export function VaelAwards() {
  const awards = [
    { year: '2024', name: "D-Cut Honors", film: 'CleanTrip | Nation on Vacation', category: 'Directing' },
    { year: '2024', name: 'Grand Jury Prize', film: 'Amazon MX | Holiday Ft. Jackie', category: 'Best Promo' },
    { year: '2023', name: 'Craft Excellence', film: 'Asian Paints | Sleek Kitchens', category: 'VFX Design' },
    { year: '2023', name: 'Cinematic Storytelling', film: 'Realme | Capture The Light', category: 'Commercial' },
    { year: '2022', name: 'Regional Grand Prix', film: 'PolicyBazaar UAE | Bicycle', category: 'Humor' },
    { year: '2022', name: 'Best Casting', film: 'Prime Video | John Abraham', category: 'Promo' },
  ];

  return (
    <section id="awards" className="relative py-32 md:py-48 px-8 md:px-16 bg-background overflow-hidden border-t border-border/10">
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none">
        <Image src="https://picsum.photos/seed/awards-bg/1000/1500" alt="Cinematic Texture" fill className="object-cover" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.6em] uppercase text-primary block font-bold">Kinetic Archive</span>
            <h2 className="text-5xl md:text-8xl font-headline leading-[0.9] italic">
              Industry <br /> <span className="text-primary not-italic">Honors</span>
            </h2>
          </div>
          <div className="relative pt-12">
            <div className="text-[120px] md:text-[200px] font-headline font-light leading-none text-stroke absolute -top-12 -left-4 select-none opacity-20">26</div>
            <p className="relative z-10 text-muted-foreground font-body text-sm max-w-xs pl-8 leading-relaxed">
              Celebrating visual excellence and narrative innovation across global cinema stages.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {awards.map((award, i) => (
            <div key={i} className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-border hover:bg-white/[0.02] hover:px-8 transition-all duration-500 cursor-default">
              <div className="flex items-center gap-10">
                <span className="text-primary font-body text-[11px] tracking-widest font-bold min-w-[40px]">{award.year}</span>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-headline group-hover:text-primary transition-colors italic">{award.name}</h3>
                  <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body">{award.film}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="border border-primary/20 text-primary text-[9px] tracking-[0.3em] uppercase px-5 py-1.5 inline-block font-bold">
                  {award.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
