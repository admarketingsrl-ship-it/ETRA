import React from 'react';

interface EtraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

export const EtraLogo: React.FC<EtraLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'dark',
}) => {
  // Exact geometric reproduction of the official ETRA wordmark and subtitle
  const strokeColor = theme === 'dark' ? '#70839B' : '#1E293B';
  const subtitleColor = theme === 'dark' ? '#8696A7' : '#475569';

  const dimensions = {
    sm: { width: 140, height: 42 },
    md: { width: 210, height: 64 },
    lg: { width: 320, height: 96 },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 540 160"
        width={dimensions.width}
        height={dimensions.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-200"
      >
        {/* Letter E */}
        <path
          d="M40 32 H98 M40 32 V118 M40 75 H90 M40 118 H98"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="square"
        />

        {/* Letter T */}
        <path
          d="M170 32 H238 M204 32 V118"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="square"
        />

        {/* Letter R (distinctive geometric loop and diagonal meeting at baseline) */}
        <path
          d="M312 32 H348 C372 32 384 46 384 65 C384 84 372 96 348 96 H312 V118 M312 96 L376 118"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="square"
          strokeLinejoin="round"
        />

        {/* Letter A (clean chevron / sharp apex) */}
        <path
          d="M452 118 L488 32 L524 118"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* Subtitle: HOSPITALITY SOLUTIONS BOUTIQUE */}
        <text
          x="270"
          y="148"
          textAnchor="middle"
          fill={subtitleColor}
          fontSize="17.5"
          fontWeight="500"
          letterSpacing="11"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="uppercase"
        >
          HOSPITALITY SOLUTIONS BOUTIQUE
        </text>
      </svg>
    </div>
  );
};
