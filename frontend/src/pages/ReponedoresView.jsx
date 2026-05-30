import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Navigation, Radio, MapPin, Search } from 'lucide-react';
import clsx from 'clsx';
import { API } from '../api/client';

// Componente para actualizar el centro del mapa
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export function ReponedoresView() {
  const [reponedores, setReponedores] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wsStatus, setWsStatus] = useState('conectando'); // conectando, conectado, desconectado
  
  // Historial de la ruta
  const [historialRuta, setHistorialRuta] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // 1. Carga inicial vía HTTP: Traemos TODOS los usuarios (reponedores) y el último GPS
    Promise.all([
      API.getUsuarios().catch(() => []),
      API.getPosicionesGps().catch(() => [])
    ]).then(([usuarios, gpsData]) => {
      let initialReponedores = [];
      
      // Filtramos solo a los que tienen rol 3 (Reponedor)
      if (Array.isArray(usuarios)) {
        initialReponedores = usuarios
          .filter(u => u.id_rol === 3 || u.rol === 3 || u.usuario?.id_rol === 3)
          .map(u => ({
            id: u.id_usuario || u.id,
            nombre: u.nombre_completo || u.usuario?.nombre_completo || `Reponedor #${u.id_usuario || u.id}`,
            lat: null,
            lon: null,
            estado: 'desconectado',
            ultimo_update: 'Nunca',
            pdv_actual: ''
          }));
      }

      // Mapeamos los datos de GPS
      if (Array.isArray(gpsData)) {
        const gpsMap = new Map();
        gpsData.forEach(pos => {
          const id = pos.id_reponedor || pos.id;
          gpsMap.set(id, {
            lat: pos.latitud || pos.lat,
            lon: pos.longitud || pos.lon,
            estado: 'activo',
            ultimo_update: pos.timestamp || pos.creado_en || new Date().toISOString(),
            pdv_actual: pos.pdv_actual || ''
          });
        });

        // Combinamos
        initialReponedores = initialReponedores.map(rep => {
          if (gpsMap.has(rep.id)) {
            return { ...rep, ...gpsMap.get(rep.id) };
          }
          return rep;
        });

        // Añadir los del GPS que por alguna razón no vinieron en la lista de usuarios
        gpsMap.forEach((gpsInfo, id) => {
          if (!initialReponedores.find(r => r.id === id)) {
            initialReponedores.push({
              id,
              nombre: `Reponedor #${id}`,
              ...gpsInfo
            });
          }
        });
      }

      setReponedores(prev => prev.length === 0 ? initialReponedores : prev);
    }).catch(e => console.error("Error cargando datos iniciales:", e));

    // 2. Conectar WebSocket para el tiempo real
    let supervisorId = 2; // Por defecto
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.id_usuario) supervisorId = userData.id_usuario;
      }
    } catch (e) { }

    const wsUrl = `wss://innovahack-gcrh.onrender.com/ws/supervisor/${supervisorId}`;
    let ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Conectado al WS de rastreo');
      setWsStatus('conectado');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.reponedores && Array.isArray(data.reponedores)) {
          setReponedores(data.reponedores);
        }
      } catch (e) {
        console.error("Error parseando WS data", e);
      }
    };

    ws.onclose = () => {
      console.log('WS desconectado');
      setWsStatus('desconectado');
    };

    // Clean up
    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
  }, []);

  // Efecto para cargar el historial cuando se selecciona un reponedor o cambia la fecha
  useEffect(() => {
    if (selectedId) {
      API.getHistorialGps(selectedId, fechaFiltro)
        .then(data => {
          if (Array.isArray(data)) {
            setHistorialRuta(data);
          } else {
            setHistorialRuta([]);
          }
        })
        .catch(e => {
          console.error("Error al obtener historial", e);
          setHistorialRuta([]);
        });
    } else {
      setHistorialRuta([]);
    }
  }, [selectedId, fechaFiltro]);

  const filteredReponedores = reponedores.filter(r => 
    r.id?.toString().includes(searchQuery.toLowerCase()) ||
    r.estado?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRep = reponedores.find(r => r.id === selectedId);
  const mapCenter = selectedRep && selectedRep.lat && selectedRep.lon 
    ? [selectedRep.lat, selectedRep.lon] 
    : [-16.5000, -68.1500]; // Por defecto La Paz

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-emerald-500 ring-emerald-500/30';
      case 'sin_señal': return 'bg-amber-500 ring-amber-500/30';
      default: return 'bg-slate-500 ring-slate-500/30';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'activo': return 'En línea';
      case 'sin_señal': return 'Sin señal / Inactivo';
      case 'desconectado': return 'Desconectado';
      default: return estado || 'Desconocido';
    }
  };

  // Crear iconos dinámicos para el mapa
  const createMarkerIcon = (estado) => {
    let colorHex = '#64748b'; // default slate-500
    if (estado === 'activo') colorHex = '#10b981'; // emerald-500
    if (estado === 'sin_señal') colorHex = '#f59e0b'; // amber-500

    const html = `
      <div style="
        background-color: ${colorHex};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'custom-rep-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
            <Navigation className="text-brand-blue" />
            Rastreo de Reponedores
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Monitoreo en tiempo real de ubicación y conexión.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border px-4 py-2 rounded-xl shadow-sm transition-colors">
          <Radio size={16} className={clsx(
            wsStatus === 'conectado' ? 'text-emerald-500 animate-pulse' : 
            wsStatus === 'conectando' ? 'text-amber-500' : 'text-slate-400'
          )} />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {wsStatus === 'conectado' ? 'En Vivo' : wsStatus === 'conectando' ? 'Conectando...' : 'Desconectado'}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Mapa (Izquierda) */}
        <div className="lg:w-2/3 h-[500px] lg:h-auto bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm relative z-0">
          <MapContainer center={mapCenter} zoom={13} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={mapCenter} zoom={selectedId ? 16 : 13} />
            
            {reponedores.filter(r => r.lat && r.lon).map((rep) => (
              <Marker 
                key={rep.id} 
                position={[rep.lat, rep.lon]} 
                icon={createMarkerIcon(rep.estado)}
                eventHandlers={{
                  click: () => setSelectedId(rep.id),
                }}
              >
                <Popup>
                  <div className="font-sans">
                    <p className="font-bold text-sm text-slate-800">{rep.nombre || `Reponedor #${rep.id}`}</p>
                    <p className="text-xs text-slate-500 mt-1">Estado: {getStatusText(rep.estado)}</p>
                    {rep.pdv_actual && <p className="text-xs font-mono bg-slate-100 p-1 mt-2 rounded">PDV: {rep.pdv_actual}</p>}
                    <p className="text-[10px] text-slate-400 mt-2">Última act: {new Date(rep.ultimo_update).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Historial (Ruta / Miguitas de pan) */}
            {historialRuta.length > 0 && (
              <>
                <Polyline 
                  positions={historialRuta.filter(p => p.latitud && p.longitud).map(p => [p.latitud, p.longitud])} 
                  color="#3b82f6" 
                  weight={3} 
                  opacity={0.8} 
                  dashArray="10, 10"
                />
                {historialRuta.filter(p => p.latitud && p.longitud).map((punto, idx) => (
                  <CircleMarker 
                    key={`hist-${idx}`}
                    center={[punto.latitud, punto.longitud]}
                    radius={5}
                    pathOptions={{ color: '#2563eb', fillColor: 'white', fillOpacity: 1, weight: 2 }}
                  >
                    <Popup>
                      <div className="font-sans text-xs">
                        <p className="font-bold text-slate-800 mb-1">Punto Histórico</p>
                        <p>Hora: {new Date(punto.timestamp).toLocaleTimeString()}</p>
                        {punto.velocidad_kmh !== null && <p>Velocidad: {punto.velocidad_kmh} km/h</p>}
                        {punto.nivel_bateria !== null && <p>Batería: {punto.nivel_bateria}%</p>}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </>
            )}
          </MapContainer>
        </div>

        {/* Lista de Reponedores (Derecha) */}
        <div className="lg:w-1/3 flex flex-col gap-4 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-sm transition-colors overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID..." 
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" 
              />
            </div>
            
            {/* Selector de fecha para el historial */}
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Fecha del Historial GPS
              </label>
              <input 
                type="date" 
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredReponedores.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-10 text-sm">
                No se detectaron reponedores en campo.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredReponedores.map((rep) => {
                  const isSelected = selectedId === rep.id;
                  
                  return (
                    <div 
                      key={rep.id}
                      onClick={() => setSelectedId(rep.id)}
                      className={clsx(
                        "p-4 rounded-xl cursor-pointer transition-all border",
                        isSelected 
                          ? "bg-blue-50 dark:bg-brand-blue/10 border-brand-blue shadow-sm" 
                          : "bg-white dark:bg-dark-card border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Users className={isSelected ? "text-brand-blue" : "text-slate-400"} size={16} />
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{rep.nombre || `Reponedor #${rep.id}`}</h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={clsx("w-2 h-2 rounded-full ring-2", getStatusColor(rep.estado))}></span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{getStatusText(rep.estado)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 mt-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          <span className="font-mono">{rep.lat ? `${rep.lat.toFixed(4)}, ${rep.lon.toFixed(4)}` : 'Sin GPS'}</span>
                        </div>
                        {rep.pdv_actual && (
                          <div className="mt-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block w-max">
                            PDV Actual: {rep.pdv_actual}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] opacity-70">
                          Actualizado: {rep.ultimo_update && rep.ultimo_update !== "Nunca" ? new Date(rep.ultimo_update).toLocaleTimeString() : 'Nunca'}
                        </div>
                        {isSelected && historialRuta.length > 0 && (
                          <div className="mt-2 text-[10px] font-semibold text-brand-blue bg-blue-50 dark:bg-brand-blue/20 px-2 py-1 rounded w-max transition-all">
                            Ruta cargada: {historialRuta.length} puntos detectados
                          </div>
                        )}
                        {isSelected && historialRuta.length === 0 && (
                          <div className="mt-2 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded w-max transition-all">
                            Sin historial para esta fecha
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
