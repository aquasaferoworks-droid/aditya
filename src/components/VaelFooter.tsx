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
    <footer className="py-16 md:py-20 px-8 md:px-16 border-t border-border/10 flex flex-col items-center gap-10 bg-background">
      <div className="flex flex-col md:flex-row justify-between w-full max-w-7xl items-center gap-8">
        <div className="font-headline text-2xl tracking-[0.1em] uppercase font-bold">
          ERROL <span className="text-primary font-normal">ADITYA</span>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-bold">
            © 2026 erroladitya.com
          </p>
          <p className="text-[9px] tracking-[0.15em] text-white/30 uppercase font-medium">
            Designed and Developed by <a href="https://budgetdev.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors">budgetdev.in</a>
          </p>
        </div>

        <div className="flex gap-6 text-muted-foreground">
          {settings?.instagram && (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {settings?.youtube && (
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          )}
          {settings?.whatsapp && (
            <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Phone className="w-5 h-5" />
            </a>
          )}
          {settings?.facebook && (
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {settings?.twitter && (
            <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
