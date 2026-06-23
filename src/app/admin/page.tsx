'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Trash2, LayoutGrid, Film, Smartphone, Maximize, Box, MoreVertical, Pencil, X, Video } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getVideoType, extractYoutubeId } from '@/lib/video-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Hero Slider', icon: Film },
  { value: 'reel-horizontal', label: 'Row 1 & 2 (Horizontal)', icon: LayoutGrid },
  { value: 'reel-feature', label: 'Row 3 (Feature)', icon: Maximize },
  { value: 'reel-medium', label: 'Row 4 (Medium)', icon: Box },
  { value: 'reel-vertical', label: 'Row 5 (Vertical)', icon: Smartphone },
];

const CATEGORIES = [
  'Ads',
  'Promo',
  'Celebrity',
  'Humor',
  'Cricketers',
  'VFX',
  'Home & Living',
  'Food',
  'Car',
  'Lifestyle',
  'Drama',
  'Sports',
  'High Concept',
  'Story',
  'Fashion',
  'Anthem'
];

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    upperText: '',
    lowerText: '',
    category: ['Ads'] as string[],
    youtubeId: '',
    type: 'reel-horizontal',
    order: 0
  });

  const [contactSettings, setContactSettings] = useState({
    email: '',
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

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'contact');
  }, [firestore]);

  const { data: rawVideos, loading: videosLoading } = useCollection(videosQuery);
  const { data: settingsDoc } = useDoc(settingsRef);

  useEffect(() => {
    if (settingsDoc) {
      setContactSettings({
        email: settingsDoc.email || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const videoId = extractYoutubeId(formData.youtubeId);
    const videoType = getVideoType(formData.youtubeId);
    
    if (videoType === 'unknown' && !videoId) {
      toast({ 
        title: "Unrecognized Source", 
        description: "Please provide a valid YouTube URL or direct video link (.mp4, etc.)", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const videoData = {
        ...formData,
        youtubeId: videoId || formData.youtubeId,
        order: Number(formData.order) || (editingId ? formData.order : sortedVideos.length + 1),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        const docRef = doc(firestore, 'videos', editingId);
        await updateDoc(docRef, videoData);
        toast({ title: "Project Updated" });
      } else {
        await addDoc(collection(firestore, 'videos'), {
          ...videoData,
          createdAt: serverTimestamp()
        });
        toast({ title: "Project Published" });
      }
      resetForm();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      upperText: '',
      lowerText: '',
      category: ['Ads'],
      youtubeId: '',
      type: 'reel-horizontal',
      order: sortedVideos.length + 1
    });
  };

  const handleEditClick = (v: any) => {
    setEditingId(v.id);
    setFormData({
      title: v.title || '',
      upperText: v.upperText || '',
      lowerText: v.lowerText || '',
      category: Array.isArray(v.category) ? v.category : [v.category],
      youtubeId: v.youtubeId || '',
      type: v.type || 'reel-horizontal',
      order: v.order || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    if (!firestore) return;
    setIsUpdatingOrder(id);
    try {
      const docRef = doc(firestore, 'videos', id);
      await updateDoc(docRef, { order: Number(newOrder) });
      toast({ title: "Order Updated" });
    } catch (error: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (!confirm("Are you sure you want to remove this project?")) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
      toast({ title: "Project Removed" });
      if (editingId === id) resetForm();
    } catch (error: any) {
      toast({ title: "Error Removing Entry", variant: "destructive" });
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
    <main className="min-h-screen bg-background text-foreground font-body">
      <VaelHeader />
      <div className="flex pt-16 min-h-screen">
        <aside className="w-96 border-r border-white/5 bg-black/40 flex flex-col sticky top-16 h-[calc(100vh-4rem)] p-8 overflow-y-auto no-scrollbar">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="bg-white/5 rounded-none p-1 w-full grid grid-cols-2 mb-8">
              <TabsTrigger value="videos" className="rounded-none text-[10px] uppercase tracking-widest py-3 font-bold italic">Manage Series</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none text-[10px] uppercase tracking-widest py-3 font-bold italic">Contact Info</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-primary italic">
                  {editingId ? 'Edit Project' : 'Publish Project'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1 font-bold italic">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Placement</Label>
                    <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                      <SelectTrigger className="rounded-none bg-background border-white/10 h-10 text-[10px] uppercase font-bold italic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none bg-black border-white/10">
                        {PLACEMENT_TYPES.map(pt => (
                          <SelectItem key={pt.value} value={pt.value} className="text-[10px] uppercase font-bold italic">{pt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Genres</Label>
                    <div className="grid grid-cols-2 gap-2 border border-white/5 p-3 bg-black/20 max-h-48 overflow-y-auto no-scrollbar">
                      {CATEGORIES.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`cat-${cat}`} 
                            checked={formData.category.includes(cat)} 
                            onCheckedChange={() => handleCategoryToggle(cat)} 
                            className="rounded-none border-white/20" 
                          />
                          <label htmlFor={`cat-${cat}`} className="text-[8px] uppercase tracking-widest cursor-pointer font-bold italic">{cat}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Project Details</Label>
                    <Input placeholder="HEADING (e.g. SLEEK KITCHEN)" className="rounded-none bg-background border-white/10 h-10 text-xs italic" value={formData.upperText} onChange={e => setFormData({...formData, upperText: e.target.value})} />
                    <Input required placeholder="SUBTEXT (e.g. ASIAN PAINT)" className="rounded-none bg-background border-white/10 h-10 text-xs italic" value={formData.lowerText} onChange={e => setFormData({...formData, lowerText: e.target.value})} />
                    <Input required placeholder="VIDEO URL (YOUTUBE OR .MP4)" className="rounded-none bg-background border-white/10 h-10 text-xs" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
                    <Input type="number" placeholder="SERIES SEQUENCE" className="rounded-none bg-background border-white/10 h-10 text-xs" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-none bg-primary text-black text-[10px] tracking-widest uppercase font-bold py-6 italic">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? 'Update Project' : 'Publish Project'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Contact Content</Label>
                  <Input placeholder="HEADING (e.g. Contact Us)" className="rounded-none bg-background border-white/10 h-10 text-xs italic" value={contactSettings.formHeading} onChange={e => setContactSettings({...contactSettings, formHeading: e.target.value})} />
                  <Textarea placeholder="SHORT WELCOME MESSAGE" className="rounded-none bg-background border-white/10 min-h-[100px] text-xs italic" value={contactSettings.formDescription} onChange={e => setContactSettings({...contactSettings, formDescription: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Studio Details</Label>
                  <Input placeholder="PRIMARY EMAIL" className="rounded-none bg-background border-white/10 h-10 text-xs" value={contactSettings.email} onChange={e => setContactSettings({...contactSettings, email: e.target.value})} />
                  <Input placeholder="GLOBAL LOCATIONS" className="rounded-none bg-background border-white/10 h-10 text-xs" value={contactSettings.locations} onChange={e => setContactSettings({...contactSettings, locations: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Social Channels</Label>
                  <div className="space-y-2">
                    <Input placeholder="INSTAGRAM URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.instagram} onChange={e => setContactSettings({...contactSettings, instagram: e.target.value})} />
                    <Input placeholder="YOUTUBE URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.youtube} onChange={e => setContactSettings({...contactSettings, youtube: e.target.value})} />
                    <Input placeholder="WHATSAPP NUMBER" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.whatsapp} onChange={e => setContactSettings({...contactSettings, whatsapp: e.target.value})} />
                    <Input placeholder="FACEBOOK URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.facebook} onChange={e => setContactSettings({...contactSettings, facebook: e.target.value})} />
                    <Input placeholder="TWITTER URL" className="rounded-none bg-background border-white/10 h-8 text-[10px]" value={contactSettings.twitter} onChange={e => setContactSettings({...contactSettings, twitter: e.target.value})} />
                  </div>
                </div>

                <Button type="submit" disabled={isSavingSettings} className="w-full rounded-none bg-primary text-black text-[10px] tracking-widest uppercase font-bold py-6 italic">
                  {isSavingSettings ? <Loader2 className="animate-spin" /> : 'Update All Settings'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </aside>

        <div className="flex-1 p-16 overflow-y-auto no-scrollbar">
          <h1 className="text-4xl font-headline italic uppercase tracking-tighter mb-12">Project <span className="text-primary not-italic">Archive</span></h1>
          
          <div className="space-y-16">
            {PLACEMENT_TYPES.map(section => {
              const videos = sortedVideos.filter(v => v.type === section.value);
              return (
                <div key={section.value} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <section.icon className="w-4 h-4 text-primary" />
                    <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold italic">{section.label}</h2>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {videos.map(v => {
                      const vType = getVideoType(v.youtubeId);
                      const ytId = extractYoutubeId(v.youtubeId);
                      
                      return (
                        <div key={v.id} className={`bg-white/[0.02] border transition-all duration-300 p-4 flex items-center justify-between group ${editingId === v.id ? 'border-primary' : 'border-white/5'}`}>
                          <div className="flex items-center gap-6">
                            <div className="w-20 aspect-video relative bg-black border border-white/5 flex items-center justify-center">
                              {vType === 'youtube' && ytId ? (
                                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} className="object-cover w-full h-full opacity-60" alt="" />
                              ) : (
                                <Video className="w-6 h-6 text-white/20" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-headline italic uppercase text-white">{v.upperText}</h3>
                              <p className="text-[8px] uppercase tracking-widest text-primary font-bold italic">{v.lowerText || v.title}</p>
                              <div className="flex gap-1 mt-1">
                                {Array.isArray(v.category) ? v.category.slice(0, 3).map((c: string) => (
                                  <span key={c} className="text-[6px] tracking-widest text-white/30 uppercase font-bold border border-white/10 px-1 italic">{c}</span>
                                )) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Input 
                              type="number" 
                              className="w-16 h-8 rounded-none bg-black border-white/10 text-[10px] text-center"
                              defaultValue={v.order}
                              onBlur={(e) => handleUpdateOrder(v.id, Number(e.target.value))}
                            />
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-white/20 hover:text-white transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="rounded-none bg-black border-white/10 min-w-[120px]">
                                <DropdownMenuItem 
                                  onClick={() => handleEditClick(v)}
                                  className="text-[10px] uppercase tracking-widest cursor-pointer focus:bg-white/10 focus:text-primary font-bold italic"
                                >
                                  <Pencil className="w-3 h-3 mr-2" /> Edit Entry
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(v.id)}
                                  className="text-[10px] uppercase tracking-widest cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive font-bold italic"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                    {videos.length === 0 && (
                      <p className="text-[9px] uppercase tracking-widest text-white/10 italic py-4">No projects assigned to this placement</p>
                    )}
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
