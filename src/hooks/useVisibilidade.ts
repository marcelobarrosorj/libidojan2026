import { useMemo } from 'react';
import { perfilVisivel, estaOnline, fotosDe, filtrarVisiveis } from '../services/visibilidade';

/**
 * Hook unico para filtrar perfis em qualquer tela.
 * Use em Feed, Radar, Mapa e listas para garantir a mesma regra.
 */
export function useVisibilidade<T extends Record<string, any>>(lista: T[] | null | undefined) {
  return useMemo(() => {
    const visiveis = filtrarVisiveis(lista);
    return {
      todos: visiveis,
      online: visiveis.filter((p) => estaOnline(p)),
      offline: visiveis.filter((p) => !estaOnline(p)),
      comFoto: visiveis.filter((p) => fotosDe(p).length > 0),
      total: visiveis.length,
    };
  }, [lista]);
}

export { perfilVisivel, estaOnline, fotosDe, filtrarVisiveis };