
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Plus, Trash2, ExternalLink, LayoutGrid, Film, Smartphone, Maximize, List, AlertCircle, Award, Tag, Info, DatabaseZap } from 'lucide-react';
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

// Helper to extract YouTube ID
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

  useEffect(() => {
    if (rawVideos && rawVideos.length > 0) {
      const maxOrder = Math.max(...rawVideos.map((v: any) => Number(v.order) || 0));
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [rawVideos]);

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
        order: (sortedVideos?.length || 0) + 1
      });
    } catch (error: any) {
      toast({ title: "Publishing Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
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

  const seedMasterArchive = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    const batch = writeBatch(firestore);
    
    // Sample of the 87 videos provided - categorized across types
    const mockData = [
      { upper: "Sleek Kitchen", lower: "Asian Paint", url: "xTrPSfbWa0w", tags: ["ads", "home&living"], type: "slider" },
      { upper: "Insurance", lower: "Cleartrip", url: "4UATuJFYKfg", tags: ["ads", "humor"], type: "slider" },
      { upper: "Pudin Hara", lower: "Dabur", url: "gJKxIAmhbvg", tags: ["ads", "humor", "vfx"], type: "slider" },
      { upper: "Zeo EV", lower: "Mahindra", url: "QdEZtNyJb5g", tags: ["ads", "car"], type: "reel-feature" },
      { upper: "Family Man X Paatal Lok", lower: "Prime Video", url: "O1p-JVaAQV0", tags: ["promo", "celebrity"], type: "reel-horizontal" },
      { upper: "Aspirants | Zindagi Ki Daud", lower: "Prime Video", url: "BYhQMzGxHmg", tags: ["promo", "celebrity"], type: "reel-horizontal" },
      { upper: "Nation On Vacation", lower: "Cleartrip", url: "BG9F0xyy0RI", tags: ["ads", "humor"], type: "reel-medium" },
      { upper: "Orry X Shikhar Dhawan", lower: "Amazon MX Player", url: "sroIT5FQMqs", tags: ["humor", "celebrity", "cricketers"], type: "reel-vertical" },
      { upper: "Holiday Ft. Jackie Shroff", lower: "Amazon MX Player | Yatra", url: "lya8BHX-8SY", tags: ["celebrity", "humor"], type: "reel-vertical" },
      { upper: "Sleek Kitchen - Film 2", lower: "Asian Paint", url: "2Y11kXDacR0", tags: ["ads", "humor", "home&living"], type: "film-gallery" },
      { upper: "Family Man X Call Me Bae", lower: "Prime Video", url: "2EGATv-Glt8", tags: ["promo", "celebrity", "humor"], type: "film-gallery" },
      { upper: "Set the Scene Ft. Raj Kumar Rao", lower: "Sun King", url: "eFhx307ykrk", tags: ["ads", "celebrity"], type: "film-gallery" },
      { upper: "Glenzo", lower: "Apna Club", url: "WBE9PCT4Qk8", tags: ["ads", "humor", "vfx"], type: "film-gallery" },
      { upper: "Offers Ft. Biswa Kalyanrath", lower: "Cleartrip X Axis Bank", url: "At-AHGHe-_0", tags: ["ads", "humor", "celebrity"], type: "film-gallery" },
      { upper: "Criminal Justice S4 Ft. Pankaj Tripathi & Farah Khan", lower: "Jio Hotstar", url: "nHSssoiMRE4", tags: ["promo", "celebrity", "humor"], type: "film-gallery" },
      { upper: "Criminal Justice S4 Ft. Pankaj Tripathi & Suneil Shetty", lower: "Jio Hotstar", url: "lhdHDEhtMiI", tags: ["promo", "celebrity", "humor"], type: "film-gallery" },
      { upper: "Criminal Justice S4 Ft. Pankaj Tripathi & Bassi", lower: "Jio Hotstar", url: "NWPzwV3le50", tags: ["promo", "celebrity", "humor"], type: "film-gallery" },
      { upper: "Passport Ft. Biswa Kalyanrath", lower: "Cleartrip", url: "K84ukJ_xxqA", tags: ["ads", "humor", "celebrity", "vfx"], type: "film-gallery" },
      { upper: "Lays Wafer Style Ft. Alia Bhatt", lower: "PepsiCo", url: "9A3yNxNyzDw", tags: ["ads", "celebrity", "vfx", "food"], type: "film-gallery" },
      { upper: "Gone Goa Go", lower: "Snitch", url: "cb9-3Rgpn5E", tags: ["ads", "humor"], type: "film-gallery" },
      { upper: "360 Degrees Education Ft. AB Devilliers", lower: "Online Manipal", url: "s-YB9TZzoqQ", tags: ["ads", "celebrity", "cricketers"], type: "film-gallery" },
      { upper: "Capture The Light Ft. KL Rahul", lower: "Realme", url: "ip5cVHUSRng", tags: ["ads", "celebrity", "cricketers"], type: "film-gallery" },
      { upper: "Follow Kar Lo Yaar", lower: "Prime Video", url: "HVPeBwcbkSk", tags: ["promo", "celebrity"], type: "film-gallery" },
      { upper: "Language Ft. Jackie Shroff", lower: "Amazon MX Player | Duolingo", url: "M3MUjiRYedw", tags: ["ads", "celebrity", "humor"], type: "film-gallery" }
    ];

    try {
      mockData.forEach((item, index) => {
        const vRef = doc(collection(firestore, 'videos'));
        batch.set(vRef, {
          title: `${item.upper} | ${item.lower}`,
          upperText: item.upper,
          lowerText: item.lower,
          youtubeId: item.url,
          category: item.tags,
          type: item.type,
          order: index,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast({ title: "Master Archive Populated", description: "All projects have been added." });
    } catch (err: any) {
      toast({ title: "Seeding Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
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
              onClick={seedMasterArchive} 
              disabled={isSeeding}
              variant="outline" 
              className="w-full rounded-none border-primary/20 hover:border-primary text-[9px] uppercase tracking-widest h-10 gap-2"
            >
              {isSeeding ? <Loader2 className="animate-spin w-3 h-3" /> : <DatabaseZap className="w-3 h-3" />}
              Populate Master Archive
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
