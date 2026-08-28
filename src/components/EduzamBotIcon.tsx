import React from 'react';

interface EduzamBotIconProps {
  className?: string;
  color?: string;
}

export default function EduzamBotIcon({ className = "w-6 h-6", color = "currentColor" }: EduzamBotIconProps) {
  // Unique mask ID to avoid collision if multiple instances are rendered
  const maskId = React.useId().replace(/:/g, "-");

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Mask to cut out a gap in the head circle for the microphone */}
        <mask id={`mask-${maskId}`}>
          <rect x="0" y="0" width="100" height="100" fill="white" />
          {/* Thick cutout for microphone boom arm */}
          <path 
            d="M 77 52 C 77 66 65 66 58 66" 
            stroke="black" 
            strokeWidth="11" 
            strokeLinecap="round" 
            fill="none"
          />
          {/* Thick cutout for microphone capsule */}
          <rect x="44" y="55" width="23" height="17" rx="8.5" fill="black" />
        </mask>
      </defs>

      {/* Headset Arch */}
      <path 
        d="M 22 48 A 28 28 0 0 1 78 48" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round" 
        fill="none"
      />
      
      {/* Ear Cushions */}
      <rect x="15" y="38" width="8" height="20" rx="4" fill={color} />
      <rect x="77" y="38" width="8" height="20" rx="4" fill={color} />
      
      {/* Head Circle with Microphone cutout mask */}
      <circle 
        cx="50" 
        cy="50" 
        r="23" 
        fill={color} 
        mask={`url(#mask-${maskId})`} 
      />
      
      {/* White Visor / Eyes Mask */}
      <rect x="33" y="41" width="34" height="16" rx="8" fill="white" />
      
      {/* Two Eyes */}
      <circle cx="41.5" cy="49" r="4.5" fill={color} />
      <circle cx="58.5" cy="49" r="4.5" fill={color} />
      
      {/* Actual Microphone Boom Arm */}
      <path 
        d="M 77 52 C 77 66 65 66 58 66" 
        stroke={color} 
        strokeWidth="5" 
        strokeLinecap="round" 
        fill="none"
      />
      {/* Actual Microphone Capsule */}
      <rect x="48" y="59" width="15" height="9" rx="4.5" fill={color} />
    </svg>
  );
}
