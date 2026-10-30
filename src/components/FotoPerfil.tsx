import { useState } from 'react';
import { fotosDe } from '../services/visibilidade';

type Props = {
  perfil: any;
  tamanho?: number;
  className?: string;
  alt?: string;
};

/** Mostra a primeira foto do perfil com fallback de iniciais. */
export default function FotoPerfil({ perfil, tamanho = 96, className = '', alt = '' }: Props) {
  const fotos = fotosDe(perfil);
  const [erro, setErro] = useState(false);
  const url = fotos[0];
  const nome = String(perfil?.nickname || perfil?.name || '?');
  const iniciais = nome.trim().slice(0, 2).toUpperCase();

  if (!url || erro) {
    return (
      <div
        className={className}
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: Math.max(12, tamanho * 0.32),
        }}
        aria-label={alt || nome}
      >
        {iniciais}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt || nome}
      className={className}
      onError={() => setErro(true)}
      style={{ width: tamanho, height: tamanho, borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}