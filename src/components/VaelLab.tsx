'use client';

import { useState } from 'react';
import { generateVisionTreatment } from '@/ai/flows/generate-vision-treatment';
import { generateScriptConcept } from '@/ai/flows/generate-script-concept';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Film, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">The Laboratory</span>
          <h2 className="text-4xl md:text-7xl font-headline italic">Vision <span className="text-primary not-italic">Augmentation</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground font-body text-sm leading-relaxed">
            Collaborative AI tools designed to push the boundaries of cinematic conceptualization. 
            Translate abstract premises into visceral visual treatments.
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                  Generate Visual Treatment
                </Button>
              </div>

              <div className="min-h-[300px] border border-border bg-background p-8 relative shadow-sm">
                {!visionResult && !isVisionLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                    <Film className="w-12 h-12 mb-4 text-primary" />
                    <p className="font-headline italic text-lg">Waiting for your vision...</p>
                  </div>
                )}
                {isVisionLoading && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-xs space-y-4 animate-pulse">
                      <div className="h-4 bg-primary/20 rounded w-3/4" />
                      <div className="h-4 bg-primary/10 rounded w-full" />
                      <div className="h-4 bg-primary/10 rounded w-5/6" />
                    </div>
                  </div>
                )}
                {visionResult && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary font-body">Atmosphere</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">{visionResult.atmosphereDescription}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary font-body">Cinematic Treatment</h4>
                      <p className="text-foreground text-sm leading-relaxed font-body whitespace-pre-wrap">{visionResult.cinematicTreatment}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                  Ideate Script Concept
                </Button>
              </div>

              <div className="min-h-[300px] border border-border bg-background p-8 relative shadow-sm">
                {!scriptResult && !isScriptLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                    <Sparkles className="w-12 h-12 mb-4 text-primary" />
                    <p className="font-headline italic text-lg">Define style and genre...</p>
                  </div>
                )}
                {isScriptLoading && (
                   <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-xs space-y-4 animate-pulse">
                      <div className="h-4 bg-accent/20 rounded w-3/4" />
                      <div className="h-4 bg-accent/10 rounded w-full" />
                      <div className="h-4 bg-accent/10 rounded w-5/6" />
                    </div>
                  </div>
                )}
                {scriptResult && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
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
                      <p className="text-foreground text-sm leading-relaxed font-body whitespace-pre-wrap border-l border-primary/20 pl-4">{scriptResult.sceneDirections}</p>
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
