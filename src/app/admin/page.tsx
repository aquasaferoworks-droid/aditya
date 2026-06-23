
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Trash2, LayoutGrid, Film, Smartphone, Maximize, Box, MoreVertical, Pencil, X, Video, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Hero Slider', icon: Film, limit: 99 },
  { value: 'reel-horizontal', label: 'Row 1 & 2 (Horizontal)', icon: LayoutGrid, limit: 4 },
  { value: 'reel-feature', label: 'Row 3 (Feature)', icon: Maximize, limit: 1 },
  { value: 'reel-medium', label: 'Row 4 (Medium)', icon: Box, limit: 2 },
  { value: 'reel-vertical', label: 'Row 5 (Vertical)', icon: Smartphone, limit: 4 },
];

const CATEGORIES = [
  'Ads', 'Promo', 'Celebrity', 'Humor', 'Cricketers', 'VFX', 
  'Home & Living', 'Food', 'Car', 'Lifestyle', 'Drama', 
  'Sports', 'High Concept', 'Story', 'Fashion', 'Anthem'
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

  const getSlotCount = (type: string) => {
    return sortedVideos.filter(v => v.type === type).length;
  };

  const currentPlacement = PLACEMENT_TYPES.find(p => p.value === formData.type);
  const isSlotFull = currentPlacement ? getSlotCount(formData.type) >= currentPlacement.limit : false;

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
      <div className="flex pt-20 min-h-screen">
        <aside className="w-[450px] border-r border-white/5 bg-black/40 flex flex-col sticky top-20 h-[calc(100vh-5rem)] p-10 overflow-y-auto no-scrollbar">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="bg-white/5 rounded-none p-1 w-full grid grid-cols-2 mb-10">
              <TabsTrigger value="videos" className="rounded-none text-[10px] uppercase tracking-widest py-3 font-bold italic">Series Manager</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none text-[10px] uppercase tracking-widest py-3 font-bold italic">Studio Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-8">
              <div className={cn(
                "p-6 border border-white/5 transition-colors duration-500",
                editingId ? "bg-primary/5 border-primary/20" : "bg-black/20"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <h2 className={cn(
                      "text-[12px] uppercase tracking-[0.3em] font-bold italic",
                      editingId ? "text-primary" : "text-white/60"
                    )}>
                      {editingId ? 'Edit Entry Mode' : 'Publish New Entry'}
                    </h2>
                    {editingId && <span className="text-[8px] uppercase tracking-widest text-primary/60 font-bold italic mt-1">Updating existing record</span>}
                  </div>
                  {editingId && (
                    <button onClick={resetForm} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1 font-bold italic">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Placement Row</Label>
                      <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                        <SelectTrigger className="rounded-none bg-background border-white/10 h-12 text-[10px] uppercase font-bold italic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none bg-black border-white/10">
                          {PLACEMENT_TYPES.map(pt => (
                            <SelectItem key={pt.value} value={pt.value} className="text-[10px] uppercase font-bold italic">{pt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {isSlotFull && !editingId && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 text-[9px] text-primary uppercase font-bold italic tracking-wider animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Slot capacity reached. New entries will fallback to gallery.
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Select Genres</Label>
                      <div className="grid grid-cols-2 gap-3 border border-white/5 p-4 bg-black/40 max-h-56 overflow-y-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                          <div key={cat} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`cat-${cat}`} 
                              checked={formData.category.includes(cat)} 
                              onCheckedChange={() => handleCategoryToggle(cat)} 
                              className="rounded-none border-white/20" 
                            />
                            <label htmlFor={`cat-${cat}`} className={cn(
                              "text-[8px] uppercase tracking-widest cursor-pointer font-bold italic",
                              formData.category.includes(cat) ? "text-primary" : "text-white/40"
                            )}>{cat}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Content Details</Label>
                      <div className="space-y-3">
                        <Input placeholder="HEADING (E.G. SLEEK KITCHEN)" className="rounded-none bg-background border-white/10 h-12 text-xs italic font-bold placeholder:font-normal" value={formData.upperText} onChange={e => setFormData({...formData, upperText: e.target.value})} />
                        <Input required placeholder="SUBTEXT (E.G. ASIAN PAINT)" className="rounded-none bg-background border-white/10 h-12 text-xs italic text-primary font-bold placeholder:text-white/40 placeholder:font-normal" value={formData.lowerText} onChange={e => setFormData({...formData, lowerText: e.target.value})} />
                        <Input required placeholder="YOUTUBE LINK OR VIDEO URL" className="rounded-none bg-background border-white/10 h-12 text-xs font-mono" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
                        <div className="flex items-center gap-3">
                           <div className="flex-1 space-y-2">
                              <Label className="text-[8px] uppercase tracking-widest text-white/20 font-bold italic">Sequence</Label>
                              <Input type="number" className="rounded-none bg-background border-white/10 h-10 text-xs font-bold" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className={cn(
                    "w-full rounded-none text-black text-[10px] tracking-[0.3em] uppercase font-bold py-8 italic shadow-2xl transition-all",
                    editingId ? "bg-primary hover:bg-white" : "bg-white hover:bg-primary"
                  )}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? 'Update Entry' : 'Publish Entry'}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8">
              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div className="space-y-5">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Inquiry Section</Label>
                  <Input placeholder="FORM HEADING" className="rounded-none bg-background border-white/10 h-12 text-xs italic font-bold" value={contactSettings.formHeading} onChange={e => setContactSettings({...contactSettings, formHeading: e.target.value})} />
                  <Textarea placeholder="SHORT WELCOME MESSAGE" className="rounded-none bg-background border-white/10 min-h-[120px] text-xs italic leading-relaxed" value={contactSettings.formDescription} onChange={e => setContactSettings({...contactSettings, formDescription: e.target.value})} />
                </div>

                <div className="space-y-5">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Studio Location</Label>
                  <Input placeholder="PRIMARY EMAIL" className="rounded-none bg-background border-white/10 h-12 text-xs font-mono" value={contactSettings.email} onChange={e => setContactSettings({...contactSettings, email: e.target.value})} />
                  <Input placeholder="GLOBAL REGIONS (E.G. NEW YORK, LONDON)" className="rounded-none bg-background border-white/10 h-12 text-xs italic font-bold" value={contactSettings.locations} onChange={e => setContactSettings({...contactSettings, locations: e.target.value})} />
                </div>

                <div className="space-y-5">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold italic">Social Archive</Label>
                  <div className="space-y-3">
                    {['Instagram', 'YouTube', 'WhatsApp', 'Facebook', 'Twitter'].map(social => (
                      <div key={social} className="relative group">
                        <Input 
                          placeholder={`${social.toUpperCase()} LINK`} 
                          className="rounded-none bg-background border-white/10 h-10 text-[10px] pl-4 italic focus:border-primary/40 transition-colors" 
                          value={(contactSettings as any)[social.toLowerCase()]} 
                          onChange={e => setContactSettings({...contactSettings, [social.toLowerCase()]: e.target.value})} 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isSavingSettings} className="w-full rounded-none bg-primary text-black text-[10px] tracking-[0.3em] uppercase font-bold py-8 italic shadow-2xl">
                  {isSavingSettings ? <Loader2 className="animate-spin" /> : 'Synchronize Settings'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </aside>

        <div className="flex-1 p-16 overflow-y-auto no-scrollbar bg-white/[0.01]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-headline italic uppercase tracking-tighter mb-4 text-white">Project <span className="text-primary not-italic">Archive</span></h1>
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 font-bold italic mb-16">The complete cinematic directorial collection.</p>
            
            <div className="space-y-24">
              {PLACEMENT_TYPES.map(section => {
                const videos = sortedVideos.filter(v => v.type === section.value);
                const isFull = videos.length >= section.limit;

                return (
                  <div key={section.value} className="space-y-8">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "p-3 border transition-colors",
                          isFull ? "border-primary/20 bg-primary/5 text-primary" : "border-white/5 bg-white/5 text-white/40"
                        )}>
                          <section.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold italic text-white">{section.label}</h2>
                          <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold italic mt-1">
                            Slot Availability: {videos.length} / {section.limit === 99 ? '∞' : section.limit}
                          </span>
                        </div>
                      </div>
                      <div className="h-px flex-1 bg-white/5 mx-10" />
                      {isFull && section.limit !== 99 && (
                        <span className="text-[8px] uppercase tracking-widest text-primary font-bold italic px-3 py-1 border border-primary/20">Full Capacity</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {videos.map(v => {
                        const vType = getVideoType(v.youtubeId);
                        const ytId = extractYoutubeId(v.youtubeId);
                        
                        return (
                          <div key={v.id} className={cn(
                            "group border transition-all duration-500 p-6 flex items-center justify-between bg-black/40",
                            editingId === v.id ? 'border-primary shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'border-white/5 hover:border-white/10'
                          )}>
                            <div className="flex items-center gap-10">
                              <div className="w-32 aspect-video relative bg-black border border-white/5 overflow-hidden">
                                {vType === 'youtube' && ytId ? (
                                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="" />
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full gap-2 opacity-20">
                                    <Video className="w-8 h-8" />
                                    <span className="text-[8px] uppercase font-bold italic">Direct</span>
                                  </div>
                                )}
                                {editingId === v.id && <div className="absolute inset-0 bg-primary/10 border-2 border-primary" />}
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-headline italic uppercase text-white tracking-tighter">{v.upperText}</h3>
                                <p className="text-[9px] uppercase tracking-[0.3em] text-primary font-bold italic">{v.lowerText || v.title}</p>
                                <div className="flex gap-2 mt-2">
                                  {Array.isArray(v.category) ? v.category.slice(0, 3).map((c: string) => (
                                    <span key={c} className="text-[7px] tracking-[0.2em] text-white/30 uppercase font-bold border border-white/10 px-2 py-0.5 italic">{c}</span>
                                  )) : null}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold italic">Sequence</span>
                                <Input 
                                  type="number" 
                                  className="w-20 h-10 rounded-none bg-black border-white/10 text-[10px] text-center font-bold"
                                  defaultValue={v.order}
                                  onBlur={(e) => handleUpdateOrder(v.id, Number(e.target.value))}
                                />
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-3 bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-none bg-black border-white/10 min-w-[160px] p-2">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditClick(v)}
                                    className="text-[10px] uppercase tracking-widest cursor-pointer focus:bg-primary focus:text-black font-bold italic py-3"
                                  >
                                    <Pencil className="w-3 h-3 mr-3" /> Edit Entry
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(v.id)}
                                    className="text-[10px] uppercase tracking-widest cursor-pointer text-destructive focus:bg-destructive focus:text-white font-bold italic py-3"
                                  >
                                    <Trash2 className="w-3 h-3 mr-3" /> Remove Permanent
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                      {videos.length === 0 && (
                        <div className="flex items-center gap-3 p-8 border border-dashed border-white/5 opacity-20">
                           <X className="w-4 h-4" />
                           <p className="text-[10px] uppercase tracking-[0.3em] font-bold italic">Slot Unassigned</p>
                        </div>
                      )}
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
