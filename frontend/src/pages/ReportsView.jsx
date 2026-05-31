import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, AlertTriangle, Clock, Route, ShieldAlert, Sparkles } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import clsx from 'clsx';

export function ReportsView() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadReports();
  }, [fecha]);

  const loadReports = async () => {
    setIsLoading(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Datos Ficticios basados en el modelo relacional (Tablas -> KPIs)
    setData({
      kpis_diarios: {
        pdvs_visitados: 95,
        pdvs_asignados: 120,
        cobertura_pct: 79.1,
        quiebres_stock: 12,
        incidencias_reportadas: 8,
        desviacion_tiempo_min: 45,
        desviacion_km: 12.5
      },
      rutas_eficiencia: {
        km_real: 154,
        km_estimado: 140,
        eficiencia_km_pct: 90.9
      },
      ahorros_redistribucion: {
        tiempo_min: 120,
        km: 35
      },
      impacto_clima: [
        { clima: 'Soleado', tiempo: 15 },
        { clima: 'Nublado', tiempo: 18 },
        { clima: 'Llovizna', tiempo: 28 },
        { clima: 'Tormenta', tiempo: 45 }
      ],
      tiempos_reponedores: [
        { nombre: 'Juan M.', estimado: 120, real: 145 },
        { nombre: 'Alexis R.', estimado: 180, real: 175 },
        { nombre: 'Maria G.', estimado: 150, real: 210 },
        { nombre: 'Pedro L.', estimado: 140, real: 140 },
        { nombre: 'Carla T.', estimado: 160, real: 185 }
      ],
      incidencias: [
        { name: 'Resueltas', value: 15, color: '#10b981' }, // emerald
        { name: 'Pendientes', value: 5, color: '#ef4444' } // red
      ],
      motivos_no_visita: [
        { name: 'Cerrado', value: 12, color: '#6366f1' }, // indigo
        { name: 'Sin Tiempo', value: 8, color: '#f59e0b' }, // amber
        { name: 'Fuera de Ruta', value: 5, color: '#8b5cf6' } // violet
      ],
      alertas_recalibracion: [
        { id: 'GV-1403', pdv: 'UPSA Mayorista', rep: 'Alexis', est: 15, real: 40, diff: 25, sug: 'Recalibrar a 35m' },
        { id: 'GV002', pdv: 'Tienda XYZ', rep: 'Juan', est: 20, real: 55, diff: 35, sug: 'Revisar Acceso' },
        { id: 'GV055', pdv: 'Micromercado Sol', rep: 'Maria', est: 10, real: 45, diff: 35, sug: 'Alta Demanda (Subir a 40m)' }
      ]
    });

    setIsLoading(false);
  };

  const handleExport = () => {
    if (!data) return;
    
    // Generación de CSV complejo
    const rows = [];
    rows.push(["REPORTE ANALITICO AVANZADO - INTELIGENCIA DE CAMPO"]);
    rows.push([`Fecha: ${fecha}`]);
    rows.push([]);
    
    // KPIs Diarios
    rows.push(["1. KPIS DIARIOS"]);
    rows.push(["Cobertura (%)", "PDVs Visitados", "PDVs Asignados", "Quiebres", "Incidencias", "Desviacion Tiempo (min)", "Desviacion Ruta (km)"]);
    rows.push([
      data.kpis_diarios.cobertura_pct, data.kpis_diarios.pdvs_visitados, data.kpis_diarios.pdvs_asignados,
      data.kpis_diarios.quiebres_stock, data.kpis_diarios.incidencias_reportadas,
      data.kpis_diarios.desviacion_tiempo_min, data.kpis_diarios.desviacion_km
    ]);
    rows.push([]);

    // Tiempos Reponedores
    rows.push(["2. TIEMPO REAL VS ESTIMADO (REPONEDORES)"]);
    rows.push(["Nombre", "Estimado (min)", "Real (min)", "Diferencia"]);
    data.tiempos_reponedores.forEach(r => {
      rows.push([r.nombre, r.estimado, r.real, r.real - r.estimado]);
    });
    rows.push([]);

    // Alertas de Recalibración
    rows.push(["3. ALERTAS DE RECALIBRACION (PDVS CON TIEMPO DESVIADO)"]);
    rows.push(["ID PDV", "Nombre PDV", "Reponedor", "T. Estimado", "T. Real", "Desviación", "Sugerencia del Algoritmo"]);
    data.alertas_recalibracion.forEach(a => {
      rows.push([a.id, `"${a.pdv}"`, a.rep, a.est, a.real, a.diff, `"${a.sug}"`]);
    });

    const csvContent = rows.map(r => r.join(";")).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Reporte_Inteligencia_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <p>Procesando inteligencia de campo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="text-brand-blue" />
            Centro de Inteligencia y KPIs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Análisis profundo de campo basado en métricas reales vs estimadas.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
            />
          </div>
          <button 
            onClick={handleExport}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download size={16} /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* 1. SECCIÓN: RESUMEN OPERATIVO (Tarjetas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cobertura Diaria */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-blue/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 relative z-10">Cobertura Diaria</p>
          <div className="flex items-end gap-2 mt-2 relative z-10">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">{data.kpis_diarios.cobertura_pct}%</h3>
            <span className="text-sm font-medium text-slate-400 mb-1">({data.kpis_diarios.pdvs_visitados}/{data.kpis_diarios.pdvs_asignados} PDVs)</span>
          </div>
        </div>

        {/* Quiebres e Incidencias */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Problemas de Campo</p>
            <ShieldAlert className="text-amber-500" size={18} />
          </div>
          <div className="mt-2 relative z-10">
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-500">{data.kpis_diarios.quiebres_stock + data.kpis_diarios.incidencias_reportadas}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">{data.kpis_diarios.quiebres_stock} Quiebres · {data.kpis_diarios.incidencias_reportadas} Alertas</p>
          </div>
        </div>

        {/* Eficiencia de Ruta */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Eficiencia Logística (Km)</p>
            <Route className="text-emerald-500" size={18} />
          </div>
          <div className="mt-2 relative z-10">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">{data.rutas_eficiencia.eficiencia_km_pct}%</h3>
            <p className="text-xs font-bold text-emerald-500 mt-1">Real: {data.rutas_eficiencia.km_real}km / Est: {data.rutas_eficiencia.km_estimado}km</p>
          </div>
        </div>

        {/* Ahorro por Redistribución */}
        <div className="bg-gradient-to-br from-brand-blue to-indigo-600 rounded-xl p-5 shadow-md relative overflow-hidden group text-white">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-sm font-bold text-blue-100">Ahorro del Algoritmo</p>
            <Sparkles className="text-amber-300" size={18} />
          </div>
          <div className="mt-2 relative z-10">
            <h3 className="text-3xl font-black">+{data.ahorros_redistribucion.tiempo_min} min</h3>
            <p className="text-xs font-bold text-blue-200 mt-1">También ahorró {data.ahorros_redistribucion.km} km en ruta</p>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN: GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tiempos Reales vs Estimados */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="text-brand-blue" size={18} />
            Tiempos de Visita: Real vs Estimado
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tiempos_reponedores} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="estimado" name="Tiempo Estimado (min)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="real" name="Tiempo Real (min)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impacto del Clima */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Impacto del Clima en Promedio de Visita</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.impacto_clima} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTiempo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="clima" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="tiempo" name="Minutos Promedio" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTiempo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. SECCIÓN: COMPOSICIÓN Y ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tasa de Resolución */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm text-center">Tasa de Resolución (Incidencias)</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.incidencias} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.incidencias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivos No Visita */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm text-center">Motivos de PDVs No Visitados</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.motivos_no_visita} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                  {data.motivos_no_visita.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas de Recalibración (Tabla) */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col overflow-hidden">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={18} />
            Alertas: Recalibración Urgente
          </h3>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {data.alertas_recalibracion.map((alerta, idx) => (
                <div key={idx} className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{alerta.pdv}</p>
                    <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                      +{alerta.diff} min
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Reponedor: {alerta.rep} (Est: {alerta.est}m / Real: {alerta.real}m)</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-500">
                    <Sparkles size={12} />
                    Sugerencia: {alerta.sug}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
