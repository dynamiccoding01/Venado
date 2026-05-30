const BASE_URL = 'https://innovahack-gcrh.onrender.com';
const WS_BASE_URL = 'wss://innovahack-gcrh.onrender.com';

/**
 * Standard fetch wrapper for REST API calls
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMsg);
  }

  // 204 No Content doesn't have JSON body
  if (response.status === 204) return null;

  return response.json();
}

/**
 * Creates a WebSocket connection
 */
export function createWebSocket(path) {
  return new WebSocket(`${WS_BASE_URL}${path}`);
}

// --- API Endpoints ---

export const API = {
  // Rutas
  getRutas: () => apiFetch('/rutas/'),
  getRutaConPuntos: (id) => apiFetch(`/rutas/${id}`),
  crearRuta: (data) => apiFetch('/rutas/', { method: 'POST', body: JSON.stringify(data) }),
  optimizarRuta: (id) => apiFetch(`/rutas/${id}/optimizar`, { method: 'POST' }),

  // Visitas
  getVisitasPorRuta: (rutaId) => apiFetch(`/visitas/ruta/${rutaId}`),
  registrarTiempo: (visitaId, tiempoMin) => apiFetch(`/visitas/${visitaId}/registrar_tiempo`, { 
    method: 'POST', 
    body: JSON.stringify({ tiempo_real_min: tiempoMin }) 
  }),

  // Dashboard
  getMetrics: () => apiFetch('/dashboard/metrics'),
  getMetricasPorFecha: (fecha) => apiFetch(`/dashboard/metricas/${fecha}`),
  
  // Clima
  getClima: (lat, lon) => apiFetch(`/clima/${lat}/${lon}`),
};
