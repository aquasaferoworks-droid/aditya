import Image from 'next/image';
import { Play } from 'lucide-react';

const films = [
  { id: 'gJKxIAmhbvg', tag: 'Feature', title: 'Hawthorn', meta: '2024 — 112 min', award: 'Cannes 2024' },
  { id: 'QdEZtNyJb5g', tag: 'Short', title: 'Vermilion', meta: '2023 — 28 min', award: 'Sundance 2023' },
  { id: 'O1p-JVaAQV0', tag: 'Documentary', title: 'Nocturne', meta: '2023 — 88 min', award: 'Berlin 2023' },
  { id: 'xTrPSfbWa0w', tag: 'Commercial', title: 'Aureate', meta: 'Brand Film — 4 min', award: 'Cannes Lions' },
  { id: '4UATuJFYKfg', tag: 'Narrative', title: 'Stillwater', meta: '2022 — 97 min', award: 'Venice 2022' },
  { id: 'sroIT5FQMqs', tag: 'Short', title: 'Echoes', meta: '2023 — 15 min', award: 'TIFF Nominee' },
  { id: 'BYhQMzGxHmg', tag: 'Commercial', title: 'Prism', meta: 'Commercial — 2 min', award: 'Clio Gold' },
  { id: 'eFhx307ykrk', tag: 'Documentary', title: 'Solace', meta: '2024 — 45 min', award: 'IDFA Selection' },
  { id: 'lya8BHX-8SY', tag: 'Commercial', title: 'Kinetic', meta: 'Fashion Film — 3 min', award: 'Vogue Awards' },
  { id: 'BG9F0xyy0RI', tag: 'Feature', title: 'Meridian', meta: '2022 — 105 min', award: 'Locarno Silver' },
  { id: 'hOBJXvR2n_8', tag: 'Short', title: 'Zenith', meta: '2021 — 12 min', award: 'Clermont-Ferrand' },
  { id: '2Y11kXDacR0', tag: 'Commercial', title: 'Flux', meta: 'Branded Content — 5 min', award: 'D&AD Pencil' },
  { id: 'WBE9PCT4Qk8', tag: 'Narrative', title: 'Origin', meta: '2021 — 82 min', award: 'Tribeca Winner' },
  { id: '6_FgbBV43q8', tag: 'Commercial', title: 'Apex', meta: 'Sport Film — 1 min', award: 'One Show' },
  { id: 'JWqyYj-9Gvs', tag: 'Experimental', title: 'Void', meta: '2024 — 8 min', award: 'SXSW Alt' },
];

export function VaelFilms() {
  return (
    <section id="work" className="py-32 bg-background px-8 md:px-16">
      <div className="max-w-7xl mx-auto mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">Filmography</span>
          <h2 className="text-5xl md:text-8xl font-headline leading-[0.9] italic">
            Director's <br /> <span className="text-primary not-italic">Catalog</span>
          </h2>
        </div>
        <p className="max-w-xs text-muted-foreground text-xs leading-relaxed font-body md:text-right">
          A visual odyssey through narrative, documentary, and commercial spaces. Every frame a decision, every silence a story.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 border border-border/20">
        {films.map((film, idx) => {
          const isLarge = idx === 0;
          return (
            <div 
              key={film.id} 
              className={`group relative overflow-hidden bg-black aspect-video cursor-pointer transition-all ${isLarge ? 'md:col-span-2 lg:col-span-2 md:aspect-[21/9]' : ''}`}
            >
              <Image 
                src={`https://img.youtube.com/vi/${film.id}/maxresdefault.jpg`} 
                alt={film.title}
                fill
                className="object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-16 h-16 rounded-full border border-primary/50 flex items-center justify-center bg-black/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary fill-primary" />
                </div>
              </div>

              {film.award && (
                <div className="absolute top-6 right-6 border border-primary/40 px-3 py-1 text-[9px] tracking-[0.2em] text-primary uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {film.award}
                </div>
              )}

              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                <span className="text-[9px] tracking-[0.4em] text-primary uppercase mb-2 block font-body">0{idx + 1} / {film.tag}</span>
                <h3 className="text-2xl md:text-4xl font-headline text-white mb-2 italic">{film.title}</h3>
                <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-body">{film.meta}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
}