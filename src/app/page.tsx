import { VaelHeader } from '@/components/VaelHeader';
import { VaelAbout } from '@/components/VaelAbout';
import { VaelFilms } from '@/components/VaelFilms';
import { VaelReel } from '@/components/VaelReel';
import { VaelAwards } from '@/components/VaelAwards';
import { VaelContact } from '@/components/VaelContact';
import { VaelFooter } from '@/components/VaelFooter';
import ScrollExpandMedia from '@/components/ScrollExpandMedia';

export default function Home() {
  const heroBg = "https://picsum.photos/seed/vael-hero/1920/1080";
  // Direct cinematic video source (non-YouTube) for the hero
  const heroVideo = "https://player.vimeo.com/external/517047029.hd.mp4?s=018335f6f8905391696e1074a3f5f3e2646c0542&profile_id=175";
  
  return (
    <main className="relative selection:bg-primary/30">
      <VaelHeader />
      
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc={heroVideo}
        bgImageSrc={heroBg}
        title="Architecture of Emotion"
        date="2026 Directing Reel"
        scrollToExpand="Scroll to Experience"
        textBlend={false}
      >
        <VaelAbout />
        <VaelFilms />
        <VaelReel />
        <VaelAwards />
        <VaelContact />
        <VaelFooter />
      </ScrollExpandMedia>
      
      {/* Background grain consistent through the site */}
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
