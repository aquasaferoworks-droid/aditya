
'use client';

import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ContactCard } from '@/components/ContactCard';
import { Mail, Briefcase, MapPin } from 'lucide-react';
import Image from 'next/image';

export function VaelContact() {
  const firestore = useFirestore();
  const { data: settings, loading } = useDoc(firestore ? doc(firestore, 'settings', 'contact') : null);

  if (loading) return null;

  const contactInfo = [
    { 
      icon: Mail, 
      label: 'Studio Email', 
      value: settings?.email || 'studio@erroladitya.com' 
    },
    { 
      icon: Briefcase, 
      label: 'Representation', 
      value: settings?.representation || 'WME — Creative Artists' 
    },
    { 
      icon: MapPin, 
      label: 'Locations', 
      value: settings?.locations || 'Mumbai / London / New York' 
    },
  ];

  return (
    <section id="contact" className="relative py-32 md:py-48 px-6 md:px-16 bg-background border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <Image 
          src="https://picsum.photos/seed/studio-contact/1920/1080" 
          alt="Studio Background" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <ContactCard
          title={settings?.formHeading || "Inquiry Portal"}
          description={settings?.formDescription || "Translating vision into atmospheric reality. Connect with the studio for representation and high-end cinematic inquiries."}
          contactInfo={contactInfo}
        >
          <div className="space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-bold block">Your Name</label>
              <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm placeholder:text-white/20" placeholder="FULL NAME" />
            </div>
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-bold block">Email Address</label>
              <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm placeholder:text-white/20" placeholder="EMAIL@EXAMPLE.COM" />
            </div>
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-bold block">Inquiry Type</label>
              <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm placeholder:text-white/20" placeholder="COMMERCIAL, NARRATIVE, ETC." />
            </div>
            <div className="space-y-2 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-bold block">Project Brief</label>
              <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm min-h-[100px] resize-none placeholder:text-white/20" placeholder="DESCRIBE YOUR VISION..." />
            </div>
            <Button className="w-full rounded-none bg-primary text-primary-foreground hover:bg-white hover:text-black py-7 h-auto text-[11px] tracking-[0.4em] uppercase font-bold transition-all shadow-xl">
              Send Message
            </Button>
          </div>
        </ContactCard>
      </div>
    </section>
  );
}
