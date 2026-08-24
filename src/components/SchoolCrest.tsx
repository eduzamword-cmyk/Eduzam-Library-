import React from 'react';

export const SchoolCrest: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Laurel Wreath */}
        <g stroke="#1e7e34" strokeWidth="2.5" fill="#28a745" strokeLinecap="round">
          <path d="M 46,120 C 30,105 24,75 36,45" fill="none" />
          {/* Leaves */}
          <path d="M 44,115 C 36,114 30,118 28,124 C 32,122 38,121 44,115 Z" />
          <path d="M 38,102 C 28,100 22,104 20,110 C 24,108 30,107 38,102 Z" />
          <path d="M 32,88 C 22,85 16,88 14,94 C 18,92 24,91 32,88 Z" />
          <path d="M 30,72 C 20,68 15,70 13,76 C 17,75 23,74 30,72 Z" />
          <path d="M 32,56 C 24,51 18,52 17,58 C 21,57 26,57 32,56 Z" />
          <path d="M 38,42 C 32,36 27,37 26,42 C 29,42 34,42 38,42 Z" />
        </g>

        {/* Right Laurel Wreath */}
        <g stroke="#1e7e34" strokeWidth="2.5" fill="#28a745" strokeLinecap="round">
          <path d="M 114,120 C 130,105 136,75 124,45" fill="none" />
          {/* Leaves */}
          <path d="M 116,115 C 124,114 130,118 132,124 C 128,122 122,121 116,115 Z" />
          <path d="M 122,102 C 132,100 138,104 140,110 C 136,108 130,107 122,102 Z" />
          <path d="M 128,88 C 138,85 144,88 146,94 C 142,92 136,91 128,88 Z" />
          <path d="M 130,72 C 140,68 145,70 147,76 C 143,75 137,74 130,72 Z" />
          <path d="M 128,56 C 136,51 142,52 143,58 C 139,57 134,57 128,56 Z" />
          <path d="M 122,42 C 128,36 133,37 134,42 C 131,42 126,42 122,42 Z" />
        </g>

        {/* Navy Shield Base */}
        <path 
          d="M 45,35 L 115,35 C 115,35 118,85 80,122 C 42,85 45,35 45,35 Z" 
          fill="#0c2340" 
          stroke="#d4af37" 
          strokeWidth="3.5" 
        />
        
        {/* Inner Gold Shield Border */}
        <path 
          d="M 50,40 L 110,40 C 110,40 113,80 80,114 C 47,80 50,40 50,40 Z" 
          fill="none" 
          stroke="#f1c40f" 
          strokeWidth="1.2" 
        />

        {/* Torch on Top */}
        <g>
          {/* Torch Bowl */}
          <path d="M 72,35 L 88,35 L 84,42 L 76,42 Z" fill="#d4af37" stroke="#b8860b" strokeWidth="1" />
          {/* Torch Handle */}
          <rect x="78.5" y="42" width="3" height="10" fill="#b8860b" />
          {/* Torch Flame */}
          <path d="M 80,15 C 84,23 90,26 86,34 C 82,34 78,34 74,34 C 70,26 76,23 80,15 Z" fill="#ff4500" />
          <path d="M 80,20 C 82,25 85,27 83,32 C 80,32 78,32 77,32 C 75,27 78,25 80,20 Z" fill="#ffd700" />
        </g>

        {/* Open Book in Center of Shield */}
        <g transform="translate(0, 12)">
          {/* Left Page */}
          <path 
            d="M 80,68 C 72,64 62,64 56,66 L 56,86 C 62,84 72,84 80,88 Z" 
            fill="#ffffff" 
            stroke="#0c2340" 
            strokeWidth="1.2" 
          />
          {/* Right Page */}
          <path 
            d="M 80,68 C 88,64 98,64 104,66 L 104,86 C 98,84 88,84 80,88 Z" 
            fill="#ffffff" 
            stroke="#0c2340" 
            strokeWidth="1.2" 
          />
          {/* Book Spine Line */}
          <line x1="80" y1="68" x2="80" y2="88" stroke="#0c2340" strokeWidth="1.5" />
          
          {/* Page Lines (Text representation) */}
          <line x1="60" y1="71" x2="75" y2="70" stroke="#0c2340" strokeWidth="1" strokeLinecap="round" />
          <line x1="60" y1="76" x2="75" y2="75" stroke="#0c2340" strokeWidth="1" strokeLinecap="round" />
          <line x1="60" y1="81" x2="75" y2="80" stroke="#0c2340" strokeWidth="1" strokeLinecap="round" />
          
          <line x1="85" y1="70" x2="100" y2="71" stroke="#0c2340" strokeWidth="1" strokeLinecap="round" />
          <line x1="85" y1="75" x2="100" y2="76" stroke="#0c2340" strokeWidth="1" strokeLinecap="round" />
          <line x1="85" y1="80" x2="100" y2="81" stroke="#0c2340" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Bottom Banner Ribbon */}
        <g>
          {/* Banner Body */}
          <path 
            d="M 28,136 L 132,136 L 126,148 L 34,148 Z" 
            fill="#0c2340" 
            stroke="#d4af37" 
            strokeWidth="1.5" 
          />
          {/* Banner Tails */}
          <path d="M 28,136 L 20,142 L 30,148 L 34,144 Z" fill="#071626" />
          <path d="M 132,136 L 140,142 L 130,148 L 126,144 Z" fill="#071626" />
          
          {/* Ribbon Text */}
          <text 
            x="80" 
            y="144" 
            textAnchor="middle" 
            fill="#ffffff" 
            fontSize="5.2" 
            fontWeight="bold" 
            letterSpacing="0.4"
            fontFamily="Arial, sans-serif"
          >
            DISCIPLINE • KNOWLEDGE • EXCELLENCE
          </text>
        </g>
      </svg>
    </div>
  );
};
