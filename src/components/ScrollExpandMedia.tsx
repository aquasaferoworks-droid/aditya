'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
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
  const [isMobileState, setIsMobileState] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

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
        if (window.scrollY <= 10 && e.deltaY < 0) {
          setMediaFullyExpanded(false);
          setScrollProgress(0.99);
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

    const handleScroll = (): void => {
      if (!mediaFullyExpanded && typeof window !== 'undefined' && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollProgress, mediaFullyExpanded, mounted]);

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
    <div className='transition-colors duration-700 ease-in-out overflow-x-hidden'>
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt='Background'
              fill
              className='object-cover grayscale brightness-110 opacity-20'
              priority
            />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              {/* Media Container - Sharp Corners */}
              <div
                className='absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-2xl bg-black rounded-none border border-white/5'
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
                      className='w-full h-full object-cover rounded-none'
                    />
                    <motion.div
                      className='absolute inset-0 bg-black/30'
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.3 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : (
                  <div className='relative w-full h-full'>
                    <Image
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      fill
                      className='object-cover rounded-none grayscale'
                    />
                    <motion.div
                      className='absolute inset-0 bg-black/50'
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {/* Subtitles Overlay */}
                <div className='absolute bottom-10 left-0 w-full flex flex-col items-center text-center z-20 pointer-events-none'>
                  {date && (
                    <p
                      className='text-[10px] tracking-[0.6em] uppercase text-primary font-bold mb-4'
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p
                      className='text-[10px] tracking-[0.3em] uppercase text-white/60'
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
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
                  className='font-headline text-[clamp(2.5rem,15vw,10rem)] leading-[0.8] italic text-foreground tracking-tighter'
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h1>
                <motion.h1
                  className='font-headline text-[clamp(2.5rem,15vw,10rem)] leading-[0.8] text-primary tracking-tighter'
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h1>
              </div>
            </div>

            <motion.section
              className='flex flex-col w-full'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
