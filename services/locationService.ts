
const IBGE_API = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

let cachedCities: string[] = [];

export const fetchCities = async (query: string): Promise<string[]> => {
  if (query.length < 2) return [];

  try {
    if (cachedCities.length === 0) {
      const response = await fetch(`${IBGE_API}?orderBy=nome`);
      if (!response.ok) throw new Error('Falha ao buscar cidades');
      const data = await response.json();
      cachedCities = data.map((c: any) => {
        const name = c.nome;
        let uf = '';
        
        try {
          // Estrutura padrão: microrregiao -> mesorregiao -> UF
          if (c.microrregiao?.mesorregiao?.UF?.sigla) {
            uf = c.microrregiao.mesorregiao.UF.sigla;
          } 
          // Estrutura alternativa: municipio -> regiao-imediata -> regiao-intermediaria -> UF
          else if (c['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla) {
            uf = c['regiao-imediata']['regiao-intermediaria'].UF.sigla;
          }
          // Fallback final
          else if (c.regiao?.uf?.sigla) {
            uf = c.regiao.uf.sigla;
          }
        } catch (e) {
          console.warn(`[LOCATION] Erro ao extrair UF para ${name}:`, e);
        }

        return uf ? `${name} - ${uf}`.toUpperCase() : name.toUpperCase();
      });
    }

    const normalizedQuery = query.toUpperCase();
    const filtered = cachedCities.filter(city => {
      // Normaliza para comparação removendo acentos básicos
      const normalizedCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedTerm = normalizedQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedCity.includes(normalizedTerm);
    });
    
    return filtered
      .sort((a, b) => {
        const aStarts = a.startsWith(normalizedQuery);
        const bStarts = b.startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10); // Retorna top 10 sugestões
  } catch (error) {
    console.error('[LOCATION] Erro ao buscar cidades:', error);
    return [];
  }
};
