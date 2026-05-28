'use client';

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Frame {
  id: number
  video: string
  defaultPos: { x: number; y: number; w: number; h: number }
  corner: string
  edgeHorizontal: string
  edgeVertical: string
  mediaSize: number
  borderThickness: number
  borderSize: number
}

interface FrameComponentProps {
  video: string
  width: number | string
  height: number | string
  className?: string
  corner: string
  edgeHorizontal: string
  edgeVertical: string
  mediaSize: number
  borderThickness: number
  borderSize: number
  showFrame: boolean
  isHovered: boolean
}

function FrameComponent({
  video,
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
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isHovered) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [isHovered])

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
            className="w-full h-full overflow-hidden"
            style={{
              transform: `scale(${mediaSize})`,
              transformOrigin: "center",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <video
              className="w-full h-full object-cover"
              src={video}
              loop
              muted
              playsInline
              ref={videoRef}
              autoPlay
            />
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
  )
}

interface DynamicFrameLayoutProps {
  frames: Frame[]
  className?: string
  showFrames?: boolean
  hoverSize?: number
  gapSize?: number
}

function DynamicFrameLayout({ 
  frames: initialFrames, 
  className,
  showFrames = false,
  hoverSize = 6,
  gapSize = 4
}: DynamicFrameLayoutProps) {
  const [frames] = useState<Frame[]>(initialFrames)
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null)

  const getRowSizes = () => {
    if (hovered === null) return "4fr 4fr 4fr"
    const { row } = hovered
    const nonHoveredSize = (12 - hoverSize) / 2
    return [0, 1, 2].map((r) => (r === row ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ")
  }

  const getColSizes = () => {
    if (hovered === null) return "4fr 4fr 4fr"
    const { col } = hovered
    const nonHoveredSize = (12 - hoverSize) / 2
    return [0, 1, 2].map((c) => (c === col ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ")
  }

  const getTransformOrigin = (x: number, y: number) => {
    const vertical = y === 0 ? "top" : y === 4 ? "center" : "bottom"
    const horizontal = x === 0 ? "left" : x === 4 ? "center" : "right"
    return `${vertical} ${horizontal}`
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        display: "grid",
        gridTemplateRows: getRowSizes(),
        gridTemplateColumns: getColSizes(),
        gap: `${gapSize}px`,
        transition: "grid-template-rows 0.4s ease, grid-template-columns 0.4s ease",
      }}
    >
      {frames.map((frame) => {
        const row = Math.floor(frame.defaultPos.y / 4)
        const col = Math.floor(frame.defaultPos.x / 4)
        const transformOrigin = getTransformOrigin(frame.defaultPos.x, frame.defaultPos.y)

        return (
          <motion.div
            key={frame.id}
            className="relative"
            style={{
              transformOrigin,
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={() => setHovered({ row, col })}
            onMouseLeave={() => setHovered(null)}
          >
            <FrameComponent
              video={frame.video}
              width="100%"
              height="100%"
              className="absolute inset-0"
              corner={frame.corner}
              edgeHorizontal={frame.edgeHorizontal}
              edgeVertical={frame.edgeVertical}
              mediaSize={frame.mediaSize}
              borderThickness={frame.borderThickness}
              borderSize={frame.borderSize}
              showFrame={showFrames}
              isHovered={hovered?.row === row && hovered?.col === col}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export function VaelReel() {
  const cornerSvg = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 64V2H64' stroke='white' stroke-width='1'/%3E%3C/svg%3E`;
  const edgeHSvg = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 2H64' stroke='white' stroke-width='1'/%3E%3C/svg%3E`;
  const edgeVSvg = `data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 0V64' stroke='white' stroke-width='1'/%3E%3C/svg%3E`;

  const sirv1 = "https://aquasaferoworks.sirv.com/1103193_1080p_Endurance_1280x720.mp4";
  const sirv2 = "https://aquasaferoworks.sirv.com/6013655_People_Men_1280x720.mp4";

  const frames: Frame[] = [
    { id: 0, video: sirv1, defaultPos: { x: 0, y: 0, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 1, video: sirv2, defaultPos: { x: 4, y: 0, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 2, video: sirv1, defaultPos: { x: 8, y: 0, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 3, video: sirv2, defaultPos: { x: 0, y: 4, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 4, video: sirv1, defaultPos: { x: 4, y: 4, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 5, video: sirv2, defaultPos: { x: 8, y: 4, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 6, video: sirv1, defaultPos: { x: 0, y: 8, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 7, video: sirv2, defaultPos: { x: 4, y: 8, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
    { id: 8, video: sirv1, defaultPos: { x: 8, y: 8, w: 4, h: 4 }, corner: cornerSvg, edgeHorizontal: edgeHSvg, edgeVertical: edgeVSvg, mediaSize: 1.1, borderThickness: 1, borderSize: 98 },
  ];

  return (
    <section id="reel" className="py-24 md:py-32 bg-background border-y border-border/10 overflow-hidden">
      <div className="px-8 md:px-16 mb-16 text-center md:text-left">
        <span className="text-[10px] tracking-[0.5em] uppercase text-primary/60 block">Kinetic Work Reel — 2024</span>
      </div>
      
      <div className="px-4 md:px-16 h-[500px] md:h-[800px] flex items-center justify-center">
        <div className="w-full h-full max-w-[1400px]">
          <DynamicFrameLayout frames={frames} showFrames={true} hoverSize={6} gapSize={4} />
        </div>
      </div>
    </section>
  )
}
