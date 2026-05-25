'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded) {
        if (window.scrollY <= 0 && e.deltaY < 0) {
          setMediaFullyExpanded(false);
          setScrollProgress(0.99);
          e.preventDefault();
        }
        return;
      }

      e.preventDefault();
      const scrollDelta = e.deltaY * 0.0015;
      const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1);
      setScrollProgress(newProgress);

      if (newProgress >= 1) {
        setMediaFullyExpanded(true);
        setShowContent(true);
      } else if (newProgress < 0.8) {
        setShowContent(false);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded) {
        if (window.scrollY <= 0 && deltaY < -20) {
          setMediaFullyExpanded(false);
          setScrollProgress(0.99);
          e.preventDefault();
        }
        return;
      }

      e.preventDefault();
      const scrollDelta = deltaY * 0.005;
      const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1);
      setScrollProgress(newProgress);

      if (newProgress >= 1) {
        setMediaFullyExpanded(true);
        setShowContent(true);
      } else if (newProgress < 0.8) {
        setShowContent(false);
      }

      setTouchStartY(touchY);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    window.addEventListener('scroll', handleScroll as EventListener, { passive: false });
    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: false });
    window.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false });
    window.addEventListener('touchend', () => setTouchStartY(0));

    return () => {
      window.removeEventListener('wheel', handleWheel as unknown as EventListener);
      window.removeEventListener('scroll', handleScroll as EventListener);
      window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      window.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY, mounted]);

  const getCleanYoutubeUrl = (url: string) => {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return url;
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else {
      videoId = url.split('/').pop()?.split('?')[0] || '';
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`;
  };

  if (!mounted) return null;

  const baseW = isMobileState ? 280 : 400;
  const baseH = isMobileState ? 350 : 500;
  const targetW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const targetH = typeof window !== 'undefined' ? window.innerHeight : 800;

  const mediaWidth = baseW + scrollProgress * (targetW - baseW);
  const mediaHeight = baseH + scrollProgress * (targetH - baseH);
  const textTranslateX = scrollProgress * (isMobileState ? 100 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div ref={sectionRef} className='bg-background overflow-x-hidden'>
      <section className='relative min-h-screen'>
        {/* Cinematic Background */}
        <motion.div
          className='fixed inset-0 z-0 pointer-events-none'
          style={{ opacity: 1 - scrollProgress }}
        >
          <Image
            src={bgImageSrc}
            alt='Background'
            fill
            className='object-cover grayscale brightness-110 opacity-20'
            priority
          />
        </motion.div>

        <div className='relative flex flex-col items-center justify-center min-h-screen w-full'>
          {/* Media Container - Sharp Cinematic Edges */}
          <div
            className='absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-2xl clean-video-wrapper'
            style={{
              width: `${mediaWidth}px`,
              height: `${mediaHeight}px`,
              maxWidth: '100vw',
              maxHeight: '100vh',
            }}
          >
            {mediaType === 'video' ? (
              <div className='relative w-full h-full pointer-events-none bg-black'>
                <iframe
                  width='100%'
                  height='100%'
                  src={getCleanYoutubeUrl(mediaSrc)}
                  className='w-full h-full scale-[1.05]'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                />
                <div className='absolute inset-0 bg-primary/5 mix-blend-overlay' />
                {/* Brand Hide Overlay */}
                <div className="absolute top-0 right-0 w-32 h-20 bg-black/10 z-30" />
              </div>
            ) : (
              <div className='relative w-full h-full bg-black'>
                <Image
                  src={mediaSrc}
                  alt={title || 'Media content'}
                  fill
                  className='object-cover grayscale'
                />
                <div className='absolute inset-0 bg-primary/10 mix-blend-overlay' />
              </div>
            )}
          </div>

          {/* Titles */}
          <div className={`relative z-20 flex flex-col items-center text-center px-4 w-full select-none ${textBlend ? "mix-blend-difference" : ""}`}>
            <motion.div
              className="flex flex-col items-center justify-center"
              style={{ y: -scrollProgress * 100 }}
            >
              <motion.h1 
                className="font-headline text-[clamp(2.5rem,15vw,10rem)] leading-[0.8] italic text-foreground tracking-tighter"
                style={{ x: -textTranslateX + 'vw' }}
              >
                {firstWord}
              </motion.h1>
              <motion.h1 
                className="font-headline text-[clamp(2.5rem,15vw,10rem)] leading-[0.8] text-primary tracking-tighter"
                style={{ x: textTranslateX + 'vw' }}
              >
                {restOfTitle}
              </motion.h1>
            </motion.div>

            <motion.div 
              className="mt-16 space-y-4"
              style={{ opacity: 1 - scrollProgress * 5 }}
            >
              {date && (
                <p className="text-[10px] tracking-[0.6em] uppercase text-primary font-bold">
                  {date}
                </p>
              )}
              {scrollToExpand && (
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  {scrollToExpand}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence>
          {mediaFullyExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative z-30 bg-background w-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Scroll Indicator */}
      {!mediaFullyExpanded && (
        <motion.div 
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
           <div className="w-[1px] h-12 bg-primary/30 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 w-full h-full bg-primary"
                animate={{ y: [0, 48, 48] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
           </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScrollExpandMedia;