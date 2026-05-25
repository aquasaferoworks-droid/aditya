'use client';

import {
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc?: string;
  bgVideoSrc?: string;
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
  bgVideoSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Update scroll locking on body
  useEffect(() => {
    if (!mounted) return;
    if (!mediaFullyExpanded) {
      document.body.style.overflow = 'hidden';
      // Ensure we stay at top during intro
      if (scrollProgress < 1) {
        window.scrollTo(0, 0);
      }
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mediaFullyExpanded, mounted, scrollProgress]);

  useEffect(() => {
    if (!mounted) return;

    const updateProgress = (delta: number) => {
      setScrollProgress((prev) => {
        const newProgress = Math.min(Math.max(prev + delta, 0), 1);
        
        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.95) {
          // Keep content hidden until very close to full expansion
          setShowContent(false);
        }
        
        return newProgress;
      });
    };

    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded) {
        // If at the very top and scrolling up, contract the media
        if (window.scrollY <= 5 && e.deltaY < 0) {
          setMediaFullyExpanded(false);
          updateProgress(-0.02);
          e.preventDefault();
        }
        return;
      }

      e.preventDefault();
      // Sensitivity for desktop
      const scrollDelta = e.deltaY * 0.0015;
      updateProgress(scrollDelta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY;
      
      if (mediaFullyExpanded) {
        // If at the top of the page and swiping down (to see hero)
        if (window.scrollY <= 5 && deltaY < -10) {
          setMediaFullyExpanded(false);
          updateProgress(deltaY * 0.004);
          if (e.cancelable) e.preventDefault();
        }
        // Update touch start for smooth tracking
        touchStartY.current = currentY;
        return;
      }

      // Still in expansion mode
      if (e.cancelable) e.preventDefault();
      
      // Sensitivity for mobile touch
      const scrollDelta = deltaY * 0.0045;
      updateProgress(scrollDelta);
      touchStartY.current = currentY;
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mediaFullyExpanded, mounted]);

  if (!mounted) return null;

  const baseW = isMobileState ? 280 : 450;
  const baseH = isMobileState ? 350 : 600;
  const targetW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const targetH = typeof window !== 'undefined' ? window.innerHeight : 800;

  const mediaWidth = baseW + scrollProgress * (targetW - baseW);
  const mediaHeight = baseH + scrollProgress * (targetH - baseH);
  const textTranslateX = scrollProgress * (isMobileState ? 100 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div className='transition-colors duration-700 ease-in-out overflow-x-hidden bg-white'>
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          
          {/* Background Video Container */}
          <motion.div
            className='fixed inset-0 z-0 h-full bg-black'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {bgVideoSrc ? (
              <video
                src={bgVideoSrc}
                autoPlay
                muted
                loop
                playsInline
                className='w-full h-full object-cover opacity-80 scale-100'
              />
            ) : bgImageSrc ? (
              <Image
                src={bgImageSrc}
                alt='Background'
                fill
                className='object-cover opacity-80'
                priority
              />
            ) : null}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            <div className="absolute inset-0 cinematic-vignette pointer-events-none" />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              
              {/* Foreground Media Container */}
              <div
                className='absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] bg-black rounded-none border border-white/5'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                }}
              >
                {mediaType === 'video' ? (
                  <div className='relative w-full h-full pointer-events-none'>
                    <video
                      src={mediaSrc}
                      poster={posterSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload='auto'
                      className='w-full h-full object-cover'
                    />
                    <motion.div
                      className='absolute inset-0 bg-black/20'
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : (
                  <div className='relative w-full h-full'>
                    <Image
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      fill
                      className='object-cover'
                    />
                  </div>
                )}

                {/* Director Metadata Overlay */}
                <div className='absolute bottom-12 left-0 w-full flex flex-col items-center text-center z-20 pointer-events-none'>
                   <p
                      className='text-[9px] tracking-[0.6em] uppercase text-white/40 mb-2 font-body'
                      style={{ transform: `translateX(${textTranslateX * 0.5}vw)` }}
                    >
                      Directed By
                    </p>
                  {date && (
                    <p
                      className='text-[10px] tracking-[0.4em] uppercase text-primary font-medium mb-4 font-body'
                      style={{ transform: `translateX(-${textTranslateX * 0.3}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && !mediaFullyExpanded && (
                    <p
                      className='text-[8px] tracking-[0.4em] uppercase text-white/30 animate-pulse font-body'
                    >
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {/* Title Overlay */}
              <div
                className={`flex items-center justify-center text-center w-full relative z-20 transition-none flex-col select-none ${
                  textBlend ? 'mix-blend-difference' : ''
                }`}
              >
                <motion.h1
                  className='font-headline text-[clamp(2.5rem,12vw,10rem)] leading-[0.85] italic text-white tracking-tighter'
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h1>
                <motion.h1
                  className='font-headline text-[clamp(2.5rem,12vw,10rem)] leading-[0.85] text-primary tracking-tighter'
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h1>
              </div>
            </div>

            <AnimatePresence>
              {showContent && (
                <motion.section
                  className='flex flex-col w-full bg-white relative z-50'
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                  {children}
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;