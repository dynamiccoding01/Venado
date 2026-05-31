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
    let url = `/usuarios/${id_usuario}/gps`;
    
    // Si se proveen fechas, se añaden los query parameters correspondientes.
    if (fechaInicio && fechaFin) {
      url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    } else if (fechaInicio) {
      url += `?fecha_inicio=${fechaInicio}`;
    }
    
    try {
      const data = await apiFetch(url);
      const result = Array.isArray(data) ? data : [];
      return result.sort((a, b) => new Date(a.timestamp || a.creado_en) - new Date(b.timestamp || b.creado_en));
    } catch (e) {
      console.warn(`Error al consultar historial GPS`, e);
      return [];
    }
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
  },
  // Catálogo y Entregas
  getCategoriasProductos: async () => {
    return apiFetch('/categorias-productos/');
  },
  createCategoriaProducto: async (data) => {
    return apiFetch('/categorias-productos/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getProductos: async (id_categoria = null) => {
    const url = id_categoria ? `/productos/?id_categoria=${id_categoria}` : '/productos/';
    return apiFetch(url);
  },
  createProducto: async (data) => {
    return apiFetch('/productos/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateProducto: async (id, data) => {
    return apiFetch(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteProducto: async (id) => {
    return apiFetch(`/productos/${id}`, {
      method: 'DELETE'
    });
  },
  registrarEntrega: async (data) => {
    return apiFetch('/entregas/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getHistorialEntregasPdv: async (id_pdv) => {
    return apiFetch(`/entregas/pdv/${id_pdv}`);
  }
};
