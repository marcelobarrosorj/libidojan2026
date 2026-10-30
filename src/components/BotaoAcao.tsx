import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  aoClicar: () => Promise<void> | void;
  children: ReactNode;
  textoCarregando?: string;
};

/** Botao que desabilita e mostra feedback enquanto a acao roda. */
export default function BotaoAcao({ aoClicar, children, textoCarregando = 'Aguarde...', disabled, ...rest }: Props) {
  const [carregando, setCarregando] = useState(false);

  async function executar() {
    if (carregando) return;
    setCarregando(true);
    try {
      await aoClicar();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <button
      {...rest}
      disabled={carregando || disabled}
      onClick={executar}
      style={{ opacity: carregando ? 0.6 : 1, cursor: carregando ? 'wait' : 'pointer', ...(rest.style || {}) }}
    >
      {carregando ? textoCarregando : children}
    </button>
  );
}