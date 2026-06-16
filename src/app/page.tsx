
import { VaelHeader } from '@/components/VaelHeader';
import { VaelReel } from '@/components/VaelReel';
import { VaelAwards } from '@/components/VaelAwards';
import { VaelContact } from '@/components/VaelContact';
import { VaelFooter } from '@/components/VaelFooter';
import { VaelSlider } from '@/components/VaelSlider';
import { VaelFilms } from '@/components/VaelFilms';

export default async function Home(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category || 'all';
  const isFiltered = activeCategory !== 'all';

  return (
    <main className="relative selection:bg-primary/30 bg-background min-h-screen">
      <VaelHeader />
      
      {!isFiltered ? (
        <>
          {/* Main Cinematic Experience */}
          <VaelSlider />
          <div className="bg-background">
            <VaelReel />
            <VaelAwards />
            <VaelContact />
            <VaelFooter />
          </div>
        </>
      ) : (
        /* Filtered Archive Mode */
        <div className="pt-32 md:pt-40 bg-background min-h-screen">
          <VaelFilms />
          <VaelFooter />
        </div>
      )}
      
      {/* Background grain consistent through the site */}
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
