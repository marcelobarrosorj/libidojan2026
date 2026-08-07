import React, { useState } from 'react';
import { User } from '../types';
import { SecurityWatermark } from './SecurityWatermark';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  style?: React.CSSProperties;
  src?: string;
  alt?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  currentUser?: User | null;
  fallbackSrc?: string;
}

export function ProtectedImage({ currentUser, fallbackSrc = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback', className, style, ...props }: ProtectedImageProps) {
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className || ''}`} style={style}>
      <img
        {...props}
        src={error ? fallbackSrc : props.src}
        onError={(e) => {
          setError(true);
          if (props.onError) props.onError(e);
        }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full object-cover block"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
          WebkitTouchCallout: 'none',
        }}
      />
      <SecurityWatermark currentUser={currentUser} local={true} />
    </div>
  );
}
