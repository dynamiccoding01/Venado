const BASE_URL = 'https://innovahack-gcrh.onrender.com';
const WS_BASE_URL = 'wss://innovahack-gcrh.onrender.com';

/**
 * Standard fetch wrapper for REST API calls
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Try to get token from localStorage
  let token = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      token = userData.token;
    }
  } catch (e) {
    // ignore
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
  getKpis: (fecha) => apiFetch(`/kpis/?fecha=${fecha}`),
  
  // Clima
  getClima: (lat, lon) => apiFetch(`/clima/${lat}/${lon}`),

  // Usuarios (CRUD & Auth)
  getUsuarios: () => apiFetch('/usuarios/'),
  crearUsuario: (data) => apiFetch('/usuarios/', { method: 'POST', body: JSON.stringify(data) }),
  actualizarUsuario: (id, data) => apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminarUsuario: (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' }),
  loginUsuario: async (email, password) => {
    return apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  logoutUsuario: async (token) => {
    return apiFetch('/logout', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  // PDVs
  getPdvs: async () => {
    return apiFetch('/pdvs/');
  },
  crearPdv: async (data) => {
    return apiFetch('/pdvs/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  actualizarPdv: async (id, data) => {
    return apiFetch(`/pdvs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Mercados
  getMercados: async () => {
    return apiFetch('/mercados/');
  },
  crearMercado: async (data) => {
    return apiFetch('/mercados/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // GPS / Tracking
  getPosicionesGps: async () => {
    return apiFetch('/gps/');
  },
  getUltimasUbicaciones: async () => {
    return apiFetch('/usuarios/reponedores/ultimas-ubicaciones');
  },
  getHistorialGps: async (id_usuario, fechaInicio, fechaFin) => {
    if (!fechaFin || fechaInicio === fechaFin) {
      return apiFetch(`/usuarios/${id_usuario}/gps?fecha=${fechaInicio}`);
    }
    
    const results = [];
    let currentStr = fechaInicio;
    
    while (currentStr <= fechaFin) {
      try {
        const data = await apiFetch(`/usuarios/${id_usuario}/gps?fecha=${currentStr}`);
        if (Array.isArray(data)) {
          results.push(...data);
        }
      } catch (e) {
        console.warn(`Error al consultar GPS para ${currentStr}`, e);
      }
      
      const d = new Date(currentStr + 'T12:00:00Z');
      d.setDate(d.getDate() + 1);
      currentStr = d.toISOString().split('T')[0];
    }
    
    return results.sort((a, b) => new Date(a.timestamp || a.creado_en) - new Date(b.timestamp || b.creado_en));
  },

  // Categorías
  getCategorias: async () => {
    return apiFetch('/categorias-cliente/');
  },
  crearCategoria: async (data) => {
    return apiFetch('/categorias-cliente/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
