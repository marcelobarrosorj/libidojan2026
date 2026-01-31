
import React from 'react';

interface LibidoIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

const LibidoIcon: React.FC<LibidoIconProps> = ({ size = 48, className = '', glow = false }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {glow && (
        <div 
          className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full animate-pulse"
          style={{ transform: 'scale(1.5)' }}
        />
      )}
      <svg 
        viewBox="0 0 1024 1024" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="gold-gradient" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path 
          d="M512 915.2C512 915.2 384 832 307.2 716.8C230.4 601.6 230.4 486.4 307.2 332.8C384 179.2 512 64 512 64C512 64 640 179.2 716.8 332.8C793.6 486.4 793.6 601.6 716.8 716.8C640 832 512 915.2 512 915.2ZM512 819.2C512 819.2 588.8 755.2 640 665.6C691.2 576 691.2 486.4 640 384C588.8 281.6 512 192 512 192C512 192 435.2 281.6 384 384C332.8 486.4 332.8 576 384 665.6C435.2 755.2 512 819.2 512 819.2Z" 
          fill="url(#gold-gradient)"
        />
        <path 
          d="M512 716.8C512 716.8 563.2 665.6 588.8 588.8C614.4 512 614.4 435.2 588.8 358.4C563.2 281.6 512 217.6 512 217.6C512 217.6 460.8 281.6 435.2 358.4C409.6 435.2 409.6 512 435.2 588.8C460.8 665.6 512 716.8 512 716.8Z" 
          fill="url(#gold-gradient)" 
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

export default LibidoIcon;
