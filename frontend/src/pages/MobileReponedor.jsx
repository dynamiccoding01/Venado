import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Camera, CheckCircle, Clock, ChevronLeft, Package, User, CloudRain, Plus, Minus } from 'lucide-react';
import clsx from 'clsx';
import { API, createWebSocket } from '../api/client';

export function MobileReponedor() {
  const [routeTasks, setRouteTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTask, setCurrentTask] = useState('inventory'); // inventory, photos, signature
  const [clima, setClima] = useState(null);

  // Inventario y Entregas Móvil
  const [productos, setProductos] = useState([]);
  const [entregasForm, setEntregasForm] = useState({});
  const [isSubmittingEntrega, setIsSubmittingEntrega] = useState(false);

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

    // Fetch Productos para catálogo móvil
    API.getProductos().then(setProductos).catch(console.error);
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

  const handleQuantityChange = (id_producto, delta) => {
    setEntregasForm(prev => {
      const current = prev[id_producto] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = {...prev};
        delete copy[id_producto];
        return copy;
      }
      return { ...prev, [id_producto]: next };
    });
  };

  const handleSubmitEntregaMovil = async () => {
    const ids = Object.keys(entregasForm);
    if (ids.length === 0) return alert("Agrega al menos un producto");
    setIsSubmittingEntrega(true);
    try {
      const payload = {
        id_visita: activePdv?.id_ruta_punto || 1, 
        id_reponedor: 5, // ID simulado
        id_pdv: activePdv?.id_pdv || 1,
        notas: "Entrega registrada desde App Móvil",
        productos: ids.map(id => ({
          id_producto: parseInt(id),
          cantidad_entregada: entregasForm[id]
        }))
      };
      await API.registrarEntrega(payload);
      alert("¡Entrega exitosa! Stock descontado.");
      setEntregasForm({});
      API.getProductos().then(setProductos).catch(console.error);
      setCurrentTask('photos');
    } catch (e) {
      alert("Error al registrar entrega. Verifica tu stock o conexión.");
    } finally {
      setIsSubmittingEntrega(false);
    }
  };

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
    <div className="min-h-screen bg-slate-100 dark:bg-dark-bg flex items-center justify-center p-4 font-sans transition-colors duration-500">
      
      {/* SIMULADOR DE TELÉFONO */}
      <div className="w-[375px] h-[812px] bg-slate-50 dark:bg-dark-card rounded-[50px] shadow-[0_0_80px_-15px_rgba(0,0,0,0.3)] border-[12px] border-slate-900 dark:border-black overflow-hidden flex flex-col relative">
        
        {/* Top Notch Simulator */}
        <div className="absolute top-0 w-full h-8 flex justify-center z-50">
          <div className="w-36 h-6 bg-slate-900 dark:bg-black rounded-b-3xl"></div>
        </div>

        {/* Status Bar (Simulated) */}
        <div className="h-12 bg-brand-blue dark:bg-slate-900 w-full shrink-0 flex justify-between items-end px-7 pb-1.5 text-white text-xs font-bold transition-colors">
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            <span>LTE</span>
          </div>
        </div>

        {/* HEADER DE LA APP */}
        <div className="bg-brand-blue dark:bg-slate-900 px-6 pb-6 pt-5 text-white shrink-0 shadow-lg z-10 relative transition-colors">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                 <User size={18} strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-blue-200 dark:text-slate-400 uppercase tracking-widest drop-shadow-sm">Reponedor 5</p>
                 <p className="font-black text-base">Carlos Méndez</p>
               </div>
            </div>
            {clima && (
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 dark:bg-white/10 px-3 py-1.5 rounded-full shadow-sm">
                <CloudRain size={16} /> {clima.temperatura}°C
              </div>
            )}
          </div>
          
          <div className="bg-white/10 dark:bg-white/5 rounded-2xl p-5 border border-white/20 dark:border-white/10 backdrop-blur-md shadow-xl">
            <p className="text-[10px] text-blue-200 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">Ruta #1 (Optimizada)</p>
            <h2 className="text-2xl font-black drop-shadow-md">Zona Central</h2>
            <div className="flex justify-between mt-4 text-sm font-bold">
              <span>Progreso: {progressPct}%</span>
              <span>{completedCount} / {routeTasks.length} PDVs</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2.5 h-2 w-full bg-black/20 dark:bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-dark-bg pb-24 transition-colors">
          
          {/* Botón Principal (Check-In) */}
          <div className="p-6">
            {!activePdv ? (
               <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-lg shadow-emerald-500/30 text-center animate-fade-in-up">
                 <CheckCircle size={40} className="mx-auto mb-3" />
                 <h3 className="font-black text-xl tracking-tight">Ruta Completada</h3>
                 <p className="text-sm font-medium opacity-90 mt-1">Buen trabajo, has visitado todos los PDVs.</p>
               </div>
            ) : !isCheckedIn ? (
              <button 
                onClick={() => setIsCheckedIn(true)}
                className="w-full bg-brand-blue text-white py-4.5 rounded-3xl shadow-lg shadow-brand-blue/30 font-black text-lg flex items-center justify-center gap-3 transform active:scale-95 transition-all hover:bg-brand-blue-hover animate-fade-in-up"
              >
                <MapPin size={24} />
                Hacer Check-In (PDV {activePdv.orden})
              </button>
            ) : (
              <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-xl shadow-black/5 border border-slate-200/50 dark:border-white/5 relative overflow-hidden animate-fade-in-up">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">En Ubicación</h3>
                <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1 leading-tight">{activePdv.pdv.nombre_pdv}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold mt-1.5">{activePdv.pdv.codigo_gv}</p>
                
                {/* Tareas Activas */}
                <div className="mt-5 flex flex-col gap-3.5">
                  <div className={clsx("rounded-2xl border-2 transition-all duration-300", currentTask === 'inventory' ? "bg-white dark:bg-dark-bg border-brand-blue" : "bg-slate-50 dark:bg-dark-bg border-slate-200 dark:border-white/5 hover:border-brand-blue/50")}>
                    <button 
                      onClick={() => setCurrentTask('inventory')}
                      className="w-full flex items-center justify-between p-3.5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={clsx("p-2.5 rounded-xl transition-colors", currentTask === 'inventory' ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "bg-white dark:bg-dark-card text-slate-400 dark:text-slate-500 shadow-sm")}>
                          <Package size={18} />
                        </div>
                        <span className={clsx("font-bold text-sm", currentTask === 'inventory' ? "text-brand-blue" : "text-slate-600 dark:text-slate-300")}>Entregas de Stock</span>
                      </div>
                      {currentTask !== 'inventory' && <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                      {currentTask === 'inventory' && <div className="w-5 h-5 rounded-full border-[5px] border-brand-blue bg-white"></div>}
                    </button>
                    
                    {currentTask === 'inventory' && (
                      <div className="px-3.5 pb-4 animate-in fade-in slide-in-from-top-2">
                        <div className="h-[200px] overflow-y-auto pr-1 space-y-2 mb-3">
                          {productos.length === 0 ? (
                            <p className="text-xs text-center text-slate-500">Cargando catálogo...</p>
                          ) : productos.map(p => (
                            <div key={p.id_producto} className="flex items-center justify-between bg-slate-50 dark:bg-dark-card p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{p.nombre_producto}</p>
                                <p className="text-[10px] text-slate-500 font-medium">Stock Disp: <span className={p.stock_actual > 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{p.stock_actual}</span></p>
                              </div>
                              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                                <button onClick={() => handleQuantityChange(p.id_producto, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"><Minus size={14}/></button>
                                <span className="text-xs font-bold w-4 text-center">{entregasForm[p.id_producto] || 0}</span>
                                <button onClick={() => handleQuantityChange(p.id_producto, 1)} className="w-6 h-6 flex items-center justify-center bg-brand-blue text-white rounded shadow-sm shadow-brand-blue/30 active:scale-95 transition-transform"><Plus size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={handleSubmitEntregaMovil} 
                          disabled={isSubmittingEntrega || Object.keys(entregasForm).length === 0}
                          className="w-full bg-brand-blue hover:bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-50 active:scale-95 transition-transform flex justify-center gap-2"
                        >
                          {isSubmittingEntrega ? "Guardando..." : "Confirmar Entrega"}
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setCurrentTask('photos')}
                    className={clsx(
                      "flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-300",
                      currentTask === 'photos' ? "bg-brand-blue/5 border-brand-blue" : "bg-slate-50 dark:bg-dark-bg border-slate-200 dark:border-white/5 hover:border-brand-blue/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx("p-2.5 rounded-xl transition-colors", currentTask === 'photos' ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "bg-white dark:bg-dark-card text-slate-400 dark:text-slate-500 shadow-sm")}>
                        <Camera size={18} />
                      </div>
                      <span className={clsx("font-bold text-sm", currentTask === 'photos' ? "text-brand-blue" : "text-slate-600 dark:text-slate-300")}>Fotos de Góndola</span>
                    </div>
                    {currentTask !== 'photos' && <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                    {currentTask === 'photos' && <div className="w-5 h-5 rounded-full border-[5px] border-brand-blue bg-white"></div>}
                  </button>
                </div>

                <button 
                  onClick={handleFinishVisit}
                  className="mt-6 w-full bg-slate-900 dark:bg-brand-blue text-white py-4 rounded-2xl font-black text-sm shadow-xl flex justify-center items-center gap-2 transform active:scale-95 transition-transform"
                >
                  <CheckCircle size={20} /> Finalizar Visita
                </button>
              </div>
            )}
          </div>

          {/* Secuencia de la Ruta */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-5 flex justify-between items-center">
              <span className="tracking-tight">Secuencia de Visitas</span>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md uppercase">Lista API</span>
            </h3>
            
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-7">
              {loading ? (
                <p className="text-xs text-slate-500 pl-4">Cargando...</p>
              ) : routeTasks.map((task, i) => {
                const isCompleted = task.estado === 'completada';
                const isCurrent = task.id_ruta_punto === activePdv?.id_ruta_punto;

                return (
                  <div key={task.id_ruta_punto} className="relative pl-7 group">
                    {/* Timeline Dot */}
                    <div className={clsx(
                      "absolute -left-[11px] top-1.5 w-5 h-5 rounded-full ring-4 flex items-center justify-center transition-colors",
                      isCompleted ? "bg-brand-blue ring-slate-50 dark:ring-dark-bg shadow-sm" :
                      isCurrent ? "bg-amber-400 ring-slate-50 dark:ring-dark-bg shadow-md shadow-amber-400/40" :
                      "bg-slate-200 dark:bg-slate-700 ring-slate-50 dark:ring-dark-bg"
                    )}>
                      {isCompleted && <CheckCircle size={12} className="text-white" />}
                      {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                    
                    {/* Task Card */}
                    <div className={clsx(
                      "p-4 rounded-2xl border-2 transition-all duration-300",
                      isCurrent ? "bg-white dark:bg-dark-card border-amber-300 dark:border-amber-500/50 shadow-lg shadow-amber-500/5 -translate-y-1" : 
                      "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-dark-card/50"
                    )}>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">{task.pdv.codigo_gv}</span>
                        <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">Orden {task.orden}</span>
                      </div>
                      <h4 className={clsx(
                        "font-bold text-sm tracking-tight",
                        isCompleted ? "text-slate-400 dark:text-slate-600 line-through" : "text-slate-800 dark:text-slate-100"
                      )}>{task.pdv.nombre_pdv}</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Lat: {task.pdv.latitud.toFixed(3)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
      
      {/* Botón flotante para salir del simulador */}
      <a href="/" className="fixed top-8 right-8 glass-panel px-5 py-3 rounded-2xl shadow-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3 hover:scale-105 transition-transform z-50">
        <ChevronLeft size={20} className="text-brand-blue" /> Volver al Desktop
      </a>
    </div>
  );
}
