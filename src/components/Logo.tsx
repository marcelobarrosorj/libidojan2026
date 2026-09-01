interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'w-7 h-9',
    md: 'w-9 h-12',
    lg: 'w-14 h-[72px]'
  };

  return (
    <div
      className={'inline-flex items-center justify-center select-none ' + className}
      aria-label="Libido"
    >
      <svg
        className={sizes[size]}
        viewBox="0 0 64 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Símbolo Libido"
      >
        <defs>
          <linearGradient
            id="libidoGold"
            x1="14"
            y1="6"
            x2="53"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFD66B" />
            <stop offset="0.45" stopColor="#F5A000" />
            <stop offset="1" stopColor="#B95B00" />
          </linearGradient>
        </defs>

        <path
          d="M32 5C21 17 14 28 14 40C14 53 22 63 32 69C42 63 50 53 50 40C50 28 43 17 32 5Z"
          stroke="url(#libidoGold)"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <path
          d="M32 19C26.8 26 23.5 32.5 23.5 39.5C23.5 46.2 27 51.6 32 55.5C37 51.6 40.5 46.2 40.5 39.5C40.5 32.5 37.2 26 32 19Z"
          fill="url(#libidoGold)"
        />
      </svg>
    </div>
  );
}
