
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Trash2, LayoutGrid, Film, Smartphone, Maximize, Box, List, Instagram, Youtube, Facebook, Twitter, Phone } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Hero Slider', icon: Film },
  { value: 'reel-horizontal', label: 'Row 1 & 2 (Horizontal)', icon: LayoutGrid },
  { value: 'reel-feature', label: 'Row 3 (Feature)', icon: Maximize },
  { value: 'reel-medium', label: 'Row 4 (Medium)', icon: Box },
  { value: 'reel-vertical', label: 'Row 5 (Vertical)', icon: Smartphone },
  { value: 'sidebar', label: 'Unlimited Archive', icon: List },
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
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    upperText: '',
    lowerText: '',
    category: ['ads'] as string[],
    youtubeId: '',
    type: 'reel-horizontal',
    order: 0
  });

  const [contactSettings, setContactSettings] = useState({
    email: '',
    representation: '',
    locations: '',
    formHeading: '',
    formDescription: '',
    instagram: '',
    youtube: '',
    whatsapp: '',
    facebook: '',
    twitter: ''
  });

  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: rawVideos, loading: videosLoading } = useCollection(videosQuery);
  const { data: settingsDoc, loading: settingsLoading } = useDoc(firestore ? doc(firestore, 'settings', 'contact') : null);

  useEffect(() => {
    if (settingsDoc) {
      setContactSettings({
        email: settingsDoc.email || '',
        representation: settingsDoc.representation || '',
        locations: settingsDoc.locations || '',
        formHeading: settingsDoc.formHeading || '',
        formDescription: settingsDoc.formDescription || '',
        instagram: settingsDoc.instagram || '',
        youtube: settingsDoc.youtube || '',
        whatsapp: settingsDoc.whatsapp || '',
        facebook: settingsDoc.facebook || '',
        twitter: settingsDoc.twitter || ''
      });
    }
  }, [settingsDoc]);

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
      toast({ title: "Project Published" });
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
      toast({ title: "Order Updated" });
    } catch (error: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (!confirm("Remove this project?")) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
      toast({ title: "Project Removed" });
    } catch (error: any) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsSavingSettings(true);
    try {
      await setDoc(doc(firestore, 'settings', 'contact'), contactSettings);
      toast({ title: "Settings Updated" });
    } catch (error: any) {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <VaelHeader />
      <div className="flex pt-32 min-h-screen">
        <aside className="w-96 border-r border-white/5 bg-black/40 flex flex-col sticky top-32 h-[calc(100vh-8rem)] p-8 overflow-y-auto no-scrollbar">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="bg-white/5 rounded-none p-1 w-full grid grid-cols-2 mb-8">
              <TabsTrigger value="videos" className="rounded-none text-[10px] uppercase tracking-widest py-3 font-bold">Series</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none text-[10px] uppercase tracking-widest py-3 font-bold">Contact Us</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-6">
              <form onSubmit={handleAddVideo} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Placement</Label>
                    <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                      <SelectTrigger className="rounded-none bg-background border-white/10 h-10 text-[10px] uppercase font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none bg-black border-white/10">
                        {PLACEMENT_TYPES.map(pt => (
                          <SelectItem key={pt.value} value={pt.value} className="text-[10px] uppercase font-bold">{pt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Genres</Label>
                    <div className="grid grid-cols-2 gap-2 border border-white/5 p-3 bg-black/20">
                      {CATEGORIES.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`cat-${cat}`} 
                            checked={formData.category.includes(cat)} 
                            onCheckedChange={() => handleCategoryToggle(cat)} 
                            className="rounded-none border-white/20" 
                          />
                          <label htmlFor={`cat-${cat}`} className="text-[8px] uppercase tracking-widest cursor-pointer font-bold">{cat}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Information</Label>
                    <Input placeholder="DIRECTOR / ROLE" className="rounded-none bg-background border-white/10 h-10 text-xs" value={formData.upperText} onChange={e => setFormData({...formData, upperText: e.target.value})} />
                    <Input required placeholder="BRAND / TITLE" className="rounded-none bg-background border-white/10 h-10 text-xs" value={formData.lowerText} onChange={e => setFormData({...formData, lowerText: e.target.value})} />
                    <Input required placeholder="YOUTUBE ID" className="rounded-none bg-background border-white/10 h-10 text-xs" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
                    <Input type="number" placeholder="SERIES ORDER" className="rounded-none bg-background border-white/10 h-10 text-xs" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                  </div>
                </div>
                <Button type="submit" disabled={isAdding} className="w-full rounded-none bg-primary text-black text-[10px] tracking-widest uppercase font-bold py-6">
                  {isAdding ? <Loader2 className="animate-spin" /> : 'Publish Entry'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Page Content</Label>
                  <Input placeholder="HEADING (e.g. Contact Us)" className="rounded-none bg-background border-white/10 h-10 text-xs" value={contactSettings.formHeading} onChange={e => setContactSettings({...contactSettings, formHeading: e.target.value})} />
                  <Textarea placeholder="SHORT WELCOME MESSAGE" className="rounded-none bg-background border-white/10 min-h-[100px] text-xs" value={contactSettings.formDescription} onChange={e => setContactSettings({...contactSettings, formDescription: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Studio Details</Label>
                  <Input placeholder="OFFICE EMAIL" className="rounded-none bg-background border-white/10 h-10 text-xs" value={contactSettings.email} onChange={e => setContactSettings({...contactSettings, email: e.target.value})} />
                  <Input placeholder="REPRESENTATION" className="rounded-none bg-background border-white/10 h-10 text-xs" value={contactSettings.representation} onChange={e => setContactSettings({...contactSettings, representation: e.target.value})} />
                  <Input placeholder="GLOBAL LOCATIONS" className="rounded-none bg-background border-white/10 h-10 text-xs" value={contactSettings.locations} onChange={e => setContactSettings({...contactSettings, locations: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Social Links</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Instagram className="w-4 h-4 text-primary" />
                      <Input placeholder="INSTAGRAM URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.instagram} onChange={e => setContactSettings({...contactSettings, instagram: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Youtube className="w-4 h-4 text-primary" />
                      <Input placeholder="YOUTUBE URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.youtube} onChange={e => setContactSettings({...contactSettings, youtube: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <Input placeholder="WHATSAPP NUMBER" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.whatsapp} onChange={e => setContactSettings({...contactSettings, whatsapp: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Facebook className="w-4 h-4 text-primary" />
                      <Input placeholder="FACEBOOK URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.facebook} onChange={e => setContactSettings({...contactSettings, facebook: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Twitter className="w-4 h-4 text-primary" />
                      <Input placeholder="TWITTER URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.twitter} onChange={e => setContactSettings({...contactSettings, twitter: e.target.value})} />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSavingSettings} className="w-full rounded-none bg-primary text-black text-[10px] tracking-widest uppercase font-bold py-6">
                  {isSavingSettings ? <Loader2 className="animate-spin" /> : 'Update All Settings'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </aside>

        <div className="flex-1 p-16 overflow-y-auto no-scrollbar">
          <h1 className="text-4xl font-headline italic uppercase tracking-tighter mb-12">Series <span className="text-primary not-italic">Archive</span></h1>
          
          <div className="space-y-16">
            {PLACEMENT_TYPES.map(section => {
              const videos = sortedVideos.filter(v => v.type === section.value);
              return (
                <div key={section.value} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <section.icon className="w-4 h-4 text-primary" />
                    <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold">{section.label}</h2>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {videos.map(v => (
                      <div key={v.id} className="bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="w-20 aspect-video relative bg-black border border-white/5">
                            <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} className="object-cover w-full h-full opacity-60" />
                          </div>
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-primary font-bold">{v.upperText}</p>
                            <h3 className="text-sm font-headline italic uppercase">{v.lowerText || v.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Input 
                            type="number" 
                            className="w-16 h-8 rounded-none bg-black border-white/10 text-[10px] text-center"
                            defaultValue={v.order}
                            onBlur={(e) => handleUpdateOrder(v.id, Number(e.target.value))}
                          />
                          <button onClick={() => handleDelete(v.id)} className="text-white/20 hover:text-destructive transition-colors">
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
    </main>
  );
}
