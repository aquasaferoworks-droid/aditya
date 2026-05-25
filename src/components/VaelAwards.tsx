import Image from 'next/image';

export function VaelAwards() {
  const awards = [
    { year: '2024', name: "Palme d'Or Nomination", film: 'Cannes Film Festival — Hawthorn', category: 'Best Director' },
    { year: '2024', name: 'Grand Jury Prize', film: 'Sundance Film Festival — Vermilion', category: 'Short Film' },
    { year: '2023', name: 'Silver Bear — Special Jury', film: 'Berlin International Film Festival — Nocturne', category: 'Documentary' },
    { year: '2023', name: 'BAFTA — Outstanding Film', film: 'British Academy Film Awards — Nocturne', category: 'Nominee' },
    { year: '2022', name: 'Cannes Lions Grand Prix', film: 'Film Craft — Aureate for Chanel', category: 'Commercial' },
    { year: '2022', name: 'Venice Golden Lion Nom', film: 'La Biennale di Venezia — Stillwater', category: 'Feature' },
  ];

  return (
    <section id="awards" className="relative py-32 md:py-48 px-8 md:px-16 bg-background overflow-hidden">
      {/* Background Cinematic Texture - Grayscale removed */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none">
        <Image 
          src="https://picsum.photos/seed/awards-bg/1000/1500" 
          alt="Cinematic Texture" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">Recognition</span>
            <h2 className="text-5xl md:text-8xl font-headline leading-[0.9] italic">
              Festival <br /> <span className="text-primary not-italic">Honors</span>
            </h2>
          </div>
          <div className="relative pt-12">
            <div className="text-[120px] md:text-[200px] font-headline font-light leading-none text-stroke absolute -top-12 -left-4 select-none opacity-20">23</div>
            <p className="relative z-10 text-muted-foreground font-body text-sm max-w-xs pl-8">
              International awards and nominations celebrating visual excellence and narrative innovation across global cinema stages.
            </p>
          </div>
          
          <div className="hidden lg:block relative aspect-video w-full mt-12 border border-border overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/festival/800/450" 
              alt="Festival Appearance" 
              fill 
              className="object-cover hover:scale-105 transition-all duration-700"
              data-ai-hint="film festival"
            />
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {awards.map((award, i) => (
            <div 
              key={i} 
              className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-border hover:bg-card/40 hover:px-6 transition-all duration-500 cursor-default"
            >
              <div className="flex items-center gap-10">
                <span className="text-primary font-body text-[11px] tracking-widest font-bold min-w-[40px]">{award.year}</span>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-headline group-hover:text-primary transition-colors">{award.name}</h3>
                  <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase font-body">{award.film}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="border border-primary/20 text-primary text-[9px] tracking-[0.2em] uppercase px-4 py-1 inline-block">
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
