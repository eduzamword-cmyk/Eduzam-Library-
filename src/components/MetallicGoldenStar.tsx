import React from 'react';
import { motion } from 'motion/react';

interface MetallicGoldenStarProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function MetallicGoldenStar({
  size = 32,
  className = '',
  animate = true,
}: MetallicGoldenStarProps) {
  const starContent = (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Clean 2D Vector Golden AI Star */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-[0_1px_3px_rgba(212,175,55,0.4)] relative z-10"
      >
        <defs>
          <linearGradient id="flatGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* 2D 4-Point AI Star Shape */}
        <path
          d="M 50 2 Q 50 50 98 50 Q 50 50 50 98 Q 50 50 2 50 Q 50 50 50 2 Z"
          fill="url(#flatGoldGrad)"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner subtle core highlight */}
        <circle cx="50" cy="50" r="8" fill="#FFFFFF" opacity="0.6" />
      </svg>
    </div>
  );

  if (!animate) return starContent;

  return (
    <motion.div
      animate={{
        scale: [1, 1.04, 1],
        opacity: [0.95, 1, 0.95],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="inline-flex items-center justify-center"
    >
      {starContent}
    </motion.div>
  );
}
