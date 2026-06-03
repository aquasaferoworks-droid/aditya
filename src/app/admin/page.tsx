
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaelHeader } from '@/components/VaelHeader';
import { Loader2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';

export default function AdminPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    youtubeId: '',
    type: 'reel-horizontal',
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

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsAdding(true);
    try {
      await addDoc(collection(firestore, 'videos'), {
        ...formData,
        order: Number(formData.order),
        createdAt: serverTimestamp()
      });
      setFormData({
        title: '',
        category: '',
        youtubeId: '',
        type: 'reel-horizontal',
        role: '',
        meta: '',
        award: '',
        order: videos ? videos.length + 1 : 0
      });
    } catch (error) {
      console.error('Error adding video', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(firestore, 'videos', id));
    } catch (error) {
      console.error('Error deleting video', error);
    }
  };

  if (userLoading || !user) return null;

  return (
    <main className="min-h-screen bg-background pt-32 px-8 md:px-16 pb-24">
      <VaelHeader />
      
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.5em] uppercase text-primary font-bold">Control Panel</span>
            <h1 className="text-5xl md:text-7xl font-headline italic font-bold tracking-tighter">
              ARCHIVE <span className="text-primary not-italic font-light">MANAGER</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-body text-xs tracking-widest uppercase max-w-xs md:text-right">
            Manage your cinematic filmography. Updates are applied instantly to the public archive.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Add Video Form */}
          <form onSubmit={handleAddVideo} className="bg-card/40 border border-border p-8 space-y-6 lg:sticky lg:top-32">
            <h2 className="text-xl font-headline italic mb-4">Add New Project</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest">Project Title</Label>
                <Input 
                  required
                  placeholder="e.g., HAWTHORN" 
                  className="rounded-none bg-background border-border"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest">YouTube ID</Label>
                <Input 
                  required
                  placeholder="e.g., gJKxIAmhbvg" 
                  className="rounded-none bg-background border-border"
                  value={formData.youtubeId}
                  onChange={e => setFormData({...formData, youtubeId: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest">Placement Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={val => setFormData({...formData, type: val})}
                >
                  <SelectTrigger className="rounded-none bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none bg-background border-border">
                    <SelectItem value="slider">Hero Slider</SelectItem>
                    <SelectItem value="reel-horizontal">Reel - Horizontal</SelectItem>
                    <SelectItem value="reel-feature">Reel - Feature (Wide)</SelectItem>
                    <SelectItem value="reel-medium">Reel - Medium</SelectItem>
                    <SelectItem value="reel-vertical">Reel - Vertical (9:16)</SelectItem>
                    <SelectItem value="film-gallery">Filmography List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest">Category/Tag</Label>
                  <Input 
                    placeholder="Narrative, Short..." 
                    className="rounded-none bg-background border-border"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest">Display Order</Label>
                  <Input 
                    type="number"
                    className="rounded-none bg-background border-border"
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                  />
                </div>
              </div>

              {formData.type === 'slider' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest">Role (Slider Only)</Label>
                  <Input 
                    placeholder="Director / Visionary" 
                    className="rounded-none bg-background border-border"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                </div>
              )}

              {formData.type === 'film-gallery' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest">Meta Info</Label>
                    <Input 
                      placeholder="2024 — 112m" 
                      className="rounded-none bg-background border-border"
                      value={formData.meta}
                      onChange={e => setFormData({...formData, meta: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest">Award Badge</Label>
                    <Input 
                      placeholder="Cannes Nominee" 
                      className="rounded-none bg-background border-border"
                      value={formData.award}
                      onChange={e => setFormData({...formData, award: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isAdding}
              className="w-full rounded-none bg-primary text-primary-foreground py-6 h-auto text-[11px] tracking-[0.2em] uppercase font-bold"
            >
              {isAdding ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 w-4 h-4" />}
              Publish Project
            </Button>
          </form>

          {/* List Section */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-headline italic">Current Archive ({videos?.length || 0})</h2>
            
            <div className="grid grid-cols-1 gap-px bg-border/20 border border-border/20">
              {videosLoading && (
                <div className="p-24 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] tracking-widest uppercase opacity-40">Syncing with Firestore...</p>
                </div>
              )}
              
              {videos?.map((video) => (
                <div key={video.id} className="bg-card/20 p-6 flex items-center justify-between group hover:bg-card/40 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-24 aspect-video bg-black relative overflow-hidden flex-shrink-0 border border-white/5">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                        alt="" 
                        className="object-cover w-full h-full opacity-60"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-headline italic tracking-tight">{video.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-primary font-bold">{video.type}</span>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">•</span>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{video.category || 'No Category'}</span>
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
              ))}

              {!videosLoading && videos?.length === 0 && (
                <div className="p-24 text-center opacity-40 italic font-headline">
                  No projects in the archive yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
