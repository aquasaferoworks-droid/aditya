import { VaelHeader } from '@/components/VaelHeader';
import { VaelAbout } from '@/components/VaelAbout';
import { VaelFilms } from '@/components/VaelFilms';
import { VaelReel } from '@/components/VaelReel';
import { VaelAwards } from '@/components/VaelAwards';
import { VaelContact } from '@/components/VaelContact';
import { VaelFooter } from '@/components/VaelFooter';
import { VaelSlider } from '@/components/VaelSlider';

export default function Home() {
  return (
    <main className="relative selection:bg-primary/30 bg-background min-h-screen">
      <VaelHeader />
      
      {/* New Cinematic Hero Slider */}
      <VaelSlider />
      
      {/* Rest of the content scrolls naturally now */}
      <div className="bg-background">
        <VaelAbout />
        <VaelFilms />
        <VaelReel />
        <VaelAwards />
        <VaelContact />
        <VaelFooter />
      </div>
      
      {/* Background grain consistent through the site */}
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
