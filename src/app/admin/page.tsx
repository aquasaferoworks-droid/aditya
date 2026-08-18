
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Trash2, LayoutGrid, Film, Smartphone, Maximize, Box, MoreVertical, Pencil, X, Video, AlertCircle, Image as ImageIcon, Plus, Minus, Grid } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { extractYoutubeId, getYoutubeThumbnail } from '@/lib/video-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const PLACEMENT_TYPES = [
  { value: 'slider', label: 'Hero Slider', icon: Film },
  { value: 'reel-grid', label: 'New (16:9)', icon: Grid },
  { value: 'reel-horizontal', label: 'Row 1 & 2 (Horizontal)', icon: LayoutGrid },
  { value: 'reel-feature', label: 'Row 3 (Feature)', icon: Maximize },
  { value: 'reel-medium', label: 'Row 4 (Medium)', icon: Box },
  { value: 'reel-vertical', label: 'Row 5 (Vertical)', icon: Smartphone },
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
    upperText: '',
    lowerText: '',
    upperTextSize: 24,
    lowerTextSize: 13,
    category: ['Ads'] as string[],
    youtubeId: '',
    thumbnailUrl: '',
    type: 'reel-grid',
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
    twitter: '',
    logoSize: 24
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
        twitter: settingsDoc.twitter || '',
        logoSize: settingsDoc.logoSize || 24
      });
    }
  }, [settingsDoc]);

  const sortedVideos = (rawVideos || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      upperText: '',
      lowerText: '',
      upperTextSize: 24,
      lowerTextSize: 13,
      category: ['Ads'],
      youtubeId: '',
      thumbnailUrl: '',
      type: 'reel-grid',
      order: sortedVideos.length + 1
    });
  };

  const updateRealtimeVideoFontSize = (type: 'upper' | 'lower', size: number) => {
    if (!firestore || !editingId) return;
    const docRef = doc(firestore, 'videos', editingId);
    updateDoc(docRef, { [type === 'upper' ? 'upperTextSize' : 'lowerTextSize']: size });
  };

  const updateRealtimeLogoSize = (size: number) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'settings', 'contact');
    setDoc(docRef, { ...contactSettings, logoSize: size }, { merge: true });
  };

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

  const handleEditClick = (v: any) => {
    setEditingId(v.id);
    setFormData({
      upperText: v.upperText || '',
      lowerText: v.lowerText || '',
      upperTextSize: v.upperTextSize || 24,
      lowerTextSize: v.lowerTextSize || 13,
      category: Array.isArray(v.category) ? v.category : [v.category],
      youtubeId: v.youtubeId || '',
      thumbnailUrl: v.thumbnailUrl || '',
      type: v.type || 'reel-grid',
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
      toast({ title: "Sequence Updated" });
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
    <main className="min-h-screen bg-background text-foreground font-body selection:bg-primary selection:text-black">
      <VaelHeader />
      <div className="flex pt-32 min-h-screen">
        {/* Management Sidebar */}
        <aside className="w-[480px] border-r border-white/5 bg-black/60 flex flex-col sticky top-32 h-[calc(100vh-8rem)] p-10 overflow-y-auto no-scrollbar">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="bg-white/5 rounded-lg p-1 w-full grid grid-cols-2 mb-10">
              <TabsTrigger value="videos" className="rounded-md text-[13px] tracking-tight py-3 font-medium italic">Project Manager</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-md text-[13px] tracking-tight py-3 font-medium italic">Studio Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-8">
              <div className={cn(
                "p-6 border border-white/5 transition-all duration-500 rounded-lg",
                editingId ? "bg-primary/5 border-primary/20" : "bg-black/20"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <h2 className={cn(
                      "text-[14px] tracking-tight font-medium italic",
                      editingId ? "text-primary" : "text-white/60"
                    )}>
                      {editingId ? 'Edit Project Entry' : 'Publish New Entry'}
                    </h2>
                  </div>
                  {editingId && (
                    <button onClick={resetForm} className="text-[11px] tracking-tight text-white/40 hover:text-white flex items-center gap-1 font-medium italic">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] tracking-tight text-muted-foreground font-medium italic">Placement Row</Label>
                      <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                        <SelectTrigger className="rounded-lg bg-background border-white/10 h-12 text-[13px] font-medium italic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg bg-black border-white/10">
                          {PLACEMENT_TYPES.map(pt => (
                            <SelectItem key={pt.value} value={pt.value} className="text-[13px] font-medium italic">{pt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] tracking-tight text-muted-foreground font-medium italic">Select Genres</Label>
                      <div className="grid grid-cols-2 gap-3 border border-white/5 p-4 bg-black/40 max-h-56 overflow-y-auto no-scrollbar rounded-lg">
                        {CATEGORIES.map(cat => (
                          <div key={cat} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`cat-${cat}`} 
                              checked={formData.category.includes(cat)} 
                              onCheckedChange={() => handleCategoryToggle(cat)} 
                              className="rounded-sm border-white/20" 
                            />
                            <label htmlFor={`cat-${cat}`} className={cn(
                              "text-[10px] tracking-tight cursor-pointer font-medium italic",
                              formData.category.includes(cat) ? "text-primary" : "text-white/40"
                            )}>{cat}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <Label className="text-[11px] tracking-tight text-muted-foreground font-medium italic">Content Details</Label>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-[10px] text-white/40 italic">Cinematic Heading</Label>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => {
                                const newSize = Math.max(10, formData.upperTextSize - 1);
                                setFormData(f => ({...f, upperTextSize: newSize}));
                                updateRealtimeVideoFontSize('upper', newSize);
                              }} className="p-1 text-white/40 hover:text-primary"><Minus className="w-3 h-3" /></button>
                              <span className="text-[10px] text-primary font-bold">{formData.upperTextSize}px</span>
                              <button type="button" onClick={() => {
                                const newSize = Math.min(100, formData.upperTextSize + 1);
                                setFormData(f => ({...f, upperTextSize: newSize}));
                                updateRealtimeVideoFontSize('upper', newSize);
                              }} className="p-1 text-white/40 hover:text-primary"><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <Input placeholder="e.g. Pudin Hara" className="rounded-lg bg-background border-white/10 h-12 text-[13px] italic font-medium" value={formData.upperText} onChange={e => setFormData({...formData, upperText: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-[10px] text-white/40 italic">Cinematic Subtext</Label>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => {
                                const newSize = Math.max(8, formData.lowerTextSize - 1);
                                setFormData(f => ({...f, lowerTextSize: newSize}));
                                updateRealtimeVideoFontSize('lower', newSize);
                              }} className="p-1 text-white/40 hover:text-primary"><Minus className="w-3 h-3" /></button>
                              <span className="text-[10px] text-primary font-bold">{formData.lowerTextSize}px</span>
                              <button type="button" onClick={() => {
                                const newSize = Math.min(40, formData.lowerTextSize + 1);
                                setFormData(f => ({...f, lowerTextSize: newSize}));
                                updateRealtimeVideoFontSize('lower', newSize);
                              }} className="p-1 text-white/40 hover:text-primary"><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <Input placeholder="e.g. Nation On Vacation" className="rounded-lg bg-background border-white/10 h-12 text-[13px] italic text-primary font-medium" value={formData.lowerText} onChange={e => setFormData({...formData, lowerText: e.target.value})} />
                        </div>

                        <Input required placeholder="YouTube Link or ID" className="rounded-lg bg-background border-white/10 h-12 text-[13px] font-medium" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} />
                        <Input placeholder="Custom Thumbnail URL (Optional)" className="rounded-lg bg-background border-white/10 h-12 text-[13px] font-medium" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
                        
                        <div className="space-y-2">
                          <Label className="text-[10px] tracking-tight text-white/20 font-medium italic">Series Sequence</Label>
                          <Input type="number" className="rounded-lg bg-background border-white/10 h-10 text-[13px] font-medium" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className={cn(
                    "w-full rounded-lg text-black text-[13px] tracking-tight font-medium py-8 italic shadow-2xl transition-all",
                    editingId ? "bg-primary hover:bg-white" : "bg-white hover:bg-primary"
                  )}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? 'Update Cinematic Entry' : 'Publish Cinematic Entry'}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8">
              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div className="space-y-5">
                  <Label className="text-[11px] tracking-tight text-muted-foreground font-medium italic">Branding & Layout</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[10px] text-white/40 italic">Logo Font Size</Label>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => {
                          const newSize = Math.max(12, contactSettings.logoSize - 1);
                          setContactSettings(s => ({...s, logoSize: newSize}));
                          updateRealtimeLogoSize(newSize);
                        }} className="p-1 text-white/40 hover:text-primary"><Minus className="w-3 h-3" /></button>
                        <span className="text-[10px] text-primary font-bold">{contactSettings.logoSize}px</span>
                        <button type="button" onClick={() => {
                          const newSize = Math.min(60, contactSettings.logoSize + 1);
                          setContactSettings(s => ({...s, logoSize: newSize}));
                          updateRealtimeLogoSize(newSize);
                        }} className="p-1 text-white/40 hover:text-primary"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <Label className="text-[11px] tracking-tight text-muted-foreground font-medium italic">Inquiry Section</Label>
                  <Input placeholder="Form Heading" className="rounded-lg bg-background border-white/10 h-12 text-[13px] italic font-medium" value={contactSettings.formHeading} onChange={e => setContactSettings({...contactSettings, formHeading: e.target.value})} />
                  <Textarea placeholder="Short Welcome Message" className="rounded-lg bg-background border-white/10 min-h-[120px] text-[13px] italic leading-relaxed" value={contactSettings.formDescription} onChange={e => setContactSettings({...contactSettings, formDescription: e.target.value})} />
                </div>
                <div className="space-y-5">
                  <Label className="text-[11px] tracking-tight text-muted-foreground font-medium italic">Direct Contact & Socials</Label>
                  <Input placeholder="Public Email" className="rounded-lg bg-background border-white/10 h-10 text-[13px] font-medium" value={contactSettings.email} onChange={e => setContactSettings({...contactSettings, email: e.target.value})} />
                  <Input placeholder="Locations" className="rounded-lg bg-background border-white/10 h-10 text-[13px] font-medium" value={contactSettings.locations} onChange={e => setContactSettings({...contactSettings, locations: e.target.value})} />
                  <Input placeholder="Instagram URL" className="rounded-lg bg-background border-white/10 h-10 text-[13px] font-medium" value={contactSettings.instagram} onChange={e => setContactSettings({...contactSettings, instagram: e.target.value})} />
                  <Input placeholder="YouTube Channel URL" className="rounded-lg bg-background border-white/10 h-10 text-[13px] font-medium" value={contactSettings.youtube} onChange={e => setContactSettings({...contactSettings, youtube: e.target.value})} />
                  <Input placeholder="WhatsApp Number" className="rounded-lg bg-background border-white/10 h-10 text-[13px] font-medium" value={contactSettings.whatsapp} onChange={e => setContactSettings({...contactSettings, whatsapp: e.target.value})} />
                </div>
                <Button type="submit" disabled={isSavingSettings} className="w-full rounded-lg bg-primary text-black text-[13px] tracking-tight font-medium py-8 italic shadow-2xl">
                  {isSavingSettings ? <Loader2 className="animate-spin" /> : 'Synchronize Studio Settings'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Project Archive View */}
        <div className="flex-1 p-16 overflow-y-auto no-scrollbar bg-white/[0.01]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-headline italic tracking-tighter mb-4 text-white">Project <span className="text-primary not-italic">Archive</span></h1>
            <p className="text-muted-foreground font-body text-sm tracking-widest uppercase mb-16 italic opacity-40">Manage your directorial series and placement sequence.</p>

            <div className="space-y-24">
              {PLACEMENT_TYPES.map(section => {
                const videos = sortedVideos.filter(v => v.type === section.value);
                return (
                  <div key={section.value} className="space-y-8">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="p-3 border border-white/5 bg-white/5 text-white/40 rounded-lg">
                          <section.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-[13px] tracking-tight font-medium italic text-white">{section.label}</h2>
                          <span className="text-[10px] tracking-tight text-white/20 font-medium italic mt-1">
                            {videos.length} Entries
                          </span>
                        </div>
                      </div>
                      <div className="h-px flex-1 bg-white/5 mx-10" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {videos.map(v => {
                        const ytId = extractYoutubeId(v.youtubeId);
                        const displayThumbnail = v.thumbnailUrl || (ytId ? getYoutubeThumbnail(ytId, 'hq') : null);
                        
                        return (
                          <div key={v.id} className={cn(
                            "group border transition-all duration-500 p-6 flex items-center justify-between bg-black/40 rounded-lg",
                            editingId === v.id ? 'border-primary shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'border-white/5 hover:border-white/10'
                          )}>
                            <div className="flex items-center gap-10">
                              <div className="w-32 aspect-video relative bg-black border border-white/5 overflow-hidden rounded-lg">
                                {displayThumbnail ? (
                                  <img src={displayThumbnail} className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="" />
                                ) : (
                                  <div className="flex items-center justify-center h-full opacity-20">
                                    <Video className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-headline italic text-white tracking-tight leading-none truncate mb-1">{v.upperText || "Untitled Project"}</h3>
                                <p className="text-[11px] tracking-tight text-primary font-medium italic">{v.lowerText}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] tracking-tight text-white/20 font-medium italic">Order</span>
                                <input 
                                  type="number" 
                                  value={v.order || 0}
                                  onChange={(e) => handleUpdateOrder(v.id, Number(e.target.value))}
                                  disabled={isUpdatingOrder === v.id}
                                  className="w-12 bg-transparent border-b border-white/10 text-[13px] text-center font-medium text-primary focus:outline-none focus:border-primary"
                                />
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-3 bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all rounded-lg">
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-lg bg-black border-white/10 min-w-[160px] p-2">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditClick(v)}
                                    className="text-[12px] tracking-tight cursor-pointer focus:bg-primary focus:text-black font-medium italic py-3 rounded-md"
                                  >
                                    <Pencil className="w-3 h-3 mr-3" /> Edit Entry
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(v.id)}
                                    className="text-[12px] tracking-tight cursor-pointer text-destructive focus:bg-destructive focus:text-white font-medium italic py-3 rounded-md"
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
                        <div className="py-12 flex flex-col items-center justify-center opacity-10 border border-dashed border-white/20 rounded-lg">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <p className="text-[11px] tracking-tight font-medium italic">No entries for this row</p>
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
