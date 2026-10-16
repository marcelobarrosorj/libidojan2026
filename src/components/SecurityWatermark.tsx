// WATERMARK-FULL: marca dagua cobrindo a foto inteira - padrao
// repetido via background SVG que preenche qualquer tamanho de
// foto ou tela, sem depender de contagem de divs. A
// identificacao (apelido + numero) fica presente em toda copia.
import { User } from '../types';
import { formatUserNumber } from '../utils/formatUserNumber';

interface SecurityWatermarkProps {
  currentUser?: User | null;
  local?: boolean;
}

function escaparSvg(t: string): string {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function SecurityWatermark({ currentUser, local = false }: SecurityWatermarkProps) {
  if (!currentUser) return null;

  const userNumber = formatUserNumber(currentUser.userNumber);
  const watermarkText = userNumber
    ? `${currentUser.nickname || ''} \u2022 #${userNumber} \u2022 Libido App`
    : `${currentUser.nickname || ''} \u2022 Libido App`;

  const celula = local ? { w: 280, h: 140, fs: 11 } : { w: 320, h: 160, fs: 12 };
  const opacidade = local ? 0.18 : 0.04;
  const cx = Math.round(celula.w / 2);
  const cy = Math.round(celula.h / 2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${celula.w}' height='${celula.h}'><text x='${cx}' y='${cy + 4}' font-family='Arial, Helvetica, sans-serif' font-size='${celula.fs}' font-weight='900' fill='rgba(255,255,255,${opacidade})' text-anchor='middle' transform='rotate(-30 ${cx} ${cy})' textLength='${celula.w - 24}' lengthAdjust='spacingAndGlyphs'>${escaparSvg(watermarkText.toUpperCase())}</text></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        backgroundImage: url,
        backgroundRepeat: 'repeat',
        zIndex: local ? 10 : 50,
      }}
    />
  );
}