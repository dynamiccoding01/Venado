import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Camera, CheckCircle, Clock, ChevronLeft, Package, User, CloudRain } from 'lucide-react';
import clsx from 'clsx';
import { API, createWebSocket } from '../api/client';

export function MobileReponedor() {
  const [routeTasks, setRouteTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTask, setCurrentTask] = useState('inventory'); // inventory, photos, signature
  const [clima, setClima] = useState(null);

  // Encontrar el actual o próximo pendiente
  const activePdvIndex = routeTasks.findIndex(t => t.estado === 'pendiente' || t.estado === 'en_progreso');
  const activePdv = activePdvIndex !== -1 ? routeTasks[activePdvIndex] : null;
  const completedCount = routeTasks.filter(t => t.estado === 'completada').length;
  const progressPct = routeTasks.length > 0 ? Math.round((completedCount / routeTasks.length) * 100) : 0;

  useEffect(() => {
    // 1. Fetch Ruta 1 (Hardcodeada para la simulación)
    API.getRutaConPuntos(1).then(data => {
      if (data && data.ruta_puntos) {
        // Ordenamos por 'orden' de la API
        const sorted = data.ruta_puntos.sort((a, b) => a.orden - b.orden);
        setRouteTasks(sorted);
      }
      setLoading(false);
    }).catch(e => {
      console.error("No se pudo cargar la ruta:", e);
      setLoading(false);
    });

    // 2. Fetch Clima (La Paz)
    API.getClima(-16.5, -68.15).then(setClima).catch(console.error);
  }, []);

  useEffect(() => {
    // 3. Conectar WebSocket del Reponedor ID = 5
    const ws = createWebSocket('/ws/reponedor/5');
    
    ws.onopen = () => console.log("Móvil WS Conectado");

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Simulamos caminar enviando coordenadas ligeramente variables
        ws.send(JSON.stringify({
          lat: -16.500 + (Math.random() * 0.005),
          lon: -68.150 + (Math.random() * 0.005),
          timestamp: new Date().toISOString(),
          pdv_actual: activePdv ? activePdv.pdv.codigo_gv : ""
        }));
      }
    }, 5000); // Enviar cada 5 segundos para que el dashboard lo vea en vivo

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [activePdv]);

  const handleFinishVisit = async () => {
    if (!activePdv) return;
    
    setIsCheckedIn(false);
    setCurrentTask('inventory');
    
    try {
      // Registramos 20 mins reales en la API
      await API.registrarTiempo(activePdv.id_ruta_punto, 20);
    } catch(e) {
      console.error("Error reportando visita (mock fallido):", e);
    }
    
    // Actualizamos estado local
    const newTasks = [...routeTasks];
    newTasks[activePdvIndex] = { ...newTasks[activePdvIndex], estado: 'completada' };
    setRouteTasks(newTasks);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      
      {/* SIMULADOR DE TELÉFONO */}
      <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-[0_0_50px_-10px_rgba(0,0,0,0.2)] border-[8px] border-slate-900 overflow-hidden flex flex-col relative">
        
        {/* Top Notch Simulator */}
        <div className="absolute top-0 w-full h-7 flex justify-center z-50">
          <div className="w-32 h-5 bg-slate-900 rounded-b-2xl"></div>
        </div>

        {/* Status Bar (Simulated) */}
        <div className="h-10 bg-brand-blue w-full shrink-0 flex justify-between items-end px-6 pb-1 text-white text-xs font-medium">
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <div className="flex gap-1 items-center">
            <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
            <span>LTE</span>
          </div>
        </div>

        {/* HEADER DE LA APP */}
        <div className="bg-brand-blue px-6 pb-6 pt-4 text-white shrink-0 shadow-md z-10 relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                 <User size={16} />
               </div>
               <div>
                 <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">Reponedor 5</p>
                 <p className="font-bold text-sm">Carlos Méndez</p>
               </div>
            </div>
            {clima && (
              <div className="flex items-center gap-1 text-xs font-semibold bg-white/10 px-2 py-1 rounded-full">
                <CloudRain size={14} /> {clima.temperatura}°C
              </div>
            )}
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
            <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mb-1">Ruta #1 (Optimizada)</p>
            <h2 className="text-xl font-bold">Zona Central</h2>
            <div className="flex justify-between mt-3 text-sm font-medium">
              <span>Progreso: {progressPct}%</span>
              <span>{completedCount} / {routeTasks.length} PDVs</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pb-24">
          
          {/* Botón Principal (Check-In) */}
          <div className="p-6">
            {!activePdv ? (
               <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-sm text-center">
                 <CheckCircle size={32} className="mx-auto mb-2" />
                 <h3 className="font-bold text-lg">Ruta Completada</h3>
                 <p className="text-sm opacity-90">Buen trabajo, has visitado todos los PDVs.</p>
               </div>
            ) : !isCheckedIn ? (
              <button 
                onClick={() => setIsCheckedIn(true)}
                className="w-full bg-brand-blue text-white py-4 rounded-2xl shadow-lg font-bold text-lg flex items-center justify-center gap-2 transform active:scale-95 transition-transform"
              >
                <MapPin size={24} />
                Hacer Check-In (PDV {activePdv.orden})
              </button>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Ubicación</h3>
                <h4 className="text-lg font-bold text-slate-800 mt-1">{activePdv.pdv.nombre_pdv}</h4>
                <p className="text-xs text-slate-500 font-mono mt-1">{activePdv.pdv.codigo_gv}</p>
                
                {/* Tareas Activas */}
                <div className="mt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => setCurrentTask('inventory')}
                    className={clsx(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors",
                      currentTask === 'inventory' ? "bg-blue-50 border-brand-blue" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx("p-2 rounded-lg", currentTask === 'inventory' ? "bg-brand-blue text-white" : "bg-white text-slate-400")}>
                        <Package size={16} />
                      </div>
                      <span className={clsx("font-medium", currentTask === 'inventory' ? "text-brand-blue" : "text-slate-600")}>Conteo de Stock</span>
                    </div>
                    {currentTask !== 'inventory' && <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>}
                    {currentTask === 'inventory' && <div className="w-4 h-4 rounded-full border-4 border-brand-blue bg-white"></div>}
                  </button>

                  <button 
                    onClick={() => setCurrentTask('photos')}
                    className={clsx(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors",
                      currentTask === 'photos' ? "bg-blue-50 border-brand-blue" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx("p-2 rounded-lg", currentTask === 'photos' ? "bg-brand-blue text-white" : "bg-white text-slate-400")}>
                        <Camera size={16} />
                      </div>
                      <span className={clsx("font-medium", currentTask === 'photos' ? "text-brand-blue" : "text-slate-600")}>Fotos de Góndola</span>
                    </div>
                    {currentTask !== 'photos' && <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>}
                    {currentTask === 'photos' && <div className="w-4 h-4 rounded-full border-4 border-brand-blue bg-white"></div>}
                  </button>
                </div>

                <button 
                  onClick={handleFinishVisit}
                  className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow flex justify-center items-center gap-2"
                >
                  <CheckCircle size={18} /> Finalizar Visita
                </button>
              </div>
            )}
          </div>

          {/* Secuencia de la Ruta */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex justify-between items-center">
              <span>Secuencia de Visitas</span>
              <span className="text-xs font-medium text-brand-blue">Lista API</span>
            </h3>
            
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {loading ? (
                <p className="text-xs text-slate-500 pl-4">Cargando...</p>
              ) : routeTasks.map((task, i) => {
                const isCompleted = task.estado === 'completada';
                const isCurrent = task.id_ruta_punto === activePdv?.id_ruta_punto;

                return (
                  <div key={task.id_ruta_punto} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={clsx(
                      "absolute -left-[11px] top-1 w-5 h-5 rounded-full ring-4 ring-slate-50 flex items-center justify-center",
                      isCompleted ? "bg-brand-blue" :
                      isCurrent ? "bg-yellow-400" :
                      "bg-slate-300"
                    )}>
                      {isCompleted && <CheckCircle size={10} className="text-white" />}
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    
                    {/* Task Card */}
                    <div className={clsx(
                      "p-3 rounded-xl border",
                      isCurrent ? "bg-white border-yellow-200 shadow-sm" : "bg-transparent border-transparent"
                    )}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{task.pdv.codigo_gv}</span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">Orden {task.orden}</span>
                      </div>
                      <h4 className={clsx(
                        "font-bold text-sm",
                        isCompleted ? "text-slate-500 line-through" : "text-slate-800"
                      )}>{task.pdv.nombre_pdv}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Lat: {task.pdv.latitud.toFixed(3)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
      
      {/* Botón flotante para salir del simulador */}
      <a href="/" className="fixed top-8 right-8 bg-white px-4 py-2 rounded-lg shadow font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-50">
        <ChevronLeft size={20} /> Volver al Desktop
      </a>
    </div>
  );
}
