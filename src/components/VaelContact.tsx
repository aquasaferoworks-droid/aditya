
'use client';

import { useState } from 'react';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ContactCard } from '@/components/ContactCard';
import { Mail, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VaelContact() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    brief: ''
  });
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'contact');
  }, [firestore]);

  const { data: settings, loading } = useDoc(settingsRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    if (!formData.name || !formData.email) {
      toast({ variant: "destructive", title: "Required Fields", description: "Name and Email are mandatory." });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'submissions'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      toast({ title: "Message Sent", description: "Thank you for reaching out. We will get back to you shortly." });
      setFormData({ name: '', email: '', type: '', brief: '' });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  const contactInfo = [];
  if (settings?.email) {
    contactInfo.push({ icon: Mail, label: 'Studio Email', value: settings.email });
  }
  if (settings?.locations) {
    contactInfo.push({ icon: MapPin, label: 'Locations', value: settings.locations });
  }

  return (
    <section id="contact" className="relative py-32 md:py-48 px-6 md:px-16 bg-background border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <ContactCard
          title={settings?.formHeading || "Contact Us"}
          description={settings?.formDescription || ""}
          contactInfo={contactInfo}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-medium block italic">Your Name</label>
              <input 
                required
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm placeholder:text-white/20 italic" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-medium block italic">Email Address</label>
              <input 
                required
                type="email"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm placeholder:text-white/20 italic" 
                placeholder="email@example.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-medium block italic">Inquiry Type</label>
              <input 
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm placeholder:text-white/20 italic" 
                placeholder="Commercial, Narrative, etc." 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              />
            </div>
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-medium block italic">Project Brief</label>
              <textarea 
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm min-h-[100px] resize-none placeholder:text-white/20 italic" 
                placeholder="Describe Your Vision..." 
                value={formData.brief}
                onChange={e => setFormData({...formData, brief: e.target.value})}
              />
            </div>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary text-black hover:bg-white hover:text-black py-7 h-auto text-[11px] tracking-[0.4em] uppercase font-medium italic transition-all shadow-xl"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Send Message"}
            </Button>
          </form>
        </ContactCard>
      </div>
    </section>
  );
}
