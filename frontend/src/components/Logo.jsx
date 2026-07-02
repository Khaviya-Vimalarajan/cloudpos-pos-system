import React from 'react';

export default function Logo({ className = "h-9 w-9" }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudpos-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" /> {/* Indigo-500 */}
          <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet-500 */}
          <stop offset="100%" stopColor="#EC4899" /> {/* Pink-500 */}
        </linearGradient>
        <filter id="logo-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer Dashed Tech Circle */}
      <circle cx="64" cy="64" r="56" stroke="url(#cloudpos-grad)" strokeWidth="2.5" strokeDasharray="8 5" opacity="0.4" />
      
      {/* Glowing Hexagon Base */}
      <path
        d="M64 16L104 39.1V88.9L64 112L24 88.9V39.1L64 16Z"
        fill="url(#cloudpos-grad)"
        filter="url(#logo-glow)"
      />
      
      {/* Inner Cloud Graphic */}
      <path
        d="M50 56C50 50.5 54.5 46 60 46C61.8 46 63.5 46.5 64.9 47.4C66.8 44.1 70.3 42 74.3 42C79.9 42 84.5 46.1 85.3 51.5C86.2 51.2 87.1 51 88 51C91.9 51 95 54.1 95 58C95 61.9 91.9 65 88 65H50C46.7 65 44 62.3 44 59C44 55.7 46.7 53 50 53"
        fill="white"
        opacity="0.95"
      />
      
      {/* Inner POS Terminal */}
      <path
        d="M48 70H80C82.2 70 84 71.8 84 74V86C84 88.2 82.2 90 80 90H48C45.8 90 44 88.2 44 86V74C44 71.8 45.8 70 48 70Z"
        fill="white"
      />
      
      {/* Terminal Screen & Keyboard details */}
      <rect x="49" y="74" width="30" height="9" rx="1.5" fill="#4F46E5" />
      <circle cx="53" cy="86" r="1.5" fill="#10B981" />
      <circle cx="58" cy="86" r="1.5" fill="#EF4444" />
      <circle cx="63" cy="86" r="1.5" fill="#F59E0B" />
      <line x1="70" y1="86" x2="78" y2="86" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
