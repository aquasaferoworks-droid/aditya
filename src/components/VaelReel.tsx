'use client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Frame {
  id: number;
  youtubeId: string;
  defaultPos: { x: number; y: number; w: number; h: number };
  corner: string;
  edgeHorizontal: string;
  edgeVertical: string;
  mediaSize: number;
  borderThickness: number;
  borderSize: number;
}

interface FrameComponentProps {
  youtubeId: string;
  width: number | string;
  height: number | string;
  className?: string;
  corner: string;
  edgeHorizontal: string;
  edgeVertical: string;
  mediaSize: number;
  borderThickness: number;
  borderSize: number;
  showFrame: boolean;
  isHovered: boolean;
}

function FrameComponent({
  youtubeId,
  width,
  height,
  className = "",
  corner,
  edgeHorizontal,
  edgeVertical,
  mediaSize,
  borderThickness,
  borderSize,
  showFrame,
  isHovered,
}: FrameComponentProps) {
  const getCleanYoutubeEmbed = (id: string) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${id}&enablejsapi=1`;
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        height,
        transition: "width 0.3s ease-in-out, height 0.3s ease-in-out",
      }}
    >
      <div className="relative w-full h-full overflow-hidden bg-black">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 1,
            transition: "all 0.3s ease-in-out",
            padding: showFrame ? `${borderThickness}px` : "0",
            width: showFrame ? `${borderSize}%` : "100%",
            height: showFrame ? `${borderSize}%` : "100%",
            left: showFrame ? `${(100 - borderSize) / 2}%` : "0",
            top: showFrame ? `${(100 - borderSize) / 2}%` : "0",
          }}
        >
          <div
            className="w-full h-full overflow-hidden relative"
            style={{
              transform: `scale(${mediaSize})`,
              transformOrigin: "center",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            {/* Thumbnail - Always present, fades out on hover */}
            <Image
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="Reel Thumbnail"
              fill
              className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />
            
            {/* Video - Loads only on hover for performance and autoplay */}
            {isHovered && (
              <div className="absolute inset-0 z-10 pointer-events-none scale-[1.3]">
                <iframe
                  className="w-full h-full"
                  src={getCleanYoutubeEmbed(youtubeId)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                {/* Overlay to block YT interactions */}
                <div className="absolute inset-0 z-20" />
              </div>
            )}
          </div>
        </div>

        {showFrame && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            <div
              className="absolute top-0 left-0 w-16 h-16 bg-contain bg-no-repeat"
              style={{ backgroundImage: `url(${corner})` }}
            />
            <div
              className="absolute top-0 right-0 w-16 h-16 bg-contain bg-no-repeat"
              style={{ backgroundImage: `url(${corner})`, transform: "scaleX(-1)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-16 h-16 bg-contain bg-no-repeat"
              style={{ backgroundImage: `url(${corner})`, transform: "scaleY(-1)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-16 h-16 bg-contain bg-no-repeat"
              style={{ backgroundImage: `url(${corner})`, transform: "scale(-1, -1)" }}
            />

            <div
              className="absolute top-0 left-16 right-16 h-16"
              style={{
                backgroundImage: `url(${edgeHorizontal})`,
                backgroundSize: "auto 64px",
                backgroundRepeat: "repeat-x",
              }}
            />
            <div
              className="absolute bottom-0 left-16 right-16 h-16"
              style={{
                backgroundImage: `url(${edgeHorizontal})`,
                backgroundSize: "auto 64px",
                backgroundRepeat: "repeat-x",
                transform: "rotate(180deg)",
              }}
            />
            <div
              className="absolute left-0 top-16 bottom-16 w-16"
              style={{
                backgroundImage: `url(${edgeVertical})`,
                backgroundSize: "64px auto",
                backgroundRepeat: "repeat-y",
              }}
            />
            <div
              className="absolute right-0 top-16 bottom-16 w-16"
              style={{
                backgroundImage: `url(${edgeVertical})`,
                backgroundSize: "64px auto",
                backgroundRepeat: "repeat-y",
                transform: "scaleX(-1)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function VaelReel() {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hoverSize = isMobile ? 5 : 6;
  const gapSize = isMobile ? 2 : 4;

  const cornerSvg = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 64V2H64' stroke='white' stroke-width='1'/%3E%3C/svg%3E`;
  const edgeHSvg = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 2H64' stroke='white' stroke-width='1'/%3E%3C/svg%3E`;
  const edgeVSvg = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 0V64' stroke='white' stroke-width='1'/%3E%3C/svg%3E`;

  // The provided YouTube IDs
  const youtubeVideos = [
    "gJKxIAmhbvg", "QdEZtNyJb5g", "O1p-JVaAQV0",
    "xTrPSfbWa0w", "4UATuJFYKfg", "sroIT5FQMqs",
    "BYhQMzGxHmg", "eFhx307ykrk", "lya8BHX-8SY",
  ];

  const frames: Frame[] = youtubeVideos.map((id, i) => ({
    id: i,
    youtubeId: id,
    defaultPos: { x: (i % 3) * 4, y: Math.floor(i / 3) * 4, w: 4, h: 4 },
    corner: cornerSvg,
    edgeHorizontal: edgeHSvg,
    edgeVertical: edgeVSvg,
    mediaSize: 1.1,
    borderThickness: isMobile ? 1 : 2,
    borderSize: isMobile ? 98 : 96,
  }));

  const getRowSizes = () => {
    if (hovered === null) return "4fr 4fr 4fr";
    const { row } = hovered;
    const totalUnits = 12;
    const nonHoveredSize = (totalUnits - hoverSize) / 2;
    return [0, 1, 2].map((r) => (r === row ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ");
  };

  const getColSizes = () => {
    if (hovered === null) return "4fr 4fr 4fr";
    const { col } = hovered;
    const totalUnits = 12;
    const nonHoveredSize = (totalUnits - hoverSize) / 2;
    return [0, 1, 2].map((c) => (c === col ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ");
  };

  const getTransformOrigin = (x: number, y: number) => {
    const vertical = y === 0 ? "top" : y === 4 ? "center" : "bottom";
    const horizontal = x === 0 ? "left" : x === 4 ? "center" : "right";
    return `${vertical} ${horizontal}`;
  };

  return (
    <section id="reel" className="py-24 md:py-32 bg-background border-y border-border/10 overflow-hidden">
      <div className="px-8 md:px-16 mb-16 text-center md:text-left">
        <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">Kinetic Work Reel — 2024</span>
      </div>
      
      <div className="px-4 md:px-16 h-[500px] md:h-[800px]">
        <div
          className="relative w-full h-full bg-black/5"
          style={{
            display: "grid",
            gridTemplateRows: getRowSizes(),
            gridTemplateColumns: getColSizes(),
            gap: `${gapSize}px`,
            transition: "grid-template-rows 0.4s cubic-bezier(0.65, 0, 0.35, 1), grid-template-columns 0.4s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          {frames.map((frame) => {
            const row = Math.floor(frame.defaultPos.y / 4);
            const col = Math.floor(frame.defaultPos.x / 4);
            const transformOrigin = getTransformOrigin(frame.defaultPos.x, frame.defaultPos.y);

            return (
              <motion.div
                key={frame.id}
                className="relative overflow-hidden bg-muted/20"
                style={{
                  transformOrigin,
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={() => setHovered({ row, col })}
                onMouseLeave={() => setHovered(null)}
              >
                <FrameComponent
                  youtubeId={frame.youtubeId}
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                  corner={frame.corner}
                  edgeHorizontal={frame.edgeHorizontal}
                  edgeVertical={frame.edgeVertical}
                  mediaSize={frame.mediaSize}
                  borderThickness={frame.borderThickness}
                  borderSize={frame.borderSize}
                  showFrame={true}
                  isHovered={hovered?.row === row && hovered?.col === col}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
