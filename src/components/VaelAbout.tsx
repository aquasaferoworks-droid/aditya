import VideoPlayer from '@/components/VideoPlayer';
import { ShineBorder } from '@/components/ui/shine-border';

export function VaelAbout() {
  return (
    <section id="about" className="py-32 md:py-48 px-8 md:px-16 bg-gradient-to-b from-background via-card to-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div className="relative w-full lg:sticky lg:top-32">
          {/* Custom Video Player in About with Shine Border */}
          <ShineBorder 
            borderRadius={0} 
            borderWidth={1.5} 
            duration={8} 
            color={["hsl(var(--primary))", "white", "hsl(var(--primary))"]}
            className="w-full min-w-0 p-0 bg-transparent overflow-hidden shadow-2xl"
          >
            <VideoPlayer src="https://aquasaferoworks.sirv.com/1103193_1080p_Endurance_1280x720.mp4" />
          </ShineBorder>
          
          <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-primary/20 -z-10" />
          <div className="absolute top-10 right-[-10px] writing-vertical-rl text-[10px] tracking-[0.5em] text-primary/40 uppercase font-body font-bold">
            Director / Visionary
          </div>
        </div>

        <div className="space-y-16">
          <div className="space-y-8">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold block">The Narrative</span>
            <h2 className="text-5xl md:text-7xl font-headline leading-tight">
              Where <span className="text-primary font-normal">silence</span> <br /> speaks loudest.
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed font-body text-base md:text-lg max-w-xl">
              <p>
                With over a decade behind the lens, Errol Aditya has carved a singular language in world cinema — intimate yet epic, quiet yet thunderous. From global festivals to commercial excellence, the work speaks before any word is said.
              </p>
              <p>
                Rooted in the belief that every frame holds a heartbeat, Errol collaborates with ambitious brands, studios, and storytellers to create images that endure beyond the screen.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-border/50">
              <div className="space-y-2">
                <div className="text-4xl md:text-6xl font-headline font-bold">24</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body">Films Directed</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-6xl font-headline font-bold text-primary">12</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body">Festival Awards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
