import { useEffect, useRef, useState } from "react";
import { abrirMidiaUnica, confirmarMidiaConsumida } from "../services/chatModeracao";

type Props = {
  messageId: string;
  onFechar: () => void;
};

type Estado = "abrindo" | "pronta" | "consumida" | "erro";

export default function MidiaUnica({ messageId, onFechar }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>("abrindo");
  const reivindicou = useRef(false);

  useEffect(() => {
    if (reivindicou.current) return;
    reivindicou.current = true;
    let ativo = true;

    abrirMidiaUnica(messageId)
      .then((r) => {
        if (!ativo) return;
        if (r.jaAberta || !r.url) {
          setEstado("consumida");
          return;
        }
        setUrl(r.url);
        setEstado("pronta");
      })
      .catch(() => {
        if (ativo) setEstado("erro");
      });

    return () => {
      ativo = false;
    };
  }, [messageId]);

  function fechar() {
    confirmarMidiaConsumida(messageId).finally(() => onFechar());
  }

  const base = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    gap: 12,
    background: "rgba(0,0,0,0.94)",
    color: "#fff",
    cursor: "pointer",
  };

  if (estado === "abrindo") {
    return <div style={base}>Abrindo...</div>;
  }

  if (estado === "consumida") {
    return (
      <div style={base} onClick={onFechar} role="button" tabIndex={0}>
        <span style={{ fontSize: 15, opacity: 0.85 }}>Foto ja visualizada</span>
        <span style={{ fontSize: 12, opacity: 0.5 }}>toque para fechar</span>
      </div>
    );
  }

  if (estado === "erro" || !url) {
    return (
      <div style={base} onClick={onFechar} role="button" tabIndex={0}>
        <span style={{ fontSize: 15, opacity: 0.85 }}>Nao foi possivel abrir a foto</span>
        <span style={{ fontSize: 12, opacity: 0.5 }}>toque para fechar</span>
      </div>
    );
  }

  return (
    <div style={base} onClick={fechar} role="button" tabIndex={0}>
      <img
        src={url}
        alt="Foto de visualizacao unica"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => confirmarMidiaConsumida(messageId)}
        style={{
          maxWidth: "94vw",
          maxHeight: "82vh",
          objectFit: "contain",
          userSelect: "none",
          WebkitUserSelect: "none",
          pointerEvents: "none",
        }}
      />
      <span style={{ fontSize: 12, opacity: 0.6 }}>
        Visualizacao unica - toque para fechar
      </span>
    </div>
  );
}