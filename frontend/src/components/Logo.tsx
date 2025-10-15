import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#764ba2" />
            <stop offset="100%" stopColor="#f093fb" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Main circular background with gradient */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="url(#logoGradient)"
          filter="url(#shadow)"
        />

        {/* Inner highlight circle */}
        <circle
          cx="18"
          cy="18"
          r="6"
          fill="rgba(255,255,255,0.3)"
        />

        {/* Stylized "A" */}
        <path
          d="M16 32 L20 20 L24 32 M18 28 L22 28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Stylized "B" */}
        <path
          d="M28 20 L28 32 L32 32 C34 32 35 31 35 29 L35 23 C35 21 34 20 32 20 L28 20 M28 26 L33 26"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Small accent dot */}
        <circle
          cx="38"
          cy="16"
          r="2"
          fill="rgba(255,255,255,0.8)"
        />
      </svg>
    </div>
  );
};

export default Logo;
