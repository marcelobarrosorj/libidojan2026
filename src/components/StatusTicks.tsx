// STATUS-TICKS: confirma visual de envio, entrega e leitura.
// Um tique = enviado. Dois tiques = entregue. Dois tiques azuis = lido.
import type { StatusEnvio } from '../services/chatAvancado';

interface Props {
  status: StatusEnvio;
  className?: string;
}

function Tique({ duplo }: { duplo: boolean }) {
  if (!duplo) {
    return (
      <svg width="14" height="10" viewBox="0 0 16 11" fill="none" aria-hidden="true">
        <path
          d="M1 5.5L5.5 10L15 1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="10" viewBox="0 0 20 11" fill="none" aria-hidden="true">
      <path
        d="M1 5.5L5.5 10L15 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 5.5L10.5 10L20 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatusTicks({ status, className }: Props) {
  if (status === 'enviando') {
    return (
      <span className={'inline-flex items-center text-white/50 ' + (className || '')}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </span>
    );
  }

  if (status === 'falhou') {
    return (
      <span
        className={'inline-flex items-center text-red-400 ' + (className || '')}
        title="Falha ao enviar"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
        </svg>
      </span>
    );
  }

  const lido = status === 'lido';
  const duplo = status === 'entregue' || status === 'lido';

  return (
    <span
      className={
        'inline-flex items-center ' +
        (lido ? 'text-sky-400 ' : 'text-white/50 ') +
        (className || '')
      }
      title={lido ? 'Lido' : duplo ? 'Entregue' : 'Enviado'}
    >
      <Tique duplo={duplo} />
    </span>
  );
}