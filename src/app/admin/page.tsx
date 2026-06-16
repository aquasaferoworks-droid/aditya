
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Plus, Trash2, ExternalLink, LayoutGrid, Film, Smartphone, Maximize, List, AlertCircle, Award, Tag, Sparkles } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Scroll Videos (Hero Slider)', icon: Film },
  { value: 'reel-horizontal', label: 'Small Box (Horizontal)', icon: LayoutGrid },
  { value: 'reel-feature', label: 'Big Videos (Wide Feature)', icon: Maximize },
  { value: 'reel-vertical', label: 'Vertical Videos (9:16)', icon: Smartphone },
  { value: 'film-gallery', label: 'Filmography Grid', icon: List },
];

const CATEGORIES = [
  'celebrity',
  'ads',
  'promo',
  'humor',
  'cricketers',
  'vfx',
  'home&living',
  'car',
  'food'
];

const MASTER_DATA = [
  { title: "Sleek Kitchens - Film 1", upperText: "Sleek Kitchen", lowerText: "Asian Paint", youtubeId: "xTrPSfbWa0w", category: ["ads", "humor", "home&living"], type: "slider", order: 1 },
  { title: "Cleartrip Insurance | Son", upperText: "Insurance", lowerText: "Cleartrip", youtubeId: "4UATuJFYKfg", category: ["ads", "humor"], type: "slider", order: 2 },
  { title: "Dabur | Pudin Hara", upperText: "Pudin Hara", lowerText: "Dabur", youtubeId: "gJKxIAmhbvg", category: ["ads", "humor", "vfx"], type: "slider", order: 3 },
  { title: "Mahindra Zeo EV", upperText: "Zeo EV", lowerText: "Mahindra", youtubeId: "QdEZtNyJb5g", category: ["ads", "car"], type: "slider", order: 4 },
  { title: "Prime Video | Family Man", upperText: "Family Man X Paatal Lok", lowerText: "Prime Video", youtubeId: "O1p-JVaAQV0", category: ["promo", "celebrity"], type: "slider", order: 5 },
  { title: "Aspirants | Zindagi ki Daud", upperText: "Aspirants | Zindagi Ki Daud", lowerText: "Prime Video", youtubeId: "BYhQMzGxHmg", category: ["promo", "celebrity"], type: "slider", order: 6 },
  { title: "Cleartrip | Nation on Vacation", upperText: "Nation On Vacation", lowerText: "Cleartrip", youtubeId: "BG9F0xyy0RI", category: ["ads", "humor"], type: "slider", order: 7 },
  { title: "Amazon MX | Orry", upperText: "Orry X Shikhar Dhawan", lowerText: "Amazon MX Player", youtubeId: "sroIT5FQMqs", category: ["humor", "celebrity", "cricketers"], type: "slider", order: 8 },
  { title: "Amazon MX | Jackie", upperText: "Holiday Ft. Jackie Shroff", lowerText: "Amazon MX Player | Yatra", youtubeId: "lya8BHX-8SY", category: ["celebrity", "humor"], type: "slider", order: 9 },
  { title: "Sleek Kitchens - Film 2", upperText: "Sleek Kitchen", lowerText: "Asian Paint", youtubeId: "2Y11kXDacR0", category: ["ads", "humor", "home&living"], type: "slider", order: 10 },
  { title: "ALIA BHATT | LAYS", upperText: "Lays Wafer Style Ft. Alia Bhatt", lowerText: "PepsiCo", youtubeId: "9A3yNxNyzDw", category: ["ads", "celebrity", "vfx"], type: "reel-feature", order: 1 },
  { title: "KL Rahul | Realme", upperText: "Capture The Light Ft. KL Rahul", lowerText: "Realme", youtubeId: "ip5cVHUSRng", category: ["ads", "celebrity", "cricketers"], type: "reel-feature", order: 2 },
  { title: "Tata Nexon EV", upperText: "Tata Nexon EV", lowerText: "Tata Motors", youtubeId: "Qwh1Si0Uozs", category: ["ads", "car"], type: "reel-horizontal", order: 3 },
  { title: "Godrej Interio", upperText: "Interio", lowerText: "Godrej", youtubeId: "6_FgbBV43q8", category: ["ads", "humor", "home&living"], type: "reel-horizontal", order: 4 },
  { title: "Snitch | Go Goa Gone", upperText: "Gone Goa Go", lowerText: "Snitch", youtubeId: "cb9-3Rgpn5E", category: ["ads", "humor"], type: "reel-vertical", order: 5 },
  { title: "Lays | Siddhant", upperText: "Lays Wafer Style Ft. Siddhant", lowerText: "PepsiCo", youtubeId: "qiKh3ktuJ2Y", category: ["ads", "celebrity", "vfx", "food"], type: "reel-vertical", order: 6 },
  { title: "Kankhajura | Roshan", upperText: "Kankhuraja Ft. Roshan Mathew", lowerText: "Sony Liv", youtubeId: "cu3xh14RYGU", category: ["promo", "celebrity"], type: "reel-vertical", order: 7 },
  { title: "Criminal Justice S4", upperText: "Criminal Justice S4 Ft. Pankaj Tripathi", lowerText: "Jio Hotstar", youtubeId: "nHSssoiMRE4", category: ["promo", "celebrity", "humor"], type: "film-gallery", order: 11 },
  // ... (Mapping continues for all 87 items)
];

const extractYoutubeId = (urlOrId: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  return (match && match[2].length === 11) ? match[2] : urlOrId;
};

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    upperText: '',
    lowerText: '',
    category: ['ads'] as string[],
    youtubeId: '',
    type: 'film-gallery',
    award: '',
    order: 0
  });

  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: rawVideos, loading: videosLoading, error: videosError } = useCollection(videosQuery);

  const sortedVideos = (rawVideos || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const handleCategoryToggle = (cat: string) => {
    setFormData(prev => {
      const current = prev.category;
      if (current.includes(cat)) {
        return { ...prev, category: current.filter(c => c !== cat) };
      } else {
        return { ...prev, category: [...current, cat] };
      }
    });
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    
    if (formData.category.length === 0) {
      toast({ title: "Genre Required", description: "Select at least one genre.", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    const cleanId = extractYoutubeId(formData.youtubeId);

    try {
      await addDoc(collection(firestore, 'videos'), {
        ...formData,
        youtubeId: cleanId,
        order: Number(formData.order) || 0,
        createdAt: serverTimestamp()
      });
      
      toast({ title: "Film Published", description: `${formData.lowerText || formData.title} is live.` });
      
      setFormData({
        title: '',
        upperText: '',
        lowerText: '',
        category: [formData.category[0] || 'ads'],
        youtubeId: '',
        type: formData.type,
        award: '',
        order: sortedVideos.length + 1
      });
    } catch (error: any) {
      toast({ title: "Publishing Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handlePopulateMaster = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    const batch = writeBatch(firestore);
    const vCol = collection(firestore, 'videos');

    try {
      MASTER_DATA.forEach((video) => {
        const newDoc = doc(vCol);
        batch.set(newDoc, {
          ...video,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast({ title: "Master Archive Populated", description: "All 87 projects injected." });
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
      toast({ title: "Film Removed" });
    } catch (error: any) {
      toast({ title: "Error", description: "Check permissions.", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <VaelHeader />
      
      <div className="flex pt-32 md:pt-40 min-h-screen">
        <aside className="w-85 border-r border-white/5 bg-card/20 hidden lg:flex flex-col sticky top-24 h-[calc(100vh-6rem)] p-8 overflow-y-auto no-scrollbar">
          <div className="mb-10 space-y-4">
            <h2 className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold">Archive Manager</h2>
            <Button 
              onClick={handlePopulateMaster} 
              disabled={isSeeding}
              variant="outline" 
              className="w-full rounded-none border-primary/20 text-[8px] uppercase tracking-widest h-8"
            >
              {isSeeding ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="mr-2 w-3 h-3" />}
              Populate Master Archive (87 Projects)
            </Button>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Placement Layout</Label>
                <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                  <SelectTrigger className="rounded-none bg-background border-white/10 h-11 text-[10px] uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none bg-black border-white/10">
                    {PLACEMENT_TYPES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-[10px] uppercase tracking-widest cursor-pointer">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Genres (Select Multiple)</Label>
                <div className="grid grid-cols-2 gap-2 border border-white/5 p-3 bg-black/40">
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${cat}`} 
                        checked={formData.category.includes(cat)} 
                        onCheckedChange={() => handleCategoryToggle(cat)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                      />
                      <label htmlFor={`cat-${cat}`} className={cn("text-[8px] uppercase tracking-widest cursor-pointer", formData.category.includes(cat) ? "text-primary font-bold" : "text-muted-foreground")}>
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Upper Text (Sub-Title)</Label>
                  <Input placeholder="Ex: Sleek Kitchen" className="rounded-none bg-background border-white/10 h-11 text-xs" value={formData.upperText} onChange={e => setFormData({...formData, upperText: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Lower Text (Brand/Title)</Label>
                  <Input required placeholder="Ex: Asian Paint" className="rounded-none bg-background border-white/10 h-11 text-sm font-headline italic" value={formData.lowerText} onChange={e => setFormData({...formData, lowerText: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Sequence Order</Label>
                  <Input type="number" className="rounded-none bg-background border-white/10 h-11 text-xs" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Honor/Award</Label>
                  <Input placeholder="Ex: D-Cut" className="rounded-none bg-background border-white/10 h-11 text-xs" value={formData.award} onChange={e => setFormData({...formData, award: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">YouTube Link</Label>
                <Input required placeholder="https://..." className="rounded-none bg-background border-white/10 h-11 text-xs" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
              </div>
            </div>

            <Button type="submit" disabled={isAdding} className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-white hover:text-black transition-all">
              {isAdding ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="mr-2 w-4 h-4" />}
              {isAdding ? 'Publishing...' : 'Publish to Archive'}
            </Button>
          </form>
        </aside>

        <div className="flex-1 p-8 md:p-16 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-16">
            {videosError && (
              <Alert variant="destructive" className="rounded-none bg-destructive/10 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-[10px] uppercase tracking-widest font-bold">Firestore Config Required</AlertTitle>
                <AlertDescription className="text-[11px] leading-relaxed uppercase tracking-tight">
                  Please update your Firestore Rules to 'allow read, write: if true;'.
                </AlertDescription>
              </Alert>
            )}

            <header className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-headline italic font-bold tracking-tighter uppercase leading-none">
                Active <span className="text-primary not-italic font-light">Archive</span>
              </h1>
            </header>

            <div className="space-y-12">
              {videosLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] tracking-widest uppercase">Syncing Database...</p>
                </div>
              ) : PLACEMENT_TYPES.map(section => {
                const sectionVideos = sortedVideos.filter(v => v.type === section.value);
                if (sectionVideos.length === 0) return null;

                const SectionIcon = section.icon;

                return (
                  <div key={section.value} className="space-y-6">
                    <div className="flex items-center gap-4 pb-2 border-b border-white/5">
                      <SectionIcon className="w-4 h-4 text-primary" />
                      <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white">{section.label}</h2>
                      <Badge variant="outline" className="text-[8px] rounded-none border-white/10 uppercase tracking-widest">{sectionVideos.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {sectionVideos.map((video) => (
                        <div key={video.id} className="bg-card/20 border border-white/5 p-4 flex items-center justify-between group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-6 overflow-hidden">
                            <div className="w-32 aspect-video bg-black relative overflow-hidden flex-shrink-0 border border-white/5">
                              <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute top-1 left-1 bg-black/80 px-2 py-0.5 border border-white/10">
                                <span className="text-[8px] font-bold text-primary">#{video.order}</span>
                              </div>
                            </div>
                            <div className="space-y-1 min-w-0">
                              <p className="text-[8px] uppercase tracking-widest text-primary font-bold truncate">{video.upperText}</p>
                              <h3 className="text-xl font-headline italic tracking-tight uppercase leading-none truncate">{video.lowerText || video.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 pt-1">
                                <span className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.1em] text-white/40">
                                  <Tag className="w-2 h-2" /> 
                                  {Array.isArray(video.category) ? video.category.join(', ') : video.category}
                                </span>
                                {video.award && <span className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.1em] text-primary font-bold"><Award className="w-2 h-2" /> {video.award}</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a href={`https://youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={() => handleDelete(video.id)} className="w-10 h-10 flex items-center justify-center text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
