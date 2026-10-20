import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  TransportPartner, 
  PartnerStatus 
} from '../types';
import { 
  BRAZIL_CITIES, 
  BRAZIL_STATES, 
  BrazilCity 
} from '../data/brazilCities';
import { 
  MapPin, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Search, 
  Filter, 
  Layers, 
  Info,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

interface CoverageMapProps {
  partners: TransportPartner[];
  onSelectPartnerForAudit: (partner: TransportPartner) => void;
}

export const CoverageMap: React.FC<CoverageMapProps> = ({
  partners,
  onSelectPartnerForAudit,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedPartner, setSelectedPartner] = useState<TransportPartner | null>(null);
  const [showRadiusCircles, setShowRadiusCircles] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [testedCity, setTestedCity] = useState<BrazilCity | null>(null);

  // Status color mapper
  const getStatusColor = (status: PartnerStatus) => {
    switch (status) {
      case 'homologado':
        return '#059669'; // Emerald
      case 'em_analise':
        return '#2563eb'; // Blue
      case 'pendente_documento':
        return '#d97706'; // Amber
      case 'rejeitado':
        return '#dc2626'; // Red
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status: PartnerStatus) => {
    switch (status) {
      case 'homologado': return 'Homologado';
      case 'em_analise': return 'Em Análise';
      case 'pendente_documento': return 'Pendente Doc';
      case 'rejeitado': return 'Rejeitado';
      default: return status;
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Central / Southeast Brazil
    const map = L.map(mapContainerRef.current, {
      center: [-19.5, -48.0],
      zoom: 5,
      zoomControl: true,
    });

    // Sleek vector-style basemap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    circlesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Radius Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;
    if (!map || !markersLayer || !circlesLayer) return;

    markersLayer.clearLayers();
    circlesLayer.clearLayers();

    // Filter partners
    const filtered = partners.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (stateFilter !== 'all' && p.coverage.baseState !== stateFilter && !p.coverage.statesServed.includes(stateFilter)) return false;
      if (vehicleFilter !== 'all' && !p.coverage.vehicleTypes.includes(vehicleFilter as any)) return false;
      return true;
    });

    filtered.forEach((partner) => {
      const color = getStatusColor(partner.status);
      const lat = partner.coverage.lat;
      const lng = partner.coverage.lng;
      const radiusMeters = partner.coverage.radiusKm * 1000;

      // 1. Draw coverage circle if enabled
      if (showRadiusCircles) {
        const circle = L.circle([lat, lng], {
          radius: radiusMeters,
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 2,
          dashArray: partner.status === 'homologado' ? undefined : '5, 5',
        });

        circle.bindTooltip(`Raio de Cobertura: ${partner.coverage.radiusKm} km (${partner.tradeName || partner.companyName})`, {
          permanent: false,
          direction: 'top',
          className: 'text-xs font-semibold',
        });

        circle.addTo(circlesLayer);
      }

      // 2. Custom HTML Marker
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; fill: none; stroke: #ffffff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create rich popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 text-slate-800 text-xs min-w-[240px]';
      popupContent.innerHTML = `
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <strong style="font-size: 13px; color: #0f172a; line-height: 1.2;">${partner.tradeName || partner.companyName}</strong>
            <span style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}40; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
              ${getStatusLabel(partner.status)}
            </span>
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px; font-family: monospace;">
            CNPJ: ${partner.cnpj}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
          <div>📍 <strong>Base Operacional:</strong> ${partner.coverage.baseCity} - ${partner.coverage.baseState}</div>
          <div>⭕ <strong>Raio de Atuação:</strong> ${partner.coverage.radiusKm} km</div>
          <div>🚚 <strong>RNTRC:</strong> <span style="font-family: monospace;">${partner.rntrc.number}</span> (${partner.rntrc.category})</div>
          <div>🛡️ <strong>Compliance:</strong> ${partner.complianceScore}% conforme</div>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-weight: 600; color: #334155; margin-bottom: 3px;">Cidades Atendidas (${partner.coverage.citiesServed.length}):</div>
          <div style="display: flex; flex-wrap: wrap; gap: 3px; max-height: 60px; overflow-y: auto;">
            ${partner.coverage.citiesServed.slice(0, 6).map(c => `
              <span style="background-color: #f1f5f9; color: #334155; padding: 1px 5px; border-radius: 3px; font-size: 10px;">${c}</span>
            `).join('')}
            ${partner.coverage.citiesServed.length > 6 ? `<span style="color: #64748b; font-size: 10px;">+${partner.coverage.citiesServed.length - 6} outras</span>` : ''}
          </div>
        </div>

        <button id="btn-audit-${partner.id}" style="
          width: 100%;
          background-color: #0f172a;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 11px;
          border: none;
          cursor: pointer;
        ">
          Auditar Documentos do Parceiro
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-audit-${partner.id}`);
        if (btn) {
          btn.onclick = () => onSelectPartnerForAudit(partner);
        }
      });

      marker.addTo(markersLayer);
    });
  }, [partners, showRadiusCircles, statusFilter, stateFilter, vehicleFilter]);

  // Handle flying to partner
  const handleFlyToPartner = (partner: TransportPartner) => {
    setSelectedPartner(partner);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([partner.coverage.lat, partner.coverage.lng], 9, {
        duration: 1.2,
      });
    }
  };

  // Route & City Coverage Tester: Test which carriers serve a given city
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleTestCitySelect = (city: BrazilCity) => {
    setTestedCity(city);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 8, { duration: 1.2 });
      
      // Temporary marker for the tested destination
      const pinIcon = L.divIcon({
        className: 'dest-pin',
        html: `
          <div style="background-color: #7c3aed; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold; font-size: 14px;">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      L.marker([city.lat, city.lng], { icon: pinIcon })
        .addTo(mapInstanceRef.current)
        .bindTooltip(`Destino Testado: ${city.name} - ${city.state}`, { permanent: true, direction: 'top' })
        .openTooltip();
    }
  };

  // Find carriers that cover the tested city
  const coveringCarriers = testedCity
    ? partners.map(p => {
        const dist = calculateDistanceKm(p.coverage.lat, p.coverage.lng, testedCity.lat, testedCity.lng);
        const explicitlyServed = p.coverage.citiesServed.some(c => c.toLowerCase().includes(testedCity.name.toLowerCase()));
        const withinRadius = dist <= p.coverage.radiusKm;
        return {
          partner: p,
          distance: dist,
          isCovered: explicitlyServed || withinRadius,
          explicitlyServed,
          withinRadius,
        };
      }).filter(item => item.isCovered)
    : [];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-100">
      
      {/* Sidebar Controls & Partner list */}
      <div className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col h-auto lg:h-full z-20 shadow-md overflow-hidden">
        
        {/* Header & Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Geolocalização & Abrangência</h2>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {partners.length} Parceiros
            </span>
          </div>

          {/* Layer and Circle Toggles */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Mostrar Raio de Operação (km)</span>
            </span>
            <button
              onClick={() => setShowRadiusCircles(!showRadiusCircles)}
              className={`w-10 h-5 flex items-center rounded-full p-1 duration-200 cursor-pointer ${
                showRadiusCircles ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-700"
              >
                <option value="all">Todos os Status</option>
                <option value="homologado">Homologados</option>
                <option value="em_analise">Em Análise</option>
                <option value="pendente_documento">Pendente Doc</option>
                <option value="rejeitado">Rejeitados</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Estado Base / Atendido</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-700"
              >
                <option value="all">Todos os Estados</option>
                {BRAZIL_STATES.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* City Coverage Tool */}
          <div className="pt-2 border-t border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1 mb-1">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verificar Cobertura para uma Cidade / Rota:</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={testedCity ? `${testedCity.name}-${testedCity.state}` : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setTestedCity(null);
                    return;
                  }
                  const found = BRAZIL_CITIES.find(c => `${c.name}-${c.state}` === val);
                  if (found) handleTestCitySelect(found);
                }}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="">Selecione uma cidade de entrega...</option>
                {BRAZIL_CITIES.map(c => (
                  <option key={`${c.name}-${c.state}`} value={`${c.name}-${c.state}`}>
                    {c.name} ({c.state}) - {c.region}
                  </option>
                ))}
              </select>
              {testedCity && (
                <button
                  onClick={() => setTestedCity(null)}
                  className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-200 rounded-lg"
                  title="Limpar teste"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Test result banner */}
            {testedCity && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <div className="flex items-center justify-between font-bold">
                  <span>Entrega para {testedCity.name} ({testedCity.state}):</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {coveringCarriers.length} Parceiros
                  </span>
                </div>
                {coveringCarriers.length === 0 ? (
                  <p className="text-[11px] text-rose-700 mt-1">Nenhum transportador cadastrado cobre este raio no momento.</p>
                ) : (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Transportadores disponíveis com raio compatível listados abaixo.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Partners list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {(testedCity ? coveringCarriers.map(c => c.partner) : partners).map((partner) => {
            const isSelected = selectedPartner?.id === partner.id;
            const color = getStatusColor(partner.status);

            return (
              <div
                key={partner.id}
                onClick={() => handleFlyToPartner(partner)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {partner.tradeName || partner.companyName}
                    </h4>
                    <p className={`text-[11px] mt-0.5 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      CNPJ: {partner.cnpj}
                    </p>
                  </div>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: `${color}25`,
                      color: isSelected ? '#ffffff' : color,
                      border: `1px solid ${color}60`
                    }}
                  >
                    {getStatusLabel(partner.status)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                  <span className={isSelected ? 'text-emerald-300' : 'text-emerald-700'}>
                    📍 {partner.coverage.baseCity} ({partner.coverage.baseState})
                  </span>
                  <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
                    ⭕ Raio: <strong>{partner.coverage.radiusKm} km</strong>
                  </span>
                </div>

                {/* Cities served badge pills */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {partner.coverage.citiesServed.slice(0, 4).map((c) => (
                    <span 
                      key={c}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-slate-800 text-slate-200' 
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                  {partner.coverage.citiesServed.length > 4 && (
                    <span className={`text-[9px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      +{partner.coverage.citiesServed.length - 4} cidades
                    </span>
                  )}
                </div>

                {/* Quick audit trigger */}
                <div className="mt-2 pt-2 border-t border-slate-200/40 flex justify-between items-center text-[11px]">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                    RNTRC: <strong className="font-mono">{partner.rntrc.number}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPartnerForAudit(partner);
                    }}
                    className={`font-semibold underline ${
                      isSelected ? 'text-emerald-300 hover:text-white' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    Auditar Documentos &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-2 pointer-events-auto max-w-xs">
          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Legenda de Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-700">Homologado</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate-700">Em Análise</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-700">Pendente Doc</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-600" />
              <span className="text-slate-700">Rejeitado</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
            Os círculos representam o raio de atuação operacional a partir da base cadastrada da transportadora.
          </p>
        </div>
      </div>

    </div>
  );
};
