import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, Check, Loader2, AlertCircle } from 'lucide-react';

export interface InPostPoint {
  name: string;
  display_name?: string;
  status?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  location_description?: string;
  distance?: number;
  opening_hours?: string;
  address: {
    line1: string;
    line2: string;
  };
  address_details: {
    city: string;
    province?: string;
    post_code: string;
    street?: string;
    building_number?: string;
  };
}

interface PaczkomatMapPickerProps {
  selectedLocker: InPostPoint | null;
  onSelectLocker: (locker: InPostPoint) => void;
}

// Fallback points if API is unreachable
const FALLBACK_POINTS: InPostPoint[] = [
  {
    name: 'WAW322M',
    location: { latitude: 52.22657, longitude: 21.01419 },
    location_description: 'Przed wejściem do Rossmanna',
    distance: 250,
    address: { line1: 'Marszałkowska 76', line2: '00-517 Warszawa' },
    address_details: { city: 'Warszawa', post_code: '00-517', street: 'Marszałkowska', building_number: '76' },
  },
  {
    name: 'WAW53AP',
    location: { latitude: 52.2289, longitude: 21.0098 },
    location_description: 'Przy stacji paliw',
    distance: 420,
    address: { line1: 'Żurawia 47/49', line2: '00-680 Warszawa' },
    address_details: { city: 'Warszawa', post_code: '00-680', street: 'Żurawia', building_number: '47/49' },
  },
  {
    name: 'WAW01M',
    location: { latitude: 52.2312, longitude: 21.0185 },
    location_description: 'Pasaż handlowy',
    distance: 610,
    address: { line1: 'Nowy Świat 22', line2: '00-373 Warszawa' },
    address_details: { city: 'Warszawa', post_code: '00-373', street: 'Nowy Świat', building_number: '22' },
  },
];

export const PaczkomatMapPicker: React.FC<PaczkomatMapPickerProps> = ({
  selectedLocker,
  onSelectLocker,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [points, setPoints] = useState<InPostPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Wyszukiwanie Twojej lokalizacji...');
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = 52.2297;
    const initialLng = 21.0122;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark-themed OpenStreetMap tiles (no API key required, no watermarks)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-tiles',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Trigger auto-locate on initial mount
    locateUser(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size when expanded
  useEffect(() => {
    if (isMapExpanded && mapInstanceRef.current) {
      setTimeout(() => {
        try {
          mapInstanceRef.current?.invalidateSize();
        } catch {}
      }, 150);
    }
  }, [isMapExpanded]);

  // Update map markers when points or selectedLocker change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    points.forEach((point) => {
      const isSelected = selectedLocker?.name === point.name;

      const markerHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isSelected ? '#10b981' : '#f59e0b'};
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 10px;
          box-shadow: 0 4px 12px ${isSelected ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.4)'};
          border: 2px solid #ffffff;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.2s ease;
        ">
          📦
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-inpost-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([point.location.latitude, point.location.longitude], {
        icon: customIcon,
      });

      marker.on('click', () => {
        onSelectLocker(point);
      });

      const popupContent = `
        <div style="font-family: sans-serif; color: #18181b; padding: 4px; font-size: 12px; min-width: 170px;">
          <div style="font-weight: 800; font-size: 13px; color: #111;">Paczkomat ${point.name}</div>
          <div style="color: #4b5563; margin-top: 2px;">${point.address.line1}</div>
          <div style="color: #4b5563;">${point.address.line2}</div>
          ${point.location_description ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px; font-style: italic;">${point.location_description}</div>` : ''}
          ${point.distance !== undefined ? `<div style="font-size: 11px; font-weight: 700; color: #059669; margin-top: 4px;">~${Math.round(point.distance)} m od Ciebie</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      layer.addLayer(marker);
    });
  }, [points, selectedLocker, onSelectLocker]);

  // Fetch InPost points for given coords
  const fetchNearbyLockers = async (lat: number, lng: number, map?: L.Map) => {
    setLoading(true);
    try {
      const url = `https://api-shipx-pl.easypack24.net/v1/points?type=parcel_locker&relative_point=${lat},${lng}&limit=12&sort_by=distance_to_relative_point`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Błąd API');
      const data = await res.json();
      const items: InPostPoint[] = data.items || [];

      if (items.length > 0) {
        setPoints(items);
        setStatusMessage(`Znaleziono ${items.length} Paczkomatów w pobliżu`);
        // Auto-select nearest if none selected
        if (!selectedLocker) {
          onSelectLocker(items[0]);
        }
      } else {
        setPoints(FALLBACK_POINTS);
        setStatusMessage('Brak punktów w bezpośredniej okolicy');
      }
    } catch {
      setPoints(FALLBACK_POINTS);
      setStatusMessage('Wyświetlono przykładowe Paczkomaty');
    } finally {
      setLoading(false);
      setLocating(false);
    }
  };

  // Locate User via GPS
  const locateUser = (targetMap?: L.Map) => {
    const map = targetMap || mapInstanceRef.current;
    setLocating(true);
    setStatusMessage('Pobieranie Twojej lokalizacji GPS...');

    if (!('geolocation' in navigator)) {
      setStatusMessage('Geolokalizacja niedostępna w Twojej przeglądarce.');
      setLocating(false);
      fetchNearbyLockers(52.2297, 21.0122, map || undefined);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        const currentMap = mapInstanceRef.current;
        if (currentMap) {
          try {
            currentMap.invalidateSize();
            currentMap.setView([latitude, longitude], 15);

            // Update/Add user location marker
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
            } else {
              const userIcon = L.divIcon({
                className: 'custom-user-marker',
                html: `
                  <div style="
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 3px solid #ffffff;
                    box-shadow: 0 0 10px rgba(59,130,246,0.8);
                  "></div>
                `,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              });
              userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(currentMap);
            }
          } catch (err) {
            console.warn('Map update error:', err);
          }
        }

        fetchNearbyLockers(latitude, longitude, map || undefined);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setStatusMessage('Lokalizacja niedostępna — wpisz miasto lub wybierz z listy.');
        setLocating(false);
        // Fallback default
        fetchNearbyLockers(52.2297, 21.0122, map || undefined);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Search by city or address using Nominatim geocoding
  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setStatusMessage(`Wyszukiwanie: "${searchQuery}"...`);

    try {
      // First check if query looks like a Paczkomat name (e.g. WAW01M, KRA02A)
      const cleanQuery = searchQuery.trim().toUpperCase();
      if (/^[A-Z]{3}[0-9]{2,3}[A-Z]{1,2}$/.test(cleanQuery)) {
        const directRes = await fetch(`https://api-shipx-pl.easypack24.net/v1/points/${cleanQuery}`);
        if (directRes.ok) {
          const directPoint: InPostPoint = await directRes.json();
          setPoints([directPoint, ...points.filter(p => p.name !== directPoint.name)]);
          onSelectLocker(directPoint);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([directPoint.location.latitude, directPoint.location.longitude], 16);
          }
          setStatusMessage(`Znaleziono Paczkomat ${directPoint.name}`);
          setSearching(false);
          return;
        }
      }

      // Otherwise geocode city/address via OpenStreetMap Nominatim
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery + ', Polska'
      )}&format=json&limit=1`;

      const geoRes = await fetch(geoUrl, {
        headers: { 'Accept-Language': 'pl' },
      });
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat);
        const lng = parseFloat(geoData[0].lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
        }
        await fetchNearbyLockers(lat, lng, mapInstanceRef.current || undefined);
        setStatusMessage(`Paczkomaty dla: ${geoData[0].display_name.split(',')[0]}`);
      } else {
        setStatusMessage('Nie znaleziono miejscowości. Spróbuj np. "Kraków" lub "WAW322M"');
      }
    } catch {
      setStatusMessage('Błąd wyszukiwania adresu.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAndCenter = (point: InPostPoint) => {
    onSelectLocker(point);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([point.location.latitude, point.location.longitude], 16, {
        animate: true,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: Search + Geolocation Button */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Wpisz miasto, ulicę lub kod (np. KRA01M)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={searching}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Szukaj'}
          </button>
          <button
            type="button"
            onClick={() => locateUser()}
            disabled={locating}
            title="Zlokalizuj mnie"
            className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-xl transition-all shrink-0 flex items-center gap-1.5 text-xs font-medium cursor-pointer disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>

        {/* Status / Auto-detect indicator */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
          <span className="flex items-center gap-1.5 truncate">
            {locating || loading ? (
              <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
            ) : (
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{statusMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="text-zinc-500 hover:text-white underline text-[10px] ml-2 shrink-0 cursor-pointer"
          >
            {isMapExpanded ? 'Zwiń mapę' : 'Pokaż mapę'}
          </button>
        </div>
      </div>

      {/* Map View */}
      {isMapExpanded && (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-52 bg-zinc-950 shadow-inner isolate z-0">
          <div ref={mapContainerRef} className="w-full h-full relative z-0" />
          
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-white z-10">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Ładowanie Paczkomatów...</span>
            </div>
          )}

          <div className="absolute bottom-2 left-2 z-10 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-zinc-300 border border-white/10 flex items-center gap-2 pointer-events-none">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            <span>Kliknij ikonę na mapie, aby wybrać</span>
          </div>
        </div>
      )}

      {/* Selected Locker Highlight Box */}
      {selectedLocker && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              ✓
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Paczkomat {selectedLocker.name}
                </span>
                {selectedLocker.distance !== undefined && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
                    ~{Math.round(selectedLocker.distance)} m
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-300 truncate">
                {selectedLocker.address.line1}, {selectedLocker.address.line2}
              </div>
              {selectedLocker.location_description && (
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                  📍 {selectedLocker.location_description}
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider shrink-0 bg-emerald-500/20 px-2 py-1 rounded-md">
            Wybrany
          </span>
        </div>
      )}

      {/* Quick Select Locker List */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
          Najbliższe Paczkomaty:
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {points.slice(0, 4).map((point) => {
            const isSelected = selectedLocker?.name === point.name;
            return (
              <button
                key={point.name}
                type="button"
                onClick={() => handleSelectAndCenter(point)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-zinc-900/60 border-white/8 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {point.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {point.address.line1}
                    </span>
                  </div>
                  {point.location_description && (
                    <div className="text-[10px] text-zinc-500 truncate">
                      {point.location_description}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {point.distance !== undefined && (
                    <span className="text-[10px] font-mono text-emerald-400/90 block">
                      {Math.round(point.distance)} m
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {isSelected ? '✓ Wybrany' : 'Wybierz'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
