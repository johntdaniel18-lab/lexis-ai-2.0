import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Lexis AI Logo"
  >
    <defs>
      <linearGradient id="futuristic-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#F97316' }} />
        <stop offset="100%" style={{ stopColor: '#FB923C' }} />
      </linearGradient>
      <filter id="subtle-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    <g filter="url(#subtle-glow)">
      <g stroke="url(#futuristic-gradient)" fill="none" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter">
        {/* Outer Circle */}
        <circle cx="50" cy="50" r="45" />
        
        {/* Modern L shape with sharp edges */}
        <path d="M40 30 V 70 H 65" />
      </g>
    </g>
  </svg>
);

export default Logo;