// WATERMARK-FULL: marca d'agua cobrindo a foto inteira - padrao repetido
// via SVG que preenche qualquer tamanho de foto ou tela.
// WATERMARK-NUNCA-NULL: a versao anterior fazia "if (!currentUser) return null".
// Quando o usuario ainda nao estava carregado, a foto era exibida 100% limpa,
// sem erro e sem aviso. Agora sempre existe marca, com identidade de fallback.
// WATERMARK-CONTRASTE: texto branco ganhou contorno preto. Antes, 18% de branco
// sobre foto clara era invisivel; agora aparece sobre foto clara e escura.
import { User } from '../types';
import { formatUserNumber } from '../utils/formatUserNumber';

interface SecurityWatermarkProps {
  currentUser?: User | null;
  local?: boolean;
  identidade?: string;
}

function escaparSvg(t: string): string {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function partesIdentidade(currentUser?: User | null, identidade?: string): string[] {
  if (identidade && identidade.trim()) {
    return [identidade.trim().toUpperCase(), 'LIBIDO APP'];
  }

  const partes: string[] = [];

  if (currentUser) {
    const apelido = (currentUser.nickname || '').trim();
    if (apelido) partes.push(apelido);

    const numero = formatUserNumber(currentUser.userNumber);
    if (numero) partes.push('#' + numero);
  }

  if (partes.length === 0) partes.push('CONTEUDO PROTEGIDO');
  partes.push('LIBIDO APP');

  return partes;
}

export function SecurityWatermark({ currentUser, local = false, identidade }: SecurityWatermarkProps) {
  const lista = partesIdentidade(currentUser, identidade);
  const textoCompleto = lista.join(' \u2022 ').toUpperCase();
  const textoCurto = lista.filter((p) => p !== 'LIBIDO APP').join(' \u2022 ').toUpperCase();

  const celula = local ? { w: 280, h: 140, fs: 11 } : { w: 320, h: 160, fs: 12 };
  const opacidade = local ? 0.30 : 0.10;
  const contorno = local ? 0.38 : 0.14;

  const cx = Math.round(celula.w / 2);
  const cy = Math.round(celula.h / 2);
  const largura = celula.w - 24;

  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='" + celula.w + "' height='" + celula.h + "'>" +
    "<text x='" + cx + "' y='" + (cy + 4) + "'" +
    " font-family='Arial, Helvetica, sans-serif'" +
    " font-size='" + celula.fs + "'" +
    " font-weight='900'" +
    " fill='rgba(255,255,255," + opacidade + ")'" +
    " stroke='rgba(0,0,0," + contorno + ")'" +
    " stroke-width='2'" +
    " paint-order='stroke'" +
    " text-anchor='middle'" +
    " transform='rotate(-30 " + cx + " " + cy + ")'" +
    " textLength='" + largura + "'" +
    " lengthAdjust='spacingAndGlyphs'" +
    ">" + escaparSvg(textoCompleto) + "</text>" +
    "</svg>";

  const url = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(svg) + "\")";

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: url,
          backgroundRepeat: 'repeat',
          zIndex: local ? 10 : 50,
        }}
      />
      <div
        className="absolute bottom-0 right-0 pointer-events-none px-1.5 py-0.5"
        style={{
          zIndex: local ? 11 : 51,
          background: 'rgba(0,0,0,0.55)',
          borderTopLeftRadius: 6,
          maxWidth: '100%',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}
        >
          {textoCurto || 'CONTEUDO PROTEGIDO'}
        </span>
      </div>
    </>
  );
}