
'use client';

import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Instagram, Youtube, Facebook, Twitter, Phone } from 'lucide-react';

export function VaelFooter() {
  const firestore = useFirestore();
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'contact');
  }, [firestore]);

  const { data: settings } = useDoc(settingsRef);

  return (
    <footer className="py-12 md:py-16 px-8 md:px-16 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-8 bg-background">
      <div className="font-headline text-xl tracking-[0.15em] uppercase font-bold italic">ERROL <span className="text-primary not-italic font-light">ADITYA</span></div>
      
      <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase text-center md:text-left font-bold">
        © 2026 erroladitya.com. Architecting Light & Narrative.
      </p>

      <div className="flex gap-6 text-muted-foreground">
        {settings?.instagram && (
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
        )}
        {settings?.youtube && (
          <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Youtube className="w-4 h-4" />
          </a>
        )}
        {settings?.whatsapp && (
          <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
          </a>
        )}
        {settings?.facebook && (
          <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
        )}
        {settings?.twitter && (
          <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
        )}
      </div>
    </footer>
  );
}
