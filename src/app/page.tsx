import { VaelHeader } from '@/components/VaelHeader';
import { VaelHero } from '@/components/VaelHero';
import { VaelAbout } from '@/components/VaelAbout';
import { VaelFilms } from '@/components/VaelFilms';
import { VaelReel } from '@/components/VaelReel';
import { VaelAwards } from '@/components/VaelAwards';
import { VaelContact } from '@/components/VaelContact';
import { VaelFooter } from '@/components/VaelFooter';

export default function Home() {
  return (
    <main className="relative selection:bg-primary/30">
      <VaelHeader />
      <VaelHero />
      <VaelAbout />
      <VaelFilms />
      <VaelReel />
      <VaelAwards />
      <VaelContact />
      <VaelFooter />
      
      {/* Background grain consistent through the site */}
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
