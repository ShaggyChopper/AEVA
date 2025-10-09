import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const AevaIcon: React.FC<IconProps> = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aeva-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
    </defs>
    <path
      d="M16 4L4 28H8L10.6667 21.3333H21.3333L24 28H28L16 4ZM12 17.3333L16 7.33333L20 17.3333H12Z"
      fill="url(#aeva-gradient)"
    />
  </svg>
);
