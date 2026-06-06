import { VaelHeader } from '@/components/VaelHeader';
import { VaelReel } from '@/components/VaelReel';
import { VaelAwards } from '@/components/VaelAwards';
import { VaelContact } from '@/components/VaelContact';
import { VaelFooter } from '@/components/VaelFooter';
import { VaelSlider } from '@/components/VaelSlider';
import { VaelFilms } from '@/components/VaelFilms';

export default function Home() {
  return (
    <main className="relative selection:bg-primary/30 bg-background min-h-screen">
      <VaelHeader />
      
      {/* New Cinematic Hero Slider */}
      <VaelSlider />
      
      {/* Rest of the content scrolls naturally now */}
      <div className="bg-background">
        <VaelReel />
        <VaelFilms />
        <VaelAwards />
        <VaelContact />
        <VaelFooter />
      </div>
      
      {/* Background grain consistent through the site */}
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
