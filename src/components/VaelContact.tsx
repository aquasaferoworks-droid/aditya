
'use client';

import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export function VaelContact() {
  const firestore = useFirestore();
  const { data: settings, loading } = useDoc(firestore ? doc(firestore, 'settings', 'contact') : null);

  if (loading) return null;

  return (
    <section id="contact" className="relative py-24 md:py-40 px-8 md:px-16 bg-background border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <Image 
          src="https://picsum.photos/seed/studio-contact/1920/1080" 
          alt="Studio Background" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start relative z-10">
        <div className="space-y-12">
          <div className="space-y-8">
            <span className="text-[10px] tracking-[0.6em] uppercase text-primary block font-bold">Inquiry Portal</span>
            <h2 className="text-5xl md:text-8xl font-headline leading-[0.9] italic tracking-tighter uppercase">
              {settings?.formHeading || "Architecture / Narrative"}
            </h2>
            <p className="max-w-md text-muted-foreground font-body leading-relaxed text-sm">
              {settings?.formDescription || "Translating vision into atmospheric reality. Connect with the studio for representation and inquiries."}
            </p>
          </div>

          <div className="space-y-10 pt-8">
            <div className="space-y-2">
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary/60 font-bold block">Studio Email</span>
              <a href={`mailto:${settings?.email || "studio@erroladitya.com"}`} className="text-xl md:text-3xl font-headline hover:text-primary transition-colors italic tracking-tight uppercase">
                {settings?.email || "studio@erroladitya.com"}
              </a>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary/60 font-bold block">Representation</span>
              <p className="text-xl md:text-3xl font-headline italic uppercase tracking-tight">
                {settings?.representation || "WME — Creative Artists"}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary/60 font-bold block">Locations</span>
              <p className="text-base md:text-lg font-headline italic uppercase tracking-widest text-muted-foreground">
                {settings?.locations || "Mumbai / London / New York"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-8 md:p-14 rounded-none space-y-10">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 border-b border-white/10 pb-2">
                <label className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground block">Your Name</label>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm" placeholder="FULL NAME" />
              </div>
              <div className="space-y-3 border-b border-white/10 pb-2">
                <label className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground block">Email</label>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm" placeholder="EMAIL ADDRESS" />
              </div>
            </div>
            <div className="space-y-3 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground block">Inquiry Type</label>
              <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm" placeholder="COMMERCIAL, NARRATIVE, MUSIC VIDEO..." />
            </div>
            <div className="space-y-3 border-b border-white/10 pb-2">
              <label className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground block">Project Brief</label>
              <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-body text-sm min-h-[100px] resize-none" placeholder="TELL US ABOUT YOUR VISION..." />
            </div>
          </div>
          <Button className="w-full rounded-none bg-primary text-primary-foreground hover:bg-white hover:text-black py-8 h-auto text-[11px] tracking-[0.4em] uppercase font-bold transition-all">
            Send Message
          </Button>
        </div>
      </div>
    </section>
  );
}
