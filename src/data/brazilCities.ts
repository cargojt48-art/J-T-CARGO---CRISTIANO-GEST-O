export interface BrazilCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste' | 'Norte';
}

export const STATE_COORDINATES: Record<string, { lat: number; lng: number; zoom: number; name: string }> = {
  ES: { lat: -20.0, lng: -40.5, zoom: 8, name: 'Espírito Santo' },
  SP: { lat: -22.5, lng: -48.5, zoom: 7, name: 'São Paulo' },
  RJ: { lat: -22.3, lng: -42.8, zoom: 8, name: 'Rio de Janeiro' },
  MG: { lat: -18.5, lng: -44.5, zoom: 6, name: 'Minas Gerais' },
  PR: { lat: -24.8, lng: -51.5, zoom: 7, name: 'Paraná' },
  SC: { lat: -27.2, lng: -50.5, zoom: 7, name: 'Santa Catarina' },
  RS: { lat: -30.0, lng: -53.0, zoom: 7, name: 'Rio Grande do Sul' },
  BA: { lat: -12.5, lng: -41.5, zoom: 6, name: 'Bahia' },
  GO: { lat: -15.9, lng: -50.0, zoom: 7, name: 'Goiás' },
  DF: { lat: -15.8, lng: -47.9, zoom: 10, name: 'Distrito Federal' },
  MT: { lat: -12.6, lng: -55.5, zoom: 6, name: 'Mato Grosso' },
  MS: { lat: -20.5, lng: -54.8, zoom: 6, name: 'Mato Grosso do Sul' },
  PE: { lat: -8.3, lng: -37.8, zoom: 7, name: 'Pernambuco' },
  CE: { lat: -5.2, lng: -39.3, zoom: 7, name: 'Ceará' },
  PA: { lat: -3.5, lng: -52.0, zoom: 5, name: 'Pará' },
  AM: { lat: -3.4, lng: -65.8, zoom: 5, name: 'Amazonas' },
  MA: { lat: -5.4, lng: -45.2, zoom: 6, name: 'Maranhão' },
  PB: { lat: -7.1, lng: -36.7, zoom: 8, name: 'Paraíba' },
  RN: { lat: -5.8, lng: -36.5, zoom: 8, name: 'Rio Grande do Norte' },
  AL: { lat: -9.6, lng: -36.6, zoom: 8, name: 'Alagoas' },
  SE: { lat: -10.6, lng: -37.4, zoom: 9, name: 'Sergipe' },
  PI: { lat: -7.7, lng: -42.7, zoom: 6, name: 'Piauí' },
  TO: { lat: -10.2, lng: -48.3, zoom: 6, name: 'Tocantins' },
  RO: { lat: -11.5, lng: -62.8, zoom: 6, name: 'Rondônia' },
  AC: { lat: -9.0, lng: -70.8, zoom: 6, name: 'Acre' },
  RR: { lat: 2.7, lng: -61.4, zoom: 6, name: 'Roraima' },
  AP: { lat: 1.4, lng: -51.9, zoom: 6, name: 'Amapá' },
};

export const BRAZIL_CITIES: BrazilCity[] = [
  // ================= ESPÍRITO SANTO (ES) =================
  { name: 'Vitória', state: 'ES', lat: -20.3155, lng: -40.3128, region: 'Sudeste' },
  { name: 'Vila Velha', state: 'ES', lat: -20.3297, lng: -40.2925, region: 'Sudeste' },
  { name: 'Serra', state: 'ES', lat: -20.1286, lng: -40.3078, region: 'Sudeste' },
  { name: 'Cariacica', state: 'ES', lat: -20.2639, lng: -40.4200, region: 'Sudeste' },
  { name: 'Cachoeiro de Itapemirim', state: 'ES', lat: -20.8489, lng: -41.1128, region: 'Sudeste' },
  { name: 'Linhares', state: 'ES', lat: -19.3969, lng: -40.0642, region: 'Sudeste' },
  { name: 'Colatina', state: 'ES', lat: -19.5392, lng: -40.6306, region: 'Sudeste' },
  { name: 'Guarapari', state: 'ES', lat: -20.6711, lng: -40.4981, region: 'Sudeste' },
  { name: 'São Mateus', state: 'ES', lat: -18.7161, lng: -39.8589, region: 'Sudeste' },
  { name: 'Aracruz', state: 'ES', lat: -19.8203, lng: -40.2733, region: 'Sudeste' },
  { name: 'Viana', state: 'ES', lat: -20.3908, lng: -40.4981, region: 'Sudeste' },
  { name: 'Nova Venécia', state: 'ES', lat: -18.7106, lng: -40.4006, region: 'Sudeste' },
  { name: 'Marataízes', state: 'ES', lat: -21.0433, lng: -40.8244, region: 'Sudeste' },
  { name: 'Anchieta', state: 'ES', lat: -20.8058, lng: -40.6456, region: 'Sudeste' },
  { name: 'Domingos Martins', state: 'ES', lat: -20.3633, lng: -40.6589, region: 'Sudeste' },
  { name: 'Castelo', state: 'ES', lat: -20.6039, lng: -41.2033, region: 'Sudeste' },
  { name: 'Itapemirim', state: 'ES', lat: -21.0111, lng: -40.8339, region: 'Sudeste' },
  { name: 'Barra de São Francisco', state: 'ES', lat: -18.7550, lng: -40.8906, region: 'Sudeste' },
  { name: 'Santa Maria de Jetibá', state: 'ES', lat: -20.0406, lng: -40.7461, region: 'Sudeste' },
  { name: 'Afonso Cláudio', state: 'ES', lat: -20.0769, lng: -41.1356, region: 'Sudeste' },
  { name: 'Baixo Guandu', state: 'ES', lat: -19.5189, lng: -41.0150, region: 'Sudeste' },
  { name: 'Piúma', state: 'ES', lat: -20.8344, lng: -40.7292, region: 'Sudeste' },
  { name: 'Iúna', state: 'ES', lat: -20.3458, lng: -41.5358, region: 'Sudeste' },
  { name: 'Guaçuí', state: 'ES', lat: -20.7756, lng: -41.6792, region: 'Sudeste' },
  { name: 'Venda Nova do Imigrante', state: 'ES', lat: -20.3278, lng: -41.1347, region: 'Sudeste' },

  // ================= SÃO PAULO (SP) =================
  { name: 'São Paulo', state: 'SP', lat: -23.55052, lng: -46.633308, region: 'Sudeste' },
  { name: 'Campinas', state: 'SP', lat: -22.9099, lng: -47.0626, region: 'Sudeste' },
  { name: 'São José dos Campos', state: 'SP', lat: -23.1896, lng: -45.8841, region: 'Sudeste' },
  { name: 'Ribeirão Preto', state: 'SP', lat: -21.1767, lng: -47.8108, region: 'Sudeste' },
  { name: 'Santos', state: 'SP', lat: -23.9618, lng: -46.3322, region: 'Sudeste' },
  { name: 'Sorocaba', state: 'SP', lat: -23.5015, lng: -47.4526, region: 'Sudeste' },
  { name: 'Guarulhos', state: 'SP', lat: -23.4542, lng: -46.5333, region: 'Sudeste' },
  { name: 'São Bernardo do Campo', state: 'SP', lat: -23.6939, lng: -46.565, region: 'Sudeste' },
  { name: 'Bauru', state: 'SP', lat: -22.3147, lng: -49.0606, region: 'Sudeste' },
  { name: 'São José do Rio Preto', state: 'SP', lat: -20.8113, lng: -49.3758, region: 'Sudeste' },
  { name: 'Jundiaí', state: 'SP', lat: -23.1857, lng: -46.8892, region: 'Sudeste' },
  { name: 'Piracicaba', state: 'SP', lat: -22.7253, lng: -47.6492, region: 'Sudeste' },
  { name: 'Osasco', state: 'SP', lat: -23.5329, lng: -46.7916, region: 'Sudeste' },
  { name: 'Santo André', state: 'SP', lat: -23.6639, lng: -46.5383, region: 'Sudeste' },
  { name: 'Taubaté', state: 'SP', lat: -23.0264, lng: -45.5558, region: 'Sudeste' },
  { name: 'Limeira', state: 'SP', lat: -22.5647, lng: -47.4017, region: 'Sudeste' },
  { name: 'Americana', state: 'SP', lat: -22.7375, lng: -47.3331, region: 'Sudeste' },
  { name: 'Franca', state: 'SP', lat: -20.5386, lng: -47.4008, region: 'Sudeste' },
  { name: 'Presidente Prudente', state: 'SP', lat: -22.1256, lng: -51.3889, region: 'Sudeste' },
  { name: 'Marília', state: 'SP', lat: -22.2139, lng: -49.9458, region: 'Sudeste' },
  { name: 'Paulínia', state: 'SP', lat: -22.7611, lng: -47.1539, region: 'Sudeste' },

  // ================= RIO DE JANEIRO (RJ) =================
  { name: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729, region: 'Sudeste' },
  { name: 'Duque de Caxias', state: 'RJ', lat: -22.7858, lng: -43.3117, region: 'Sudeste' },
  { name: 'Resende', state: 'RJ', lat: -22.4689, lng: -44.4468, region: 'Sudeste' },
  { name: 'Volta Redonda', state: 'RJ', lat: -22.5231, lng: -44.1042, region: 'Sudeste' },
  { name: 'Campos dos Goytacazes', state: 'RJ', lat: -21.7545, lng: -41.3242, region: 'Sudeste' },
  { name: 'Macaé', state: 'RJ', lat: -22.3708, lng: -41.7869, region: 'Sudeste' },
  { name: 'Niterói', state: 'RJ', lat: -22.8833, lng: -43.1039, region: 'Sudeste' },
  { name: 'São Gonçalo', state: 'RJ', lat: -22.8269, lng: -43.0539, region: 'Sudeste' },
  { name: 'Nova Iguaçu', state: 'RJ', lat: -22.7556, lng: -43.4603, region: 'Sudeste' },
  { name: 'Petrópolis', state: 'RJ', lat: -22.5050, lng: -43.1789, region: 'Sudeste' },
  { name: 'Cabo Frio', state: 'RJ', lat: -22.8789, lng: -42.0186, region: 'Sudeste' },
  { name: 'Angra dos Reis', state: 'RJ', lat: -23.0067, lng: -44.3181, region: 'Sudeste' },

  // ================= MINAS GERAIS (MG) =================
  { name: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345, region: 'Sudeste' },
  { name: 'Betim', state: 'MG', lat: -19.9678, lng: -44.1983, region: 'Sudeste' },
  { name: 'Contagem', state: 'MG', lat: -19.9317, lng: -44.0536, region: 'Sudeste' },
  { name: 'Uberlândia', state: 'MG', lat: -18.9186, lng: -48.2772, region: 'Sudeste' },
  { name: 'Juiz de Fora', state: 'MG', lat: -21.7595, lng: -43.3398, region: 'Sudeste' },
  { name: 'Pouso Alegre', state: 'MG', lat: -22.2301, lng: -45.9372, region: 'Sudeste' },
  { name: 'Uberaba', state: 'MG', lat: -19.7483, lng: -47.9319, region: 'Sudeste' },
  { name: 'Montes Claros', state: 'MG', lat: -16.7350, lng: -43.8617, region: 'Sudeste' },
  { name: 'Ipatinga', state: 'MG', lat: -19.4681, lng: -42.5367, region: 'Sudeste' },
  { name: 'Governador Valadares', state: 'MG', lat: -18.8511, lng: -41.9494, region: 'Sudeste' },
  { name: 'Varginha', state: 'MG', lat: -21.5514, lng: -45.4308, region: 'Sudeste' },
  { name: 'Poços de Caldas', state: 'MG', lat: -21.7850, lng: -46.5614, region: 'Sudeste' },
  { name: 'Divinópolis', state: 'MG', lat: -20.1450, lng: -44.8911, region: 'Sudeste' },
  { name: 'Sete Lagoas', state: 'MG', lat: -19.4608, lng: -44.2469, region: 'Sudeste' },

  // ================= PARANÁ (PR) =================
  { name: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733, region: 'Sul' },
  { name: 'São José dos Pinhais', state: 'PR', lat: -25.5347, lng: -49.2064, region: 'Sul' },
  { name: 'Londrina', state: 'PR', lat: -23.3045, lng: -51.1696, region: 'Sul' },
  { name: 'Maringá', state: 'PR', lat: -23.421, lng: -51.9331, region: 'Sul' },
  { name: 'Cascavel', state: 'PR', lat: -24.9578, lng: -53.4595, region: 'Sul' },
  { name: 'Foz do Iguaçu', state: 'PR', lat: -25.5478, lng: -54.5881, region: 'Sul' },
  { name: 'Ponta Grossa', state: 'PR', lat: -25.0950, lng: -50.1619, region: 'Sul' },
  { name: 'Paranaguá', state: 'PR', lat: -25.5205, lng: -48.5094, region: 'Sul' },

  // ================= SANTA CATARINA (SC) =================
  { name: 'Florianópolis', state: 'SC', lat: -27.5954, lng: -48.548, region: 'Sul' },
  { name: 'Joinville', state: 'SC', lat: -26.3045, lng: -48.8487, region: 'Sul' },
  { name: 'Itajaí', state: 'SC', lat: -26.9078, lng: -48.6619, region: 'Sul' },
  { name: 'Blumenau', state: 'SC', lat: -26.9194, lng: -49.0661, region: 'Sul' },
  { name: 'Chapecó', state: 'SC', lat: -27.1004, lng: -52.6152, region: 'Sul' },
  { name: 'Criciúma', state: 'SC', lat: -28.6775, lng: -49.3703, region: 'Sul' },
  { name: 'Navegantes', state: 'SC', lat: -26.8950, lng: -48.6539, region: 'Sul' },

  // ================= RIO GRANDE DO SUL (RS) =================
  { name: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177, region: 'Sul' },
  { name: 'Caxias do Sul', state: 'RS', lat: -29.1678, lng: -51.1794, region: 'Sul' },
  { name: 'Canoas', state: 'RS', lat: -29.9178, lng: -51.1836, region: 'Sul' },
  { name: 'Passo Fundo', state: 'RS', lat: -28.2628, lng: -52.4067, region: 'Sul' },
  { name: 'Rio Grande', state: 'RS', lat: -32.035, lng: -52.0986, region: 'Sul' },
  { name: 'Pelotas', state: 'RS', lat: -31.7654, lng: -52.3376, region: 'Sul' },
  { name: 'Santa Maria', state: 'RS', lat: -29.6842, lng: -53.8069, region: 'Sul' },
  { name: 'Novo Hamburgo', state: 'RS', lat: -29.6783, lng: -51.1306, region: 'Sul' },

  // ================= BAHIA (BA) =================
  { name: 'Salvador', state: 'BA', lat: -12.9777, lng: -38.5016, region: 'Nordeste' },
  { name: 'Feira de Santana', state: 'BA', lat: -12.2664, lng: -38.9663, region: 'Nordeste' },
  { name: 'Vitória da Conquista', state: 'BA', lat: -14.8661, lng: -40.8394, region: 'Nordeste' },
  { name: 'Camaçari', state: 'BA', lat: -12.6975, lng: -38.3242, region: 'Nordeste' },
  { name: 'Itabuna', state: 'BA', lat: -14.7878, lng: -39.2789, region: 'Nordeste' },
  { name: 'Ilhéus', state: 'BA', lat: -14.7889, lng: -39.0494, region: 'Nordeste' },
  { name: 'Luís Eduardo Magalhães', state: 'BA', lat: -12.0967, lng: -45.7958, region: 'Nordeste' },
  { name: 'Barreiras', state: 'BA', lat: -12.1444, lng: -44.9961, region: 'Nordeste' },
  { name: 'Teixeira de Freitas', state: 'BA', lat: -17.5358, lng: -39.7422, region: 'Nordeste' },

  // ================= GOIÁS / DISTRITO FEDERAL (GO / DF) =================
  { name: 'Goiânia', state: 'GO', lat: -16.6869, lng: -49.2648, region: 'Centro-Oeste' },
  { name: 'Anápolis', state: 'GO', lat: -16.3267, lng: -48.9534, region: 'Centro-Oeste' },
  { name: 'Aparecida de Goiânia', state: 'GO', lat: -16.8228, lng: -49.2481, region: 'Centro-Oeste' },
  { name: 'Rio Verde', state: 'GO', lat: -17.7919, lng: -50.9192, region: 'Centro-Oeste' },
  { name: 'Itumbiara', state: 'GO', lat: -18.4194, lng: -49.2158, region: 'Centro-Oeste' },
  { name: 'Brasília', state: 'DF', lat: -15.7975, lng: -47.8919, region: 'Centro-Oeste' },

  // ================= CENTRO-OESTE (MT / MS) =================
  { name: 'Cuiabá', state: 'MT', lat: -15.6014, lng: -56.0979, region: 'Centro-Oeste' },
  { name: 'Várzea Grande', state: 'MT', lat: -15.6528, lng: -56.1361, region: 'Centro-Oeste' },
  { name: 'Rondonópolis', state: 'MT', lat: -16.4674, lng: -54.636, region: 'Centro-Oeste' },
  { name: 'Sinop', state: 'MT', lat: -11.8608, lng: -55.5097, region: 'Centro-Oeste' },
  { name: 'Campo Grande', state: 'MS', lat: -20.4697, lng: -54.6201, region: 'Centro-Oeste' },
  { name: 'Dourados', state: 'MS', lat: -22.2211, lng: -54.8056, region: 'Centro-Oeste' },
  { name: 'Três Lagoas', state: 'MS', lat: -20.7847, lng: -51.7042, region: 'Centro-Oeste' },

  // ================= NORDESTE (PE / CE / PB / RN / AL / SE / MA / PI) =================
  { name: 'Recife', state: 'PE', lat: -8.0476, lng: -34.877, region: 'Nordeste' },
  { name: 'Jaboatão dos Guararapes', state: 'PE', lat: -8.1133, lng: -35.0156, region: 'Nordeste' },
  { name: 'Caruaru', state: 'PE', lat: -8.2833, lng: -35.9761, region: 'Nordeste' },
  { name: 'Petrolina', state: 'PE', lat: -9.3892, lng: -40.5028, region: 'Nordeste' },
  { name: 'Fortaleza', state: 'CE', lat: -3.7319, lng: -38.5267, region: 'Nordeste' },
  { name: 'Sobral', state: 'CE', lat: -3.6892, lng: -40.3481, region: 'Nordeste' },
  { name: 'Juazeiro do Norte', state: 'CE', lat: -7.2131, lng: -39.3153, region: 'Nordeste' },
  { name: 'João Pessoa', state: 'PB', lat: -7.1195, lng: -34.8450, region: 'Nordeste' },
  { name: 'Campina Grande', state: 'PB', lat: -7.2219, lng: -35.8833, region: 'Nordeste' },
  { name: 'Natal', state: 'RN', lat: -5.7945, lng: -35.2110, region: 'Nordeste' },
  { name: 'Mossoró', state: 'RN', lat: -5.1878, lng: -37.3442, region: 'Nordeste' },
  { name: 'Maceió', state: 'AL', lat: -9.6658, lng: -35.7350, region: 'Nordeste' },
  { name: 'Aracaju', state: 'SE', lat: -10.9472, lng: -37.0731, region: 'Nordeste' },
  { name: 'São Luís', state: 'MA', lat: -2.5391, lng: -44.2828, region: 'Nordeste' },
  { name: 'Imperatriz', state: 'MA', lat: -5.5264, lng: -47.4778, region: 'Nordeste' },
  { name: 'Teresina', state: 'PI', lat: -5.0920, lng: -42.8038, region: 'Nordeste' },

  // ================= NORTE (PA / AM / RO / TO / AP / RR / AC) =================
  { name: 'Belém', state: 'PA', lat: -1.4558, lng: -48.4902, region: 'Norte' },
  { name: 'Ananindeua', state: 'PA', lat: -1.3639, lng: -48.3742, region: 'Norte' },
  { name: 'Santarém', state: 'PA', lat: -2.4431, lng: -54.7083, region: 'Norte' },
  { name: 'Marabá', state: 'PA', lat: -5.3686, lng: -49.1178, region: 'Norte' },
  { name: 'Manaus', state: 'AM', lat: -3.1190, lng: -60.0217, region: 'Norte' },
  { name: 'Porto Velho', state: 'RO', lat: -8.7619, lng: -63.9039, region: 'Norte' },
  { name: 'Ji-Paraná', state: 'RO', lat: -10.8847, lng: -61.9511, region: 'Norte' },
  { name: 'Palmas', state: 'TO', lat: -10.2491, lng: -48.3242, region: 'Norte' },
  { name: 'Araguaína', state: 'TO', lat: -7.1925, lng: -48.2044, region: 'Norte' },
  { name: 'Macapá', state: 'AP', lat: 0.0356, lng: -51.0705, region: 'Norte' },
  { name: 'Boa Vista', state: 'RR', lat: 2.8235, lng: -60.6758, region: 'Norte' },
  { name: 'Rio Branco', state: 'AC', lat: -9.9753, lng: -67.8249, region: 'Norte' },
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function getCitiesByState(stateCode: string): BrazilCity[] {
  if (!stateCode) return [];
  const upper = stateCode.toUpperCase().trim();
  return BRAZIL_CITIES.filter(c => c.state.toUpperCase() === upper);
}

export function findCityCoords(cityName: string, stateName?: string): { lat: number; lng: number } {
  if (!cityName) return { lat: -20.3155, lng: -40.3128 }; // Default Vitória/ES

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const searchName = norm(cityName);

  // Exact match with state
  if (stateName) {
    const stateMatch = BRAZIL_CITIES.find(c => 
      c.state.toUpperCase() === stateName.toUpperCase() && 
      (norm(c.name) === searchName || norm(c.name).includes(searchName) || searchName.includes(norm(c.name)))
    );
    if (stateMatch) {
      return { lat: stateMatch.lat, lng: stateMatch.lng };
    }
  }

  // General match
  const found = BRAZIL_CITIES.find(c => {
    return norm(c.name) === searchName || norm(c.name).includes(searchName) || searchName.includes(norm(c.name));
  });

  if (found) {
    return { lat: found.lat, lng: found.lng };
  }

  // If state is known, fallback to state center
  if (stateName && STATE_COORDINATES[stateName.toUpperCase()]) {
    return { 
      lat: STATE_COORDINATES[stateName.toUpperCase()].lat, 
      lng: STATE_COORDINATES[stateName.toUpperCase()].lng 
    };
  }

  // Default to Vitória / ES or São Paulo
  return { lat: -20.3155, lng: -40.3128 };
}
