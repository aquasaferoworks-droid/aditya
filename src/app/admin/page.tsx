'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Plus, Trash2, ExternalLink, LayoutGrid, Film, Smartphone, Maximize, List, CheckCircle2 } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { value: 'slider', label: 'Scroll Videos (Hero Slider)', icon: Film },
  { value: 'reel-horizontal', label: 'Small Box (Horizontal)', icon: LayoutGrid },
  { value: 'reel-medium', label: 'Small Box (Medium)', icon: LayoutGrid },
  { value: 'reel-vertical', label: 'Vertical Videos (9:16)', icon: Smartphone },
  { value: 'reel-feature', label: 'Big Videos (Wide Feature)', icon: Maximize },
  { value: 'film-gallery', label: 'Filmography List', icon: List },
];

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    youtubeId: '',
    type: 'slider',
    role: '',
    meta: '',
    award: '',
    order: 0
  });

  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: videos, loading: videosLoading } = useCollection(videosQuery);

  const extractYoutubeId = (urlOrId: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
      toast({ title: "Error", description: "Firebase not initialized", variant: "destructive" });
      return;
    }
    
    setIsAdding(true);
    const cleanId = extractYoutubeId(formData.youtubeId);

    try {
      await addDoc(collection(firestore, 'videos'), {
        ...formData,
        youtubeId: cleanId,
        order: Number(formData.order),
        createdAt: serverTimestamp()
      });
      
      toast({ title: "Success", description: `${formData.title} published to archive.` });
      
      setFormData({
        title: '',
        category: '',
        youtubeId: '',
        type: formData.type, // Keep same type for multi-add
        role: '',
        meta: '',
        award: '',
        order: (videos?.length || 0) + 1
      });
    } catch (error: any) {
      console.error('Error adding video', error);
      toast({ title: "Publishing Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
      toast({ title: "Deleted", description: "Entry removed from archive." });
    } catch (error: any) {
      console.error('Error deleting video', error);
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <VaelHeader />
      
      <div className="flex pt-24 min-h-screen">
        <aside className="w-80 border-r border-white/5 bg-card/20 hidden lg:flex flex-col sticky top-24 h-[calc(100vh-6rem)] p-8 overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold mb-4">Archive Manager</h2>
            <p className="text-muted-foreground text-[11px] leading-relaxed uppercase tracking-wider">
              Control center for the cinematic archive. Add and categorize films directly.
            </p>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Placement Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={val => setFormData({...formData, type: val})}
                >
                  <SelectTrigger className="rounded-none bg-background border-white/10 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none bg-black border-white/10">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-[10px] uppercase tracking-widest">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Project Title</Label>
                <Input 
                  required
                  placeholder="e.g., HAWTHORN" 
                  className="rounded-none bg-background border-white/10 h-11"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">YouTube ID or URL</Label>
                <Input 
                  required
                  placeholder="Paste URL or ID..." 
                  className="rounded-none bg-background border-white/10 h-11"
                  value={formData.youtubeId}
                  onChange={e => setFormData({...formData, youtubeId: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Category/Tag</Label>
                  <Input 
                    placeholder="Narrative..." 
                    className="rounded-none bg-background border-white/10 h-11"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Order</Label>
                  <Input 
                    type="number"
                    className="rounded-none bg-background border-white/10 h-11"
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isAdding}
              className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-white hover:text-black transition-all"
            >
              {isAdding ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 w-4 h-4" />}
              {isAdding ? 'Publishing...' : 'Publish Film'}
            </Button>
          </form>
        </aside>

        <div className="flex-1 p-8 md:p-16">
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-headline italic font-bold tracking-tighter uppercase">
                Active <span className="text-primary not-italic font-light">Archive</span>
              </h1>
              <div className="flex items-center gap-6">
                 <div className="w-12 h-px bg-primary/30" />
                 <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
                   {videos?.length || 0} Cinematic Entries Synchronized
                 </span>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
              {videosLoading && (
                <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] tracking-widest uppercase">Fetching Vault...</p>
                </div>
              )}
              
              {!videosLoading && videos?.map((video) => {
                const category = CATEGORIES.find(c => c.value === video.type);
                const CategoryIcon = category?.icon || Film;

                return (
                  <div key={video.id} className="bg-card/20 border border-white/5 p-4 flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-32 aspect-video bg-black relative overflow-hidden flex-shrink-0 border border-white/5">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                          alt="" 
                          className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-headline italic tracking-tight uppercase">{video.title}</h3>
                        <div className="flex items-center gap-3">
                          <CategoryIcon className="w-3 h-3 text-primary" />
                          <span className="text-[8px] uppercase tracking-[0.2em] text-primary font-bold">
                            {category?.label.split('(')[0]}
                          </span>
                          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">•</span>
                          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{video.category || 'NO TAG'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://youtube.com/watch?v=${video.youtubeId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(video.id)}
                        className="p-3 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!videosLoading && (!videos || videos.length === 0) && (
                <div className="py-32 text-center border border-dashed border-white/10">
                  <p className="italic font-headline text-lg opacity-20">The archive is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
