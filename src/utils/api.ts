export async function parseApiResponse(response: Response) {
  const contentType = (response.headers && typeof response.headers.get === 'function') 
    ? (response.headers.get("content-type") || "")
    : "application/json";

  if (!contentType.includes("application/json")) {
    throw new Error("A API retornou uma resposta inválida.");
  }

  try {
    if (typeof response.text === 'function') {
      const raw = await response.text();
      return JSON.parse(raw);
    } else {
      return await response.json();
    }
  } catch {
    throw new Error("Não foi possível interpretar a resposta da API.");
  }
}