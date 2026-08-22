import { useEffect, useRef, useState } from 'react';

interface StarBorderTrailProps {
  active: boolean;
  onComplete?: () => void;
}

export default function StarBorderTrail({ active, onComplete }: StarBorderTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [starPos, setStarPos] = useState<{ x: number; y: number; angle: number } | null>(null);
  const [totalProgress, setTotalProgress] = useState(0); // 0 to 2 (2 full rounds)
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDisappeared, setIsDisappeared] = useState(false);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Run the 2-round star animation then disappear
  useEffect(() => {
    if (!active || dimensions.width === 0 || dimensions.height === 0 || !pathRef.current) return;

    setIsDisappeared(false);
    setIsFadingOut(false);
    setTotalProgress(0);

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    if (totalLength === 0) return;

    let animationFrameId: number;
    let fadeTimeout: NodeJS.Timeout;
    let startTime: number | null = null;
    const duration = 4800; // 4.8 seconds for 2 complete rounds (2.4s per round)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const laps = progress * 2; // Exactly 2 rounds (0 to 2)

      setTotalProgress(laps);

      // Current distance along path for this lap
      const currentLapDist = (laps >= 2 ? 1 : (laps % 1)) * totalLength;
      const point = path.getPointAtLength(currentLapDist);

      // Calculate tangent angle for star orientation
      const nextPoint = path.getPointAtLength(Math.min(currentLapDist + 2, totalLength));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

      setStarPos({ x: point.x, y: point.y, angle });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Completed 2 full rounds -> fade out and disappear
        setIsFadingOut(true);
        fadeTimeout = setTimeout(() => {
          setIsDisappeared(true);
          if (onComplete) onComplete();
        }, 500); // 500ms smooth fade-out
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [active, dimensions.width, dimensions.height, onComplete]);

  if (isDisappeared) {
    return null;
  }

  const { width, height } = dimensions;
  const radius = 8;

  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none rounded-[8px]" />;
  }

  // Rounded rectangle path data
  const pathD = `M ${radius} 0 H ${width - radius} A ${radius} ${radius} 0 0 1 ${width} ${radius} V ${height - radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} H ${radius} A ${radius} ${radius} 0 0 1 0 ${height - radius} V ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;

  // Calculate stroke dasharray for the thin colorful trail
  const pathLength = pathRef.current ? pathRef.current.getTotalLength() : (2 * (width + height));
  const trailLength = Math.min(totalProgress, 1) === 1 && totalProgress >= 1 ? pathLength : (totalProgress % 1) * pathLength;
  const leadingTailLength = 100; // Refined luminous tail
  const headDist = (totalProgress % 1) * pathLength;

  return (
    <div
      ref={containerRef}
      className={`absolute -inset-[2px] pointer-events-none rounded-[10px] overflow-visible z-30 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <svg
        className="w-full h-full overflow-visible absolute inset-0 pointer-events-none"
        style={{ width: width + 4, height: height + 4, top: -2, left: -2 }}
      >
        <defs>
          {/* Vibrant Spectral Multi-Color Neon Gradient */}
          <linearGradient id="rainbowBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0055" />
            <stop offset="16%" stopColor="#ff6b00" />
            <stop offset="33%" stopColor="#ffcc00" />
            <stop offset="50%" stopColor="#00ff88" />
            <stop offset="68%" stopColor="#00d4ff" />
            <stop offset="84%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ff007f" />
          </linearGradient>

          {/* Intense Bright Core Gradient */}
          <linearGradient id="brightBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0" />
            <stop offset="40%" stopColor="#4facfe" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#f093fb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffdd00" stopOpacity="1" />
          </linearGradient>

          {/* Star Radial Aura Glow */}
          <radialGradient id="starRadialAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffe600" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#ff007f" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Filter for Bright Glow */}
          <filter id="starGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Reference measurement path */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth="1"
        />

        {/* 1. Thin Colorful Trail left along the border */}
        {totalProgress > 0 && (
          <>
            {/* Subtle Ambient Glow */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#rainbowBorderGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={totalProgress >= 1 ? 0 : pathLength - trailLength}
              className="opacity-70 blur-[1px]"
            />

            {/* Crisp Thin Multi-color Border Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#rainbowBorderGrad)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={totalProgress >= 1 ? 0 : pathLength - trailLength}
              className="opacity-100"
            />
          </>
        )}

        {/* 2. Leading Tail sweeping behind the active Star */}
        {!isFadingOut && starPos && totalProgress > 0 && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#brightBeamGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={`${leadingTailLength} ${pathLength}`}
            strokeDashoffset={-headDist + leadingTailLength}
            filter="url(#starGlowFilter)"
            className="opacity-100"
          />
        )}

        {/* 3. Petite & Elegant Moving Star (Reduced size) */}
        {!isFadingOut && starPos && (
          <g
            transform={`translate(${starPos.x}, ${starPos.y})`}
            className="transition-transform duration-75"
          >
            {/* Delicate Outer Corona Glow (r=8) */}
            <circle
              r="8"
              fill="url(#starRadialAura)"
              className="animate-pulse opacity-90 blur-[0.5px]"
            />

            {/* Rotating Star Group */}
            <g
              transform={`rotate(${totalProgress * 720})`}
              filter="url(#starGlowFilter)"
            >
              {/* Primary 4-Point Sharp Diamond Star Flare (Reduced to 14px span) */}
              <path
                d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z"
                fill="#ffffff"
                stroke="#ffd700"
                strokeWidth="0.5"
              />

              {/* Secondary Diagonal Diamond Flare (Reduced to 6px span) */}
              <path
                d="M -3 -3 L 0 0 L 3 -3 L 0 0 L 3 3 L 0 0 L -3 3 Z"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="0.4"
                className="opacity-80"
              />

              {/* Central Radiant Golden Core (r=1.75) */}
              <circle
                r="1.75"
                fill="#fffb00"
                stroke="#ffffff"
                strokeWidth="0.6"
              />
            </g>

            {/* Micro Sparkle Accents */}
            <circle cx="-5" cy="-3" r="0.75" fill="#ff007f" className="animate-ping opacity-75" />
            <circle cx="5" cy="3" r="0.75" fill="#00ffcc" className="animate-ping opacity-75" />
          </g>
        )}
      </svg>
    </div>
  );
}
