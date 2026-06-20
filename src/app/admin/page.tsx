
'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, writeBatch, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Plus, Trash2, LayoutGrid, Film, Smartphone, Maximize, Box, List, Sparkles, Save } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Slider (Hero)', icon: Film },
  { value: 'reel-horizontal', label: 'Horizontal (Rows 1 & 2)', icon: LayoutGrid },
  { value: 'reel-feature', label: 'Large Feature (Row 3)', icon: Maximize },
  { value: 'reel-medium', label: 'Medium (Row 4)', icon: Box },
  { value: 'reel-vertical', label: 'Vertical (Row 5)', icon: Smartphone },
  { value: 'sidebar', label: 'Unlimited Sidebar Archive', icon: List },
];

const CATEGORIES = [
  'all',
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
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    upperText: '',
    lowerText: '',
    category: ['ads'] as string[],
    youtubeId: '',
    type: 'reel-horizontal',
    order: 0
  });

  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: rawVideos, loading: videosLoading } = useCollection(videosQuery);

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
    setIsAdding(true);
    try {
      await addDoc(collection(firestore, 'videos'), {
        ...formData,
        order: Number(formData.order) || 0,
        createdAt: serverTimestamp()
      });
      toast({ title: "Project Published to Series" });
      setFormData({ ...formData, title: '', upperText: '', lowerText: '', youtubeId: '', order: sortedVideos.length + 1 });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    if (!firestore) return;
    setIsUpdating(id);
    try {
      const docRef = doc(firestore, 'videos', id);
      await updateDoc(docRef, { order: Number(newOrder) });
      toast({ title: "Series Order Updated" });
    } catch (error: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (!confirm("Are you sure you want to remove this video from the series?")) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
      toast({ title: "Project Removed from Series" });
    } catch (error: any) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <VaelHeader />
      <div className="flex pt-32 md:pt-40 min-h-screen">
        {/* Sidebar Form */}
        <aside className="w-96 border-r border-white/5 bg-black/40 hidden lg:flex flex-col sticky top-40 h-[calc(100vh-10rem)] p-8 overflow-y-auto no-scrollbar">
          <div className="mb-10">
            <h2 className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold mb-2">Director's Studio</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Add new projects to your curated cinematic series.</p>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Placement Type</Label>
                <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                  <SelectTrigger className="rounded-none bg-background border-white/10 h-11 text-[10px] uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none bg-black border-white/10">
                    {PLACEMENT_TYPES.map(pt => (
                      <SelectItem key={pt.value} value={pt.value} className="text-[10px] uppercase cursor-pointer">
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Genres</Label>
                <div className="grid grid-cols-2 gap-2 border border-white/5 p-3 bg-black/20">
                  {CATEGORIES.filter(c => c !== 'all').map(cat => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${cat}`} 
                        checked={formData.category.includes(cat)} 
                        onCheckedChange={() => handleCategoryToggle(cat)} 
                        className="rounded-none border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black" 
                      />
                      <label htmlFor={`cat-${cat}`} className="text-[8px] uppercase tracking-widest cursor-pointer text-muted-foreground hover:text-white transition-colors">{cat}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Upper / Role</Label>
                <Input placeholder="Director / VFX" className="rounded-none bg-background border-white/10 h-11 text-xs focus-visible:ring-primary" value={formData.upperText} onChange={e => setFormData({...formData, upperText: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Lower / Brand</Label>
                <Input required placeholder="Netflix / Nike" className="rounded-none bg-background border-white/10 h-11 text-xs focus-visible:ring-primary" value={formData.lowerText} onChange={e => setFormData({...formData, lowerText: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">YouTube ID</Label>
                <Input required placeholder="v=..." className="rounded-none bg-background border-white/10 h-11 text-xs focus-visible:ring-primary" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Order Position</Label>
                <Input type="number" className="rounded-none bg-background border-white/10 h-11 text-xs focus-visible:ring-primary" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
              </div>
            </div>

            <Button type="submit" disabled={isAdding} className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-all">
              {isAdding ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="mr-2 w-4 h-4" />}
              Publish to Series
            </Button>
          </form>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto bg-black/20 no-scrollbar">
          <Tabs defaultValue="homepage" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-8">
              <h1 className="text-4xl md:text-7xl font-headline italic uppercase tracking-tighter leading-none">
                Series <span className="text-primary not-italic font-light">Archive</span>
              </h1>
              <TabsList className="bg-white/5 rounded-none p-1 h-auto self-start md:self-auto">
                <TabsTrigger value="homepage" className="rounded-none text-[10px] uppercase tracking-[0.2em] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-black">Homepage Series</TabsTrigger>
                <TabsTrigger value="sidebar" className="rounded-none text-[10px] uppercase tracking-[0.2em] px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-black">Unlimited Sidebar</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="homepage" className="space-y-12 mt-0">
              {PLACEMENT_TYPES.filter(p => p.value !== 'sidebar').map(section => {
                const videos = sortedVideos.filter(v => v.type === section.value);
                return (
                  <div key={section.value} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <section.icon className="w-4 h-4 text-primary" />
                      <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold">{section.label}</h2>
                      <div className="h-px flex-1 bg-white/5" />
                      <Badge variant="outline" className="text-[8px] rounded-none border-white/10 uppercase tracking-widest">{videos.length} Projects</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {videos.map(v => (
                        <div key={v.id} className="bg-white/[0.02] border border-white/5 p-4 flex flex-col md:flex-row items-center justify-between rounded-none group hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-24 aspect-video relative bg-black border border-white/5">
                              <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} className="object-cover w-full h-full opacity-60" />
                            </div>
                            <div>
                              <p className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold mb-1">{v.upperText}</p>
                              <h3 className="text-lg font-headline italic uppercase leading-none tracking-tight">{v.lowerText || v.title}</h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-end">
                            <div className="flex items-center gap-2 border border-white/10 p-1">
                              <span className="text-[9px] uppercase tracking-widest text-muted-foreground px-2">Pos:</span>
                              <Input 
                                type="number" 
                                className="w-16 h-8 rounded-none bg-black border-none text-[10px] text-center"
                                defaultValue={v.order}
                                onBlur={(e) => handleUpdateOrder(v.id, Number(e.target.value))}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:text-white"
                                onClick={() => {
                                  const input = (document.activeElement as HTMLInputElement);
                                  handleUpdateOrder(v.id, Number(input?.value || v.order));
                                }}
                              >
                                {isUpdating === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              </Button>
                            </div>
                            <button onClick={() => handleDelete(v.id)} className="text-white/20 hover:text-destructive p-3 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="sidebar" className="space-y-6 mt-0">
              <div className="flex items-center gap-4 mb-8">
                <List className="w-4 h-4 text-primary" />
                <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold">Unlimited Sidebar Archive</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedVideos.filter(v => v.type === 'sidebar').map(v => (
                  <div key={v.id} className="bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between rounded-none hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-24 aspect-video relative bg-black border border-white/5">
                        <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} className="object-cover w-full h-full opacity-60" />
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold mb-1">{v.upperText}</p>
                        <h3 className="text-base font-headline italic uppercase leading-none">{v.lowerText || v.title}</h3>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(v.id)} className="text-white/20 hover:text-destructive p-3 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
