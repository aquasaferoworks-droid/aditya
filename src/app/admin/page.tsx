
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Plus, Trash2, ExternalLink, LayoutGrid, Film, Smartphone, Maximize, List, AlertCircle, Hash } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Scroll Videos (Hero Slider)', icon: Film },
  { value: 'reel-horizontal', label: 'Small Box (Horizontal)', icon: LayoutGrid },
  { value: 'reel-medium', label: 'Small Box (Medium)', icon: LayoutGrid },
  { value: 'reel-vertical', label: 'Vertical Videos (9:16)', icon: Smartphone },
  { value: 'reel-feature', label: 'Big Videos (Wide Feature)', icon: Maximize },
  { value: 'film-gallery', label: 'Filmography List', icon: List },
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

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'ads',
    youtubeId: '',
    type: 'slider',
    role: 'Director',
    meta: '',
    award: '',
    order: 0
  });

  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: rawVideos, loading: videosLoading, error: videosError } = useCollection(videosQuery);

  // Suggested next order logic
  useEffect(() => {
    if (rawVideos && rawVideos.length > 0) {
      const maxOrder = Math.max(...rawVideos.map((v: any) => Number(v.order) || 0));
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [rawVideos]);

  const sortedVideos = (rawVideos || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const extractYoutubeId = (urlOrId: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    
    setIsAdding(true);
    const cleanId = extractYoutubeId(formData.youtubeId);

    try {
      await addDoc(collection(firestore, 'videos'), {
        ...formData,
        youtubeId: cleanId,
        order: Number(formData.order) || 0,
        createdAt: serverTimestamp()
      });
      
      toast({ title: "Film Published", description: `${formData.title} is now live.` });
      
      setFormData({
        title: '',
        category: formData.category,
        youtubeId: '',
        type: formData.type,
        role: 'Director',
        meta: '',
        award: '',
        order: (sortedVideos?.length || 0) + 1
      });
    } catch (error: any) {
      console.error('Error adding film:', error);
      toast({ 
        title: "Publishing Failed", 
        description: "Check permissions and internet connection.", 
        variant: "destructive" 
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
      toast({ title: "Film Removed", description: "Project has been archived." });
    } catch (error: any) {
      toast({ title: "Removal Failed", description: "Access denied.", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <VaelHeader />
      
      <div className="flex pt-32 md:pt-40 min-h-screen">
        {/* Management Sidebar */}
        <aside className="w-80 border-r border-white/5 bg-card/20 hidden lg:flex flex-col sticky top-24 h-[calc(100vh-6rem)] p-8 overflow-y-auto no-scrollbar">
          <div className="mb-10">
            <h2 className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold mb-4">Archive Control</h2>
            <p className="text-muted-foreground text-[11px] leading-relaxed uppercase tracking-wider">
              Add new visuals to specific layout anchors.
            </p>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Placement Type</Label>
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

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Genre Category</Label>
                <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                  <SelectTrigger className="rounded-none bg-background border-white/10 h-11 text-[10px] uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none bg-black border-white/10">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-[10px] uppercase tracking-widest cursor-pointer">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Film Title</Label>
                <Input required placeholder="Ex: Nocturne" className="rounded-none bg-background border-white/10 h-11 text-sm font-headline italic" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">YouTube Link/ID</Label>
                <Input required placeholder="https://..." className="rounded-none bg-background border-white/10 h-11 text-sm" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Display Order</Label>
                  <span className="text-[8px] text-primary uppercase font-bold tracking-widest animate-pulse">Auto-incremented</span>
                </div>
                <Input type="number" className="rounded-none bg-background border-white/10 h-11 text-sm" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                <p className="text-[8px] text-muted-foreground italic uppercase">Lower numbers appear first.</p>
              </div>
            </div>

            <Button type="submit" disabled={isAdding} className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-white hover:text-black transition-all">
              {isAdding ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="mr-2 w-4 h-4" />}
              {isAdding ? 'Publishing...' : 'Publish to Archive'}
            </Button>
          </form>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-16">
            {videosError && (
              <Alert variant="destructive" className="rounded-none bg-destructive/10 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-[10px] uppercase tracking-widest font-bold">Permissions Required</AlertTitle>
                <AlertDescription className="text-[11px] leading-relaxed opacity-80 uppercase tracking-tight">
                  Your Firestore Rules are blocking access. Please update your rules in the Firebase Console to 'allow read, write: if true;' to enable direct public management.
                </AlertDescription>
              </Alert>
            )}

            <header className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-headline italic font-bold tracking-tighter uppercase leading-none">
                Active <span className="text-primary not-italic font-light">Archive</span>
              </h1>
              <div className="flex items-center gap-6">
                 <div className="w-12 h-px bg-primary/30" />
                 <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-bold">
                   {sortedVideos?.length || 0} Cinematic Entries Live
                 </span>
              </div>
            </header>

            {/* Grouped Video List */}
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
                          <div className="flex items-center gap-6">
                            <div className="w-32 aspect-video bg-black relative overflow-hidden flex-shrink-0 border border-white/5">
                              <img 
                                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                                alt="" 
                                className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" 
                              />
                              <div className="absolute top-1 left-1 bg-black/80 px-2 py-0.5 border border-white/10">
                                <span className="text-[8px] font-bold text-primary">#{video.order}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xl font-headline italic tracking-tight uppercase leading-none">{video.title}</h3>
                              <div className="flex items-center gap-3">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-primary font-bold">{video.category || 'ADS'}</span>
                                <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">•</span>
                                <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{video.role || 'DIRECTOR'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <a 
                              href={`https://youtube.com/watch?v=${video.youtubeId}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors border border-transparent hover:border-white/5"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button 
                              onClick={() => handleDelete(video.id)} 
                              className="w-10 h-10 flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {!videosLoading && (!sortedVideos || sortedVideos.length === 0) && (
                <div className="py-32 text-center border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                  <Film className="w-12 h-12 text-white/10" />
                  <p className="italic font-headline text-2xl opacity-20 uppercase tracking-widest">The archive is empty</p>
                  <p className="text-[10px] tracking-widest text-muted-foreground uppercase max-w-xs mx-auto">Use the sidebar on the left to add your first cinematic project.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
