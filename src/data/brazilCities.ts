export interface BrazilCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste' | 'Norte';
}

export const BRAZIL_CITIES: BrazilCity[] = [
  // SP
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

  // RJ
  { name: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729, region: 'Sudeste' },
  { name: 'Duque de Caxias', state: 'RJ', lat: -22.7858, lng: -43.3117, region: 'Sudeste' },
  { name: 'Resende', state: 'RJ', lat: -22.4689, lng: -44.4468, region: 'Sudeste' },
  { name: 'Campos dos Goytacazes', state: 'RJ', lat: -21.7545, lng: -41.3242, region: 'Sudeste' },

  // MG
  { name: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345, region: 'Sudeste' },
  { name: 'Betim', state: 'MG', lat: -19.9678, lng: -44.1983, region: 'Sudeste' },
  { name: 'Contagem', state: 'MG', lat: -19.9317, lng: -44.0536, region: 'Sudeste' },
  { name: 'Uberlândia', state: 'MG', lat: -18.9186, lng: -48.2772, region: 'Sudeste' },
  { name: 'Juiz de Fora', state: 'MG', lat: -21.7595, lng: -43.3398, region: 'Sudeste' },
  { name: 'Pouso Alegre', state: 'MG', lat: -22.2301, lng: -45.9372, region: 'Sudeste' },

  // PR
  { name: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733, region: 'Sul' },
  { name: 'São José dos Pinhais', state: 'PR', lat: -25.5347, lng: -49.2064, region: 'Sul' },
  { name: 'Londrina', state: 'PR', lat: -23.3045, lng: -51.1696, region: 'Sul' },
  { name: 'Maringá', state: 'PR', lat: -23.421, lng: -51.9331, region: 'Sul' },
  { name: 'Cascavel', state: 'PR', lat: -24.9578, lng: -53.4595, region: 'Sul' },
  { name: 'Paranaguá', state: 'PR', lat: -25.5205, lng: -48.5094, region: 'Sul' },

  // SC
  { name: 'Florianópolis', state: 'SC', lat: -27.5954, lng: -48.548, region: 'Sul' },
  { name: 'Joinville', state: 'SC', lat: -26.3045, lng: -48.8487, region: 'Sul' },
  { name: 'Itajaí', state: 'SC', lat: -26.9078, lng: -48.6619, region: 'Sul' },
  { name: 'Blumenau', state: 'SC', lat: -26.9194, lng: -49.0661, region: 'Sul' },
  { name: 'Chapecó', state: 'SC', lat: -27.1004, lng: -52.6152, region: 'Sul' },

  // RS
  { name: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177, region: 'Sul' },
  { name: 'Caxias do Sul', state: 'RS', lat: -29.1678, lng: -51.1794, region: 'Sul' },
  { name: 'Canoas', state: 'RS', lat: -29.9178, lng: -51.1836, region: 'Sul' },
  { name: 'Passo Fundo', state: 'RS', lat: -28.2628, lng: -52.4067, region: 'Sul' },
  { name: 'Rio Grande', state: 'RS', lat: -32.035, lng: -52.0986, region: 'Sul' },

  // GO / DF
  { name: 'Goiânia', state: 'GO', lat: -16.6869, lng: -49.2648, region: 'Centro-Oeste' },
  { name: 'Anápolis', state: 'GO', lat: -16.3267, lng: -48.9534, region: 'Centro-Oeste' },
  { name: 'Aparecida de Goiânia', state: 'GO', lat: -16.8228, lng: -49.2481, region: 'Centro-Oeste' },
  { name: 'Brasília', state: 'DF', lat: -15.7975, lng: -47.8919, region: 'Centro-Oeste' },

  // MS / MT
  { name: 'Campo Grande', state: 'MS', lat: -20.4697, lng: -54.6201, region: 'Centro-Oeste' },
  { name: 'Dourados', state: 'MS', lat: -22.2211, lng: -54.8056, region: 'Centro-Oeste' },
  { name: 'Cuiabá', state: 'MT', lat: -15.6014, lng: -56.0979, region: 'Centro-Oeste' },
  { name: 'Rondonópolis', state: 'MT', lat: -16.4674, lng: -54.636, region: 'Centro-Oeste' },

  // BA
  { name: 'Salvador', state: 'BA', lat: -12.9777, lng: -38.5016, region: 'Nordeste' },
  { name: 'Feira de Santana', state: 'BA', lat: -12.2664, lng: -38.9663, region: 'Nordeste' },
  { name: 'Vitória da Conquista', state: 'BA', lat: -14.8661, lng: -40.8394, region: 'Nordeste' },
  { name: 'Camaçari', state: 'BA', lat: -12.6975, lng: -38.3242, region: 'Nordeste' },

  // PE / CE / ES
  { name: 'Recife', state: 'PE', lat: -8.0476, lng: -34.877, region: 'Nordeste' },
  { name: 'Jaboatão dos Guararapes', state: 'PE', lat: -8.1133, lng: -35.0156, region: 'Nordeste' },
  { name: 'Fortaleza', state: 'CE', lat: -3.7319, lng: -38.5267, region: 'Nordeste' },
  { name: 'Vitória', state: 'ES', lat: -20.3155, lng: -40.3128, region: 'Sudeste' },
  { name: 'Serra', state: 'ES', lat: -20.1286, lng: -40.3078, region: 'Sudeste' },
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function findCityCoords(cityName: string, stateName?: string): { lat: number; lng: number } {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const searchName = norm(cityName);
  const found = BRAZIL_CITIES.find(c => {
    const matchName = norm(c.name) === searchName || norm(c.name).includes(searchName) || searchName.includes(norm(c.name));
    if (stateName) {
      return matchName && c.state.toUpperCase() === stateName.toUpperCase();
    }
    return matchName;
  });

  if (found) {
    return { lat: found.lat, lng: found.lng };
  }
  // Default to central Brazil or São Paulo
  return { lat: -23.55052, lng: -46.633308 };
}
