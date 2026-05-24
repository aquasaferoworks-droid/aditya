'use client';

import { useState } from 'react';
import { generateVisionTreatment } from '@/ai/flows/generate-vision-treatment';
import { generateScriptConcept } from '@/ai/flows/generate-script-concept';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Film, Lightbulb, PlayCircle } from 'lucide-react';
import Image from 'next/image';

export function VaelLab() {
  const [premise, setPremise] = useState('');
  const [visionResult, setVisionResult] = useState<any>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  const [lighting, setLighting] = useState('');
  const [genre, setGenre] = useState('');
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  const handleVisionGenerate = async () => {
    if (!premise) return;
    setIsVisionLoading(true);
    try {
      const res = await generateVisionTreatment({ storyPremise: premise });
      setVisionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVisionLoading(false);
    }
  };

  const handleScriptGenerate = async () => {
    if (!lighting || !genre) return;
    setIsScriptLoading(true);
    try {
      const res = await generateScriptConcept({ lightingStyle: lighting, filmGenre: genre });
      setScriptResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScriptLoading(false);
    }
  };

  return (
    <section id="lab" className="py-32 md:py-48 px-8 md:px-16 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">R&D / Process</span>
          <h2 className="text-4xl md:text-7xl font-headline italic">Director's <span className="text-primary not-italic">Lab</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground font-body text-sm leading-relaxed">
            Collaborative AI tools to translate abstract sparks into cinematic treatments. 
            Bridge the gap between vision and execution.
          </p>
        </div>

        <Tabs defaultValue="treatment" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-background border p-1 rounded-none h-auto gap-2">
              <TabsTrigger 
                value="treatment" 
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] tracking-[0.2em] uppercase px-8 py-3 h-auto"
              >
                Vision Treatment
              </TabsTrigger>
              <TabsTrigger 
                value="script" 
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] tracking-[0.2em] uppercase px-8 py-3 h-auto"
              >
                Concept Lab
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="treatment" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Story Premise</Label>
                  <Textarea 
                    placeholder="Enter a brief narrative spark..." 
                    className="min-h-[160px] bg-background border-border focus-visible:ring-primary rounded-none font-body text-sm p-6"
                    value={premise}
                    onChange={(e) => setPremise(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleVisionGenerate} 
                  disabled={isVisionLoading || !premise}
                  className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[11px] tracking-[0.2em] uppercase group"
                >
                  {isVisionLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2 w-4 h-4" />}
                  Generate Treatment
                </Button>
              </div>

              <div className="min-h-[400px] border border-border bg-background relative shadow-sm overflow-hidden">
                {!visionResult && !isVisionLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="relative w-full aspect-video mb-6 grayscale opacity-20">
                       <Image 
                        src="https://picsum.photos/seed/lab1/800/450" 
                        alt="Lab Preview" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <p className="font-headline italic text-lg opacity-40">Waiting for your vision...</p>
                  </div>
                )}
                {isVisionLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background/80 backdrop-blur-sm z-10">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-[10px] tracking-widest uppercase text-primary animate-pulse">Rendering Cinematic Data...</p>
                  </div>
                )}
                {visionResult && (
                  <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
                     <div className="relative w-full aspect-video border border-primary/20 overflow-hidden">
                        <Image 
                          src="https://picsum.photos/seed/rendered-vision/800/450" 
                          alt="Rendered Reference" 
                          fill 
                          className="object-cover" 
                          data-ai-hint="cinematic reference"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                           <PlayCircle className="w-4 h-4 text-white" />
                           <span className="text-[9px] uppercase tracking-widest text-white">Visual Mood Reference</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary font-body">Atmosphere</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">{visionResult.atmosphereDescription}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary font-body">Cinematic Treatment</h4>
                      <p className="text-foreground text-sm leading-relaxed font-body whitespace-pre-wrap border-l border-primary/20 pl-4">{visionResult.cinematicTreatment}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Lighting Style</Label>
                      <Input 
                        placeholder="Noir, Chiaroscuro..." 
                        className="bg-background border-border focus-visible:ring-primary rounded-none h-12"
                        value={lighting}
                        onChange={(e) => setLighting(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Film Genre</Label>
                      <Input 
                        placeholder="Sci-Fi, Western..." 
                        className="bg-background border-border focus-visible:ring-primary rounded-none h-12"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleScriptGenerate} 
                  disabled={isScriptLoading || !lighting || !genre}
                  className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[11px] tracking-[0.2em] uppercase group"
                >
                  {isScriptLoading ? <Loader2 className="mr-2 animate-spin" /> : <Lightbulb className="mr-2 w-4 h-4" />}
                  Ideate Script
                </Button>
              </div>

              <div className="min-h-[400px] border border-border bg-background relative shadow-sm overflow-hidden">
                {!scriptResult && !isScriptLoading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="relative w-full aspect-video mb-6 grayscale opacity-20">
                       <Image 
                        src="https://picsum.photos/seed/lab2/800/450" 
                        alt="Lab Preview" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <p className="font-headline italic text-lg opacity-40">Define style and genre...</p>
                  </div>
                )}
                {isScriptLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background/80 backdrop-blur-sm z-10">
                    <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
                    <p className="text-[10px] tracking-widest uppercase text-accent animate-pulse">Analyzing Story Structures...</p>
                  </div>
                )}
                {scriptResult && (
                  <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="relative w-full aspect-[21/9] border border-accent/20 overflow-hidden">
                        <Image 
                          src="https://picsum.photos/seed/script-viz/800/450" 
                          alt="Script Visualizer" 
                          fill 
                          className="object-cover" 
                          data-ai-hint="film storyboard"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                           <span className="text-[8px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-1">Concept Viz</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary font-body">Storytelling Hooks</h4>
                      <ul className="space-y-2 list-none">
                        {scriptResult.storytellingHooks.map((hook: string, i: number) => (
                          <li key={i} className="text-muted-foreground text-sm flex gap-3 italic">
                            <span className="text-primary not-italic font-bold">{i+1}.</span> {hook}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary font-body">Scene Directions</h4>
                      <p className="text-foreground text-sm leading-relaxed font-body whitespace-pre-wrap border-l border-primary/20 pl-4 italic">{scriptResult.sceneDirections}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
