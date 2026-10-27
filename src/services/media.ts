/**
 * Sanitiza a imagem antes do upload.
 * Reencoda via canvas: remove EXIF/GPS, modelo de camera e data.
 */
function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("FALHA_AO_CARREGAR_IMAGEM"));
    img.src = src;
  });
}

export async function sanitizarImagem(
  file: File,
  maxLado = 1600,
  qualidade = 0.85
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file;
  if (file.size <= 0) return file;

  const url = URL.createObjectURL(file);

  try {
    const img = await carregarImagem(url);
    const larguraOriginal = img.naturalWidth || 1;
    const alturaOriginal = img.naturalHeight || 1;
    const maior = Math.max(larguraOriginal, alturaOriginal);
    const escala = maior > maxLado ? maxLado / maior : 1;
    const largura = Math.max(1, Math.round(larguraOriginal * escala));
    const altura = Math.max(1, Math.round(alturaOriginal * escala));

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, largura, altura);

    const tipo = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, tipo, qualidade);
    });

    if (!blob) return file;

    const base = (file.name || "foto").replace(/\.[^.]+$/, "");
    const extensao = tipo === "image/png" ? ".png" : ".jpg";

    return new File([blob], base + extensao, { type: tipo });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
