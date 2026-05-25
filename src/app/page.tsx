import { VaelHeader } from '@/components/VaelHeader';
import { VaelAbout } from '@/components/VaelAbout';
import { VaelFilms } from '@/components/VaelFilms';
import { VaelReel } from '@/components/VaelReel';
import { VaelAwards } from '@/components/VaelAwards';
import { VaelContact } from '@/components/VaelContact';
import { VaelFooter } from '@/components/VaelFooter';
import { VaelPlatforms } from '@/components/VaelPlatforms';
import ScrollExpandMedia from '@/components/ScrollExpandMedia';

export default function Home() {
  const heroBg = "https://picsum.photos/seed/vael-hero/1920/1080";
  // The user provided premium cinematic video source for the middle box
  const heroVideo = "https://aquasaferoworks.sirv.com/1103193_1080p_Endurance_1280x720.mp4";
  
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
        <VaelPlatforms />
        <VaelAwards />
        <VaelContact />
        <VaelFooter />
      </ScrollExpandMedia>
      
      {/* Background grain consistent through the site */}
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
