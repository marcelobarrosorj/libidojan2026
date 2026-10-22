import React, { useState, useEffect } from 'react';
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
  semMarca?: boolean;
  ajuste?: 'cover' | 'contain';
}

export function ProtectedImage({
  currentUser,
  fallbackSrc = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback',
  className,
  style,
  semMarca = false,
  ajuste = 'cover',
  ...props
}: ProtectedImageProps) {
  const [error, setError] = useState(false);

  // FOTO-FIX: zera o erro quando a URL muda.
  // Sem isso, o primeiro carregamento que falha deixava o avatar generico
  // travado para sempre, mesmo depois de a foto real estar disponivel.
  useEffect(() => {
    setError(false);
  }, [props.src]);

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
        className={"w-full h-full block " + (ajuste === "contain" ? "object-contain" : "object-cover")}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
          WebkitTouchCallout: 'none',
        }}
      />
      {!semMarca && <SecurityWatermark currentUser={currentUser} local={true} />}
    </div>
  );
}