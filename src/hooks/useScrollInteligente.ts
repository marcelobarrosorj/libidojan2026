import { useRef, useEffect, useCallback } from 'react';

/**
 * Rola para o fim APENAS quando o usuario ja esta no fim.
 * Se ele rolou para cima para ler o historico, nao interrompe.
 */
export function useScrollInteligente<T extends HTMLElement>(dependencia: unknown) {
  const ref = useRef<T | null>(null);
  const noFim = useRef(true);

  const aoRolar = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const folga = 80;
    noFim.current = el.scrollHeight - el.scrollTop - el.clientHeight <= folga;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', aoRolar, { passive: true });
    return () => el.removeEventListener('scroll', aoRolar);
  }, [aoRolar]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (noFim.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dependencia]);

  return ref;
}