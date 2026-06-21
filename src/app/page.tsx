import { VaelHeader } from '@/components/VaelHeader';
import { VaelReel } from '@/components/VaelReel';
import { VaelFooter } from '@/components/VaelFooter';
import { VaelSlider } from '@/components/VaelSlider';
import { VaelContact } from '@/components/VaelContact';

export default async function Home(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category || 'all';

  return (
    <main className="relative bg-background min-h-screen selection:bg-primary/30">
      <VaelHeader />
      
      <div className="pt-16 md:pt-20">
        <VaelSlider activeCategory={activeCategory} />
      </div>

      <div className="bg-background">
        <VaelReel activeCategory={activeCategory} />
        <VaelContact />
        <VaelFooter />
      </div>
      
      <div className="fixed inset-0 pointer-events-none grain-overlay z-[200] opacity-5" />
    </main>
  );
}
